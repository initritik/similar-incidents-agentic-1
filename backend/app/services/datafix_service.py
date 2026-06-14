import logging

from app.mock_data.datafixes import MOCK_DATAFIXES
from app.models import Datafix

logger = logging.getLogger(__name__)


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

    @staticmethod
    def append_datafix(
        datafix_id: str,
        incident_number: str,
        description: str,
        datafix_code: str,
    ) -> Datafix:
        """
        Append a new Datafix entry to the in-memory MOCK_DATAFIXES list.

        In a production system this would persist to a database.  Here we mutate
        the module-level list so that subsequent GET calls return the new entry
        within the same process lifetime.

        Returns the newly created Datafix.
        """
        new_datafix = Datafix(
            datafix_id=datafix_id,
            incident_number=incident_number,
            description=description.strip(),
            datafix_code=datafix_code.strip(),
        )
        MOCK_DATAFIXES.append(new_datafix)
        logger.info(
            "Datafix %s appended for incident %s.", datafix_id, incident_number
        )
        return new_datafix