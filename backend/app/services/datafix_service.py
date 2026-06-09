from backend.app.mock_data.datafixes import MOCK_DATAFIXES
from backend.app.models import Datafix


class DatafixService:
    @staticmethod
    def get_datafixes_by_incident_number(incident_number: str) -> list[Datafix]:
        return [
            datafix
            for datafix in MOCK_DATAFIXES
            if datafix.incident_number == incident_number
        ]

    @staticmethod
    def get_datafix_by_id(datafix_id: str) -> Datafix | None:
        return next(
            (
                datafix
                for datafix in MOCK_DATAFIXES
                if datafix.datafix_id == datafix_id
            ),
            None,
        )

