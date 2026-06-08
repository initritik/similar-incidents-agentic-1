from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from app.models import Datafix
from app.schemas import MessageResponse
from app.services import DatafixService
from app.utils import is_valid_incident_number

router = APIRouter(prefix="/api/datafixes", tags=["Datafixes"])


@router.get(
    "/{incident_number}",
    response_model=list[Datafix],
    summary="Get datafixes by incident number",
    description="Retrieve all mock datafix records associated with an incident.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Invalid incident number format.",
        },
    },
)
def get_datafixes(incident_number: str) -> list[Datafix] | JSONResponse:
    if not is_valid_incident_number(incident_number):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"message": "Invalid incident number format"},
        )

    return DatafixService.get_datafixes_by_incident_number(incident_number)

