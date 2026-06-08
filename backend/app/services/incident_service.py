from app.mock_data.incidents import MOCK_INCIDENTS
from app.models import Incident


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

