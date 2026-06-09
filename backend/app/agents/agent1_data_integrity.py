import logging
from datetime import datetime

from backend.app.models import Incident
from backend.app.schemas import Agent1Response
from backend.app.services import IncidentService
from backend.app.utils import is_valid_incident_number

logger = logging.getLogger(__name__)


class Agent1DataIntegrityChecker:
    mandatory_fields = (
        "incident_number",
        "short_description",
        "description",
        "state",
        "created_date",
        "updated_date",
    )

    def validate(self, incident_number: str) -> Agent1Response:
        logger.info("Agent 1 started")
        logger.info("Validating incident number")

        if not is_valid_incident_number(incident_number):
            logger.info("Validation failed")
            return Agent1Response(
                success=False,
                message=(
                    "Please enter a valid incident identifier in the format INC "
                    "followed by 6 digits."
                ),
            )

        logger.info("Fetching incident")
        incident = IncidentService.get_incident_by_number(incident_number)

        if incident is None:
            logger.info("Validation failed")
            return Agent1Response(success=False, message="Incident not found.")

        logger.info("Checking mandatory fields")
        missing_fields = self._get_missing_fields(incident)

        if missing_fields:
            logger.info("Validation failed")
            return Agent1Response(
                success=False,
                message=(
                    "THE INCIDENT has insufficient data to proceed further. "
                    "Required fields are missing."
                ),
                missing_fields=missing_fields,
            )

        logger.info("Validation passed")
        return Agent1Response(
            success=True,
            message="Incident data validated successfully.",
            incident=incident,
        )

    def _get_missing_fields(self, incident: Incident) -> list[str]:
        return [
            field_name
            for field_name in self.mandatory_fields
            if self._is_missing(getattr(incident, field_name, None))
        ]

    @staticmethod
    def _is_missing(value: object) -> bool:
        if value is None:
            return True

        if isinstance(value, str):
            return value.strip() == ""

        if isinstance(value, datetime):
            return False

        return False

