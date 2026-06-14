from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Incident
from app.schemas import MessageResponse
from app.services import IncidentService
from app.utils import is_valid_incident_number

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


@router.get(
    "/{incident_number}",
    response_model=Incident,
    summary="Get ticket by number",
    description="Retrieve a single incident from the mock incident dataset.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Invalid ticket number format.",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": MessageResponse,
            "description": "Ticket not found.",
        },
    },
)
def get_incident(incident_number: str) -> Incident | JSONResponse:
    if not is_valid_incident_number(incident_number):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid ticket number format"},
        )

    incident = IncidentService.get_incident_by_number(incident_number)

    if incident is None:
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content={"message": "Ticket not found"},
        )

    return incident

