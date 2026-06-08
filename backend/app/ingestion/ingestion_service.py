import hashlib
import logging
import os
from datetime import datetime

from qdrant_client.http import models

from app.ingestion.ingestion_models import IngestionSummary, IncidentIngestionRecord
from app.mock_data.datafixes import MOCK_DATAFIXES
from app.mock_data.incidents import MOCK_INCIDENTS
from app.models.enums import IncidentState
from app.vector_store.embedding_service import EmbeddingService
from app.vector_store.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class IngestionService:
    """Service for ingesting resolved incidents and datafixes into Qdrant."""

    def __init__(self):
        self.qdrant_service = QdrantService()
        self.embedding_service = EmbeddingService()
        self.batch_size = int(os.getenv("INGESTION_BATCH_SIZE", "10"))

    def ingest_data(self) -> IngestionSummary:
        """
        Ingest resolved incidents and datafixes into Qdrant.

        Process:
        1. Load incidents from mock data
        2. Filter only RESOLVED incidents
        3. Match each incident with its datafix
        4. Generate embeddings
        5. Upsert in batches
        6. Return summary

        Returns:
            IngestionSummary with ingestion statistics.

        Raises:
            Exception: If ingestion process fails.
        """
        logger.info("Starting ingestion process")
        logger.info(f"Batch size: {self.batch_size}")

        try:
            # Collect resolved incidents with their datafixes
            records = self._collect_ingestion_records()
            logger.info(f"Collected {len(records)} resolved incidents for ingestion")

            # Track statistics
            total_resolved = len(records)
            with_datafix = sum(1 for r in records if r.datafix_id)
            without_datafix = total_resolved - with_datafix

            # Process in batches
            failed_count = 0
            total_batches = (len(records) + self.batch_size - 1) // self.batch_size
            logger.info(f"Total batches to process: {total_batches}")

            for batch_num, batch in enumerate(
                self._batch_records(records, self.batch_size), 1
            ):
                try:
                    logger.info(f"Processing batch {batch_num}/{total_batches}")
                    self._process_batch(batch)
                    logger.info(f"Batch {batch_num}/{total_batches} completed successfully")
                except Exception as e:
                    logger.error(f"Batch {batch_num} failed: {str(e)}")
                    failed_count += 1

            logger.info("Ingestion process completed")

            summary = IngestionSummary(
                total_resolved_incidents=total_resolved,
                incidents_with_datafixes=with_datafix,
                incidents_without_datafixes=without_datafix,
                total_incidents_ingested=total_resolved - failed_count,
                failed_count=failed_count,
                batch_size=self.batch_size,
                total_batches=total_batches,
            )

            return summary

        except Exception as e:
            logger.error(f"Ingestion process failed: {str(e)}")
            raise

    def _collect_ingestion_records(self) -> list[IncidentIngestionRecord]:
        """
        Collect all resolved incidents with their datafixes.

        Returns:
            List of IncidentIngestionRecord objects.
        """
        records = []

        for incident in MOCK_INCIDENTS:
            # Only ingest RESOLVED incidents
            if incident.state != IncidentState.RESOLVED:
                logger.debug(
                    f"Skipping {incident.incident_number} (state: {incident.state})"
                )
                continue

            # Find matching datafix
            datafix = None
            for df in MOCK_DATAFIXES:
                if df.incident_number == incident.incident_number:
                    datafix = df
                    break

            # Create ingestion record
            record = IncidentIngestionRecord(
                incident_number=incident.incident_number,
                short_description=incident.short_description,
                description=incident.description,
                state=incident.state.value,
                resolution_notes=incident.resolution_notes,
                assignment_group=incident.assignment_group,
                assigned_to=incident.assigned_to,
                created_date=incident.created_date.isoformat(),
                updated_date=incident.updated_date.isoformat(),
                datafix_id=datafix.datafix_id if datafix else None,
                datafix_description=datafix.description if datafix else None,
                datafix_code=datafix.datafix_code if datafix else None,
            )
            records.append(record)

        logger.info(f"Collected {len(records)} resolved incidents")
        return records

    def _batch_records(
        self, records: list[IncidentIngestionRecord], batch_size: int
    ) -> list[list[IncidentIngestionRecord]]:
        """
        Split records into batches.

        Args:
            records: List of records to batch.
            batch_size: Size of each batch.

        Yields:
            Batches of records.
        """
        for i in range(0, len(records), batch_size):
            yield records[i : i + batch_size]

    def _process_batch(self, batch: list[IncidentIngestionRecord]) -> None:
        """
        Process a batch of ingestion records.

        For each record:
        1. Generate embedding from short_description + description
        2. Create payload with all incident and datafix data
        3. Create PointStruct with unique ID
        4. Upsert to Qdrant

        Args:
            batch: Batch of IncidentIngestionRecord objects.

        Raises:
            Exception: If batch processing fails.
        """
        points = []

        for record in batch:
            try:
                # Build embedding input
                embedding_input = f"{record.short_description} {record.description}".strip()

                # Generate embedding
                embedding = self.embedding_service.generate_embedding(embedding_input)

                # Create unique point ID from incident_number
                point_id = self._generate_point_id(record.incident_number)

                # Create payload
                payload = {
                    "incident_number": record.incident_number,
                    "short_description": record.short_description,
                    "description": record.description,
                    "state": record.state,
                    "resolution_notes": record.resolution_notes,
                    "assignment_group": record.assignment_group,
                    "assigned_to": record.assigned_to,
                    "created_date": record.created_date,
                    "updated_date": record.updated_date,
                    "datafix_id": record.datafix_id,
                    "datafix_description": record.datafix_description,
                    "datafix_code": record.datafix_code,
                }

                # Create point
                point = models.PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload,
                )
                points.append(point)

                logger.debug(f"Prepared point for {record.incident_number}")

            except Exception as e:
                logger.error(
                    f"Failed to prepare point for {record.incident_number}: {str(e)}"
                )
                raise

        # Upsert batch
        self.qdrant_service.upsert_batch(points)

    def _generate_point_id(self, incident_number: str) -> int:
        """
        Generate a unique point ID from incident number.

        Uses hash to create a deterministic ID, ensuring idempotency.

        Args:
            incident_number: The incident number.

        Returns:
            Integer ID for the point.
        """
        hash_object = hashlib.md5(incident_number.encode())
        hash_int = int(hash_object.hexdigest(), 16)
        # Keep it within a reasonable range for point IDs
        point_id = hash_int % (2**31 - 1)
        return point_id
