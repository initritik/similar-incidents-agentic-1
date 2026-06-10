import logging

from fastapi import APIRouter, HTTPException, status

from app.agents import Agent1DataIntegrityChecker
from app.schemas import Agent1Response, Agent1ValidationRequest
from app.utils.validators import is_valid_incident_number

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents/agent1", tags=["Agent 1"])


@router.post(
    "/validate",
    response_model=Agent1Response,
    status_code=status.HTTP_200_OK,
    summary="Validate incident data integrity",
    description=(
        "Run Agent 1 data integrity checks against a mock incident record. "
        "This endpoint validates the incident number, retrieves the incident, "
        "and checks mandatory fields only."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": Agent1Response,
            "description": "Invalid incident identifier format.",
        },
    },
)
def validate_incident(request: Agent1ValidationRequest) -> Agent1Response:
    """
    Validate incident data integrity for the given incident number.

    Args:
        request: Request containing incident_number to validate.

    Returns:
        Agent1Response with success status and incident details if valid.
    """
    # Pre-validate incident number format
    if not is_valid_incident_number(request.incident_number):
        logger.warning(f"Invalid incident number format: {request.incident_number}")
        return Agent1Response(
            success=False,
            message="Invalid incident identifier format. Expected format: INC followed by 6 digits (e.g., INC000001).",
        )

    try:
        agent = Agent1DataIntegrityChecker()
        result = agent.validate(request.incident_number)
        logger.info(f"Agent1 validation completed: {result.success}")
        return result
    except Exception as e:
        logger.error(f"Agent1 validation failed: {str(e)}", exc_info=True)
        return Agent1Response(
            success=False,
            message=f"Data integrity check failed: {str(e)}",
        )

