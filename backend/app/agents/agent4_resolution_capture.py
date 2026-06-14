import logging

from app.ingestion.ingestion_service import IngestionService
from app.models import Incident
from app.models.enums import IncidentState
from app.schemas import Agent4Response
from app.services.datafix_service import DatafixService
from app.services.incident_service import IncidentService

logger = logging.getLogger(__name__)


class Agent4ResolutionCapture:
    """Agent 4: captures a human resolution, ingests it as knowledge,
    and updates the incident state to RESOLVED in the mock data store.
    Also appends a datafix record when datafix details are provided.
    """

    PROMPT_MESSAGE = "Do you want to provide a resolution?"

    def __init__(self, ingestion_service: IngestionService | None = None) -> None:
        self._ingestion_service = ingestion_service

    def capture(
        self,
        *,
        incident: Incident,
        provide_resolution: bool | None = None,
        resolution_notes: str | None = None,
        datafix_description: str | None = None,
        datafix_code: str | None = None,
        workflow_context: dict | None = None,
    ) -> Agent4Response:
        try:
            logger.info("Agent4 started")
            logger.info("Prompting user for resolution")

            if provide_resolution is False:
                logger.info("No resolution provided")
                logger.info("Agent4 completed")
                return self._build_no_save_response(
                    "No resolution provided. Nothing was saved."
                )

            if not resolution_notes or not resolution_notes.strip():
                logger.info("No resolution provided")
                logger.info("Agent4 completed")
                return self._build_no_save_response(self.PROMPT_MESSAGE)

            logger.info("Resolution received")
            datafix_saved = self._has_datafix(datafix_description, datafix_code)
            datafix_id = (
                f"DFX-{incident.incident_number}" if datafix_saved else None
            )

            # ── Step 1: Ingest into Qdrant ───────────────────────────────────
            logger.info("Preparing ingestion payload")
            logger.info("Generating embedding")
            logger.info("Upserting record into Qdrant")
            self._get_ingestion_service().ingest_single_resolution(
                incident_number=incident.incident_number,
                short_description=incident.short_description,
                description=incident.description,
                resolution_notes=resolution_notes.strip(),
                assignment_group=incident.assignment_group,
                assigned_to=incident.assigned_to,
                created_date=incident.created_date.isoformat(),
                updated_date=incident.updated_date.isoformat(),
                datafix_id=datafix_id,
                datafix_description=self._clean_optional(datafix_description),
                datafix_code=self._clean_optional(datafix_code),
            )

            # ── Step 2: Resolve incident in mock data store ──────────────────
            logger.info(
                "Updating ticket %s state to RESOLVED in mock data store.",
                incident.incident_number,
            )
            updated_incident = IncidentService.resolve_incident(
                incident_number=incident.incident_number,
                resolution_notes=resolution_notes.strip(),
            )
            if updated_incident is None:
                logger.warning(
                    "Ticket %s not found in mock data — state not updated.",
                    incident.incident_number,
                )
            else:
                logger.info(
                    "Ticket %s successfully transitioned to RESOLVED.",
                    incident.incident_number,
                )

            # ── Step 3: Append datafix to mock data store ────────────────────
            if datafix_saved and datafix_id:
                existing_datafix = DatafixService.get_datafix_by_id(datafix_id)
                if existing_datafix is None:
                    DatafixService.append_datafix(
                        datafix_id=datafix_id,
                        incident_number=incident.incident_number,
                        description=self._clean_optional(datafix_description) or "",
                        datafix_code=self._clean_optional(datafix_code) or "",
                    )
                    logger.info(
                        "Datafix %s appended to mock data store.", datafix_id
                    )
                else:
                    logger.info(
                        "Datafix %s already exists — skipping append.", datafix_id
                    )

            logger.info("Resolution saved successfully")
            logger.info("Agent4 completed")
            return Agent4Response(
                success=True,
                message="Resolution captured and saved successfully. Ticket marked as RESOLVED.",
                saved=True,
                saved_incident_number=incident.incident_number,
                ingested_to_qdrant=True,
                incident_state_updated=updated_incident is not None,
                datafix_saved=datafix_saved,
                error=None,
            )

        except Exception as exc:
            logger.error("Agent4 failed: %s", str(exc))
            return Agent4Response(
                success=False,
                message="Failed to capture and save resolution.",
                saved=False,
                saved_incident_number=incident.incident_number,
                ingested_to_qdrant=False,
                datafix_saved=False,
                error=str(exc),
            )

    def _get_ingestion_service(self) -> IngestionService:
        if self._ingestion_service is None:
            self._ingestion_service = IngestionService()
        return self._ingestion_service

    @staticmethod
    def _build_no_save_response(message: str) -> Agent4Response:
        return Agent4Response(
            success=True,
            message=message,
            saved=False,
            saved_incident_number=None,
            ingested_to_qdrant=False,
            datafix_saved=False,
            error=None,
        )

    @staticmethod
    def _has_datafix(
        datafix_description: str | None,
        datafix_code: str | None,
    ) -> bool:
        return bool(
            (datafix_description and datafix_description.strip())
            or (datafix_code and datafix_code.strip())
        )

    @staticmethod
    def _clean_optional(value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None