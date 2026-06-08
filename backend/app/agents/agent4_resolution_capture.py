import logging
from datetime import datetime
from uuid import uuid4
from typing import Optional
from types import SimpleNamespace

from app.mock_data.incidents import MOCK_INCIDENTS
from app.mock_data.datafixes import MOCK_DATAFIXES
from app.models.enums import IncidentState
from app.ingestion.ingestion_service import IngestionService
from app.schemas.agent4_schemas import Agent4ResolutionRequest, Agent4Response

logger = logging.getLogger(__name__)

class Agent4ResolutionCapture:
    """
    Agent 4: Resolution Capture and Knowledge Base Ingestion.
    Handles user-provided resolutions for incidents with no similar matches.
    """
    
    def __init__(self):
        self.ingestion_service = IngestionService()

    def capture_resolution(self, request: Agent4ResolutionRequest) -> Agent4Response:
        """
        Captures resolution, updates incident, creates datafix, and triggers ingestion.
        """
        incident_number = request.incident_number
        resolution_notes = request.resolution_notes.strip()
        datafix_code = request.optional_datafix_code

        # 1. Validation: Ensure resolution notes are not just whitespace
        if not resolution_notes:
            return Agent4Response(
                success=False,
                message="Resolution notes are required.",
                incident_number=incident_number,
                knowledge_base_updated=False,
                qdrant_upsert_completed=False
            )

        # 2. Find incident in the mock dataset
        incident = next((i for i in MOCK_INCIDENTS if i.incident_number == incident_number), None)
        if not incident:
            return Agent4Response(
                success=False,
                message=f"Incident {incident_number} not found in the dataset.",
                incident_number=incident_number,
                knowledge_base_updated=False,
                qdrant_upsert_completed=False
            )

        # 3. Update Incident State to RESOLVED
        incident.state = IncidentState.RESOLVED
        incident.resolution_notes = resolution_notes
        incident.updated_date = datetime.now()

        # 4. Create Datafix record if optional code is provided
        if datafix_code and datafix_code.strip():
            new_datafix_id = f"DFX{str(uuid4())[:8].upper()}"
            # Create a mock record matching the expected attributes in ingestion_service
            new_datafix = SimpleNamespace(
                datafix_id=new_datafix_id,
                description=f"User-provided datafix for {incident_number}",
                datafix_code=datafix_code,
                incident_number=incident_number
            )
            MOCK_DATAFIXES.append(new_datafix)
            logger.info(f"Created new Datafix {new_datafix_id} for incident {incident_number}")

        # 5. Incremental Knowledge Base Ingestion
        # This makes the incident searchable immediately in Qdrant
        upsert_success = self.ingestion_service.ingest_single_incident(incident_number)

        return Agent4Response(
            success=True,
            message="Resolution captured successfully and added to the knowledge base.",
            incident_number=incident_number,
            knowledge_base_updated=True,
            qdrant_upsert_completed=upsert_success
        )