import logging

from app.ingestion.ingestion_service import IngestionService
from app.vector_store.collection_initializer import CollectionInitializer

logger = logging.getLogger(__name__)


class IngestionRunner:
    """Orchestrator for the complete mock data ingestion pipeline."""

    @staticmethod
    def run() -> None:
        """
        Run the complete ingestion pipeline.

        Steps:
        1. Initialize Qdrant collection
        2. Ingest resolved incidents and datafixes with OpenAI embeddings
        3. Print summary
        """
        logger.info("=" * 80)
        logger.info("INGESTION PIPELINE STARTING")
        logger.info("=" * 80)

        try:
            # Step 1: Initialize collection
            logger.info("\n[Step 1] Initializing Qdrant collection...")
            CollectionInitializer.initialize()
            logger.info("[Step 1] ✓ Collection ready")

            # Step 2: Ingest data with OpenAI embeddings
            logger.info("\n[Step 2] Ingesting mock data with embeddings...")
            ingestion_service = IngestionService()
            summary = ingestion_service.ingest_mock_data()

            # Step 3: Summary already printed in ingest_mock_data
            logger.info("\n[Step 3] INGESTION SUMMARY")
            logger.info("-" * 80)
            logger.info(f"Total resolved incidents: {summary.total_resolved_incidents}")
            logger.info(f"  With datafixes: {summary.incidents_with_datafixes}")
            logger.info(f"  Without datafixes: {summary.incidents_without_datafixes}")
            logger.info(f"Successfully ingested: {summary.total_incidents_ingested}")
            logger.info(f"Failed batches: {summary.failed_count}")
            logger.info(f"Batch size: {summary.batch_size}")
            logger.info(f"Total batches: {summary.total_batches}")
            logger.info("-" * 80)
            logger.info("\n✓ INGESTION PIPELINE COMPLETED SUCCESSFULLY\n")

        except Exception as e:
            logger.error("\n" + "=" * 80)
            logger.error("✗ INGESTION PIPELINE FAILED")
            logger.error(f"Error: {str(e)}")
            logger.error("=" * 80)
            raise
