from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from backend.app.orchestrator import (
    StartWorkflowRequest,
    WorkflowExecution,
    WorkflowOrchestrator,
    workflow_store,
)
from backend.app.schemas import MessageResponse

router = APIRouter(prefix="/api/workflows", tags=["Workflows"])


@router.post(
    "/start",
    response_model=WorkflowExecution,
    summary="Start incident resolution workflow",
    description=(
        "Create a workflow run, execute Agent 1 data integrity validation, "
        "store workflow status, and return the current workflow details."
    ),
)
def start_workflow(request: StartWorkflowRequest) -> WorkflowExecution:
    orchestrator = WorkflowOrchestrator()
    return orchestrator.start_workflow(request.incident_number)


@router.get(
    "/{workflow_id}",
    response_model=WorkflowExecution,
    summary="Get workflow status",
    description="Retrieve current workflow progress and agent status details.",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "model": MessageResponse,
            "description": "Workflow not found.",
        },
    },
)
def get_workflow(workflow_id: str) -> WorkflowExecution | JSONResponse:
    workflow = workflow_store.get_workflow(workflow_id)

    if workflow is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Workflow not found"},
        )

    return workflow

