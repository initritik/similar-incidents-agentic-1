"""
resolve_routes.py
-----------------
POST /api/incidents/{incident_number}/resolve

Marks an incident as RESOLVED and optionally appends a new datafix entry.
Called automatically by Agent 4 after successfully ingesting a resolution,
and can also be called directly if needed.
"""
import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.models import Incident
from app.services.datafix_service import DatafixService
from app.services.incident_service import IncidentService
from app.utils.validators import is_valid_incident_number

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/incidents", tags=["Incidents"])


# ── Request / Response schemas ────────────────────────────────────────────────


class ResolveIncidentRequest(BaseModel):
    resolution_notes: str = Field(
        ...,
        min_length=1,
        description="Human-readable notes describing how the ticket was resolved.",
    )
    datafix_id: str | None = Field(
        default=None,
        description="Identifier for the associated datafix (e.g. DFX-INC000005).",
    )
    datafix_description: str | None = Field(
        default=None,
        description="Short description of the datafix that was applied.",
    )
    datafix_code: str | None = Field(
        default=None,
        description="SQL / script content of the datafix.",
    )


class ResolveIncidentResponse(BaseModel):
    success: bool
    message: str
    incident: Incident
    datafix_appended: bool
    datafix_id: str | None = None


# ── Route ─────────────────────────────────────────────────────────────────────


@router.post(
    "/{incident_number}/resolve",
    response_model=ResolveIncidentResponse,
    status_code=status.HTTP_200_OK,
    summary="Resolve a ticket and optionally record a datafix",
    description=(
        "Transitions the ticket state from OPEN or WORK_IN_PROGRESS to RESOLVED, "
        "persists the resolution notes, and — when datafix details are supplied — "
        "appends a new entry to the datafix store.  "
        "This endpoint is called automatically by Agent 4 after a successful "
        "knowledge-base ingestion."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {"description": "Invalid ticket number format."},
        status.HTTP_404_NOT_FOUND: {"description": "Ticket not found."},
    },
)
def resolve_incident(
    incident_number: str,
    request: ResolveIncidentRequest,
) -> ResolveIncidentResponse:
    incident_number = incident_number.upper()

    if not is_valid_incident_number(incident_number):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Invalid ticket identifier format. "
                "Expected INC000001 or SCTASK005."
            ),
        )

    # ── Update incident state ─────────────────────────────────────────────────
    updated_incident = IncidentService.resolve_incident(
        incident_number=incident_number,
        resolution_notes=request.resolution_notes,
    )
    if updated_incident is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ticket {incident_number} not found.",
        )

    # ── Optionally append datafix ─────────────────────────────────────────────
    datafix_appended = False
    datafix_id: str | None = None

    has_datafix = bool(
        (request.datafix_description and request.datafix_description.strip())
        or (request.datafix_code and request.datafix_code.strip())
    )

    if has_datafix:
        datafix_id = request.datafix_id or f"DFX-{incident_number}"

        # Avoid duplicate entries if called more than once (idempotent behaviour)
        existing = DatafixService.get_datafix_by_id(datafix_id)
        if existing is None:
            DatafixService.append_datafix(
                datafix_id=datafix_id,
                incident_number=incident_number,
                description=request.datafix_description or "",
                datafix_code=request.datafix_code or "",
            )
            datafix_appended = True
            logger.info(
                "Datafix %s appended for resolved ticket %s.",
                datafix_id,
                incident_number,
            )
        else:
            logger.info(
                "Datafix %s already exists — skipping duplicate append.", datafix_id
            )
            datafix_appended = False  # already present; not a new append

    return ResolveIncidentResponse(
        success=True,
        message=(
            f"Ticket {incident_number} resolved successfully."
            + (f" Datafix {datafix_id} recorded." if datafix_appended else "")
        ),
        incident=updated_incident,
        datafix_appended=datafix_appended,
        datafix_id=datafix_id,
    )