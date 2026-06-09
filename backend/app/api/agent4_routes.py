from fastapi import APIRouter

from app.agents import Agent4ResolutionCapture
from app.schemas import Agent4ResolutionCaptureRequest, Agent4Response
from app.services import IncidentService

router = APIRouter(prefix="/api/agents/agent4", tags=["Agent 4"])


@router.post(
    "/capture",
    response_model=Agent4Response,
    summary="Capture a new incident resolution",
    description=(
        "Run Agent 4 to capture user-provided resolution notes and ingest the "
        "resulting knowledge record through the ingestion service."
    ),
)
def capture_resolution(request: Agent4ResolutionCaptureRequest) -> Agent4Response:
    incident = IncidentService.get_incident_by_number(request.incident_number)

    if incident is None:
        return Agent4Response(
            success=False,
            message="Incident not found.",
            saved=False,
            saved_incident_number=None,
            ingested_to_qdrant=False,
            datafix_saved=False,
            error="Incident not found.",
        )

    agent = Agent4ResolutionCapture()
    return agent.capture(
        incident=incident,
        provide_resolution=request.provide_resolution,
        resolution_notes=request.resolution_notes,
        datafix_description=request.datafix_description,
        datafix_code=request.datafix_code,
    )
