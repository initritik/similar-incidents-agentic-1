from fastapi import APIRouter

from app.agents import Agent1DataIntegrityChecker
from app.schemas import Agent1Response, Agent1ValidationRequest

router = APIRouter(prefix="/api/agents/agent1", tags=["Agent 1"])


@router.post(
    "/validate",
    response_model=Agent1Response,
    summary="Validate incident data integrity",
    description=(
        "Run Agent 1 data integrity checks against a mock incident record. "
        "This endpoint validates the incident number, retrieves the incident, "
        "and checks mandatory fields only."
    ),
)
def validate_incident(request: Agent1ValidationRequest) -> Agent1Response:
    agent = Agent1DataIntegrityChecker()
    return agent.validate(request.incident_number)

