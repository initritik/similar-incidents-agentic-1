import logging
from datetime import UTC, datetime

from app.mock_data.incidents import MOCK_INCIDENTS
from app.models import Incident
from app.models.enums import IncidentState

logger = logging.getLogger(__name__)


class IncidentService:
    @staticmethod
    def get_incident_by_number(incident_number: str) -> Incident | None:
        return next(
            (
                incident
                for incident in MOCK_INCIDENTS
                if incident.incident_number == incident_number
            ),
            None,
        )

    @staticmethod
    def resolve_incident(
        incident_number: str,
        resolution_notes: str,
    ) -> Incident | None:
        """
        Mark an incident as RESOLVED and set its resolution notes.

        Mutates the in-memory MOCK_INCIDENTS list in-place so that subsequent
        vector-search results reflect the resolved state.  In a production system
        this would issue a PATCH/PUT to the ServiceNow API.

        Returns the updated Incident, or None if not found.
        """
        for idx, incident in enumerate(MOCK_INCIDENTS):
            if incident.incident_number == incident_number:
                if incident.state == IncidentState.RESOLVED:
                    logger.info(
                        "Incident %s is already RESOLVED — updating resolution notes.",
                        incident_number,
                    )

                updated = incident.model_copy(
                    update={
                        "state": IncidentState.RESOLVED,
                        "resolution_notes": resolution_notes.strip(),
                        "updated_date": datetime.now(UTC),
                    }
                )
                MOCK_INCIDENTS[idx] = updated
                logger.info(
                    "Incident %s state updated to RESOLVED.", incident_number
                )
                return updated

        logger.warning("Incident %s not found — cannot resolve.", incident_number)
        return None