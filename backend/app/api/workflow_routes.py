import logging

from fastapi import APIRouter, HTTPException, status

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


@router.post(
    "/start",
    response_model=WorkflowExecution,
    status_code=status.HTTP_200_OK,
    summary="Start incident resolution workflow",
    description=(
        "Create a workflow run, execute Agent 1 data integrity validation, "
        "store workflow status, and return the current workflow details."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Invalid incident identifier format.",
        },
        status.HTTP_422_UNPROCESSABLE_ENTITY: {
            "model": MessageResponse,
            "description": "Request validation failed.",
        },
    },
)
def start_workflow(request: StartWorkflowRequest) -> WorkflowExecution:
    """
    Start a new incident resolution workflow.

    Validates the incident identifier, executes the full 5-agent pipeline,
    and returns the complete workflow execution state.

    Args:
        request: StartWorkflowRequest with incident_number and optional resolution data.

    Returns:
        WorkflowExecution with workflow_id, agent_statuses, and agent_results.

    Raises:
        HTTPException: If incident identifier is invalid or workflow creation fails.
    """
    # Validate incident number format
    if not is_valid_incident_number(request.incident_number):
        logger.warning(f"Invalid incident number format: {request.incident_number}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid incident identifier format. Expected format: INC followed by 6 digits (e.g., INC000001).",
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

    Returns the latest workflow execution state including agent statuses
    and results. If the workflow does not exist, returns 404.

    Args:
        workflow_id: The unique workflow identifier (UUID format).

    Returns:
        WorkflowExecution with current status and agent results.

    Raises:
        HTTPException: If workflow not found (404).
    """
    workflow = workflow_store.get_workflow(workflow_id)

    if workflow is None:
        logger.warning(f"Workflow not found: {workflow_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow {workflow_id} not found.",
        )

    return workflow

