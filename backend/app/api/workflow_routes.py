import json
import logging
import threading
from queue import Empty, Queue

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse

from app.orchestrator import (
    StartWorkflowRequest,
    WorkflowExecution,
    WorkflowOrchestrator,
    workflow_store,
)
from app.schemas import MessageResponse
from app.utils.validators import is_valid_incident_number

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])


# ── Helpers ───────────────────────────────────────────────────────────────────

def _sse_line(event_type: str, data: dict) -> str:
    """Format a single SSE message."""
    payload = json.dumps(data, default=str)
    return f"event: {event_type}\ndata: {payload}\n\n"


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/start",
    response_model=WorkflowExecution,
    status_code=status.HTTP_200_OK,
    summary="Start ticket resolution workflow",
    description=(
        "Create a workflow run, execute Agent 1 data integrity validation, "
        "store workflow status, and return the current workflow details."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Invalid ticket identifier format.",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "model": MessageResponse,
            "description": "Request validation failed.",
        },
    },
)
def start_workflow(request: StartWorkflowRequest) -> WorkflowExecution:
    """
    Start a new ticket resolution workflow.

    Validates the ticket identifier, executes the full 5-agent pipeline,
    and returns the complete workflow execution state.
    """
    if not is_valid_incident_number(request.incident_number):
        logger.warning(f"Invalid ticket number format: {request.incident_number}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket identifier format. Expected format: INC000001 or SCTASK005.",
        )

    try:
        orchestrator = WorkflowOrchestrator()
        workflow = orchestrator.start_workflow(
            incident_number=request.incident_number,
            provide_resolution=request.provide_resolution,
            resolution_notes=request.resolution_notes,
            datafix_description=request.datafix_description,
            datafix_code=request.datafix_code,
        )
        logger.info(f"Workflow started: {workflow.workflow_id}")
        return workflow
    except ValueError as e:
        logger.error(f"Workflow validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Workflow creation failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start workflow. Please try again later.",
        )


@router.get(
    "/{workflow_id}",
    response_model=WorkflowExecution,
    status_code=status.HTTP_200_OK,
    summary="Get workflow status",
    description="Retrieve current workflow progress and agent status details.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": MessageResponse,
            "description": "Workflow not found.",
        },
    },
)
def get_workflow(workflow_id: str) -> WorkflowExecution:
    """
    Retrieve the current state of a workflow by ID.
    """
    workflow = workflow_store.get_workflow(workflow_id)

    if workflow is None:
        logger.warning(f"Workflow not found: {workflow_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow {workflow_id} not found.",
        )

    return workflow


@router.post(
    "/stream",
    summary="Start a workflow and stream agent events via SSE",
    description=(
        "Starts the ticket resolution pipeline and streams real-time agent status "
        "updates as Server-Sent Events. Each event contains agent name, status, "
        "current task, message, and result data as it becomes available."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Invalid ticket identifier format.",
        },
    },
)
def stream_workflow(request: StartWorkflowRequest) -> StreamingResponse:
    """
    Start a workflow and stream all agent events as Server-Sent Events.

    Event types emitted:
    - ``workflow_created``  – fired once when the workflow is initialised
    - ``agent_status_update`` – fired whenever an agent changes state
                                (RUNNING → COMPLETED / FAILED / SKIPPED)
    - ``agent_result``      – fired when an agent stores its structured result
    - ``workflow_done``     – final event; payload contains the full WorkflowExecution
    - ``error``             – emitted if something goes wrong before the stream closes
    """
    if not is_valid_incident_number(request.incident_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ticket identifier format. Expected format: INC000001 or SCTASK005.",
        )

    # A thread-safe queue bridges the orchestrator thread → generator
    event_queue: Queue[tuple[str, dict] | None] = Queue()

    def on_event(workflow_id: str, event_type: str, data: dict) -> None:
        event_queue.put((event_type, data))

    def run_orchestrator() -> None:
        """Runs in a background thread so the HTTP response can stream immediately."""
        try:
            orchestrator = WorkflowOrchestrator()

            # We need the workflow_id to register the callback before the
            # orchestrator starts touching agents.  We hook into create_workflow
            # by temporarily monkey-patching the store — clean approach: wrap.
            original_create = orchestrator.status_store.create_workflow

            def patched_create(incident_number: str):
                workflow = original_create(incident_number)
                # Register callback now that we have the workflow_id
                orchestrator.status_store.register_sse_callback(
                    workflow.workflow_id, on_event
                )
                return workflow

            orchestrator.status_store.create_workflow = patched_create  # type: ignore[method-assign]

            final_workflow = orchestrator.start_workflow(
                incident_number=request.incident_number,
                provide_resolution=request.provide_resolution,
                resolution_notes=request.resolution_notes,
                datafix_description=request.datafix_description,
                datafix_code=request.datafix_code,
            )

            # Emit final event with the complete workflow snapshot
            event_queue.put(("workflow_done", final_workflow.model_dump(mode="json")))
        except Exception as exc:
            logger.error(f"Stream workflow error: {exc}", exc_info=True)
            event_queue.put(("error", {"message": str(exc)}))
        finally:
            event_queue.put(None)  # Sentinel → generator knows to stop

    # Start orchestrator in background thread
    thread = threading.Thread(target=run_orchestrator, daemon=True)
    thread.start()

    def event_generator():
        """Generator consumed by StreamingResponse."""
        while True:
            try:
                item = event_queue.get(timeout=60)  # 60 s hard timeout
            except Empty:
                yield _sse_line("error", {"message": "Stream timed out"})
                break

            if item is None:  # Sentinel
                break

            event_type, data = item
            yield _sse_line(event_type, data)

            if event_type in ("workflow_done", "error"):
                break

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
        },
    )