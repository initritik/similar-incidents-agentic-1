import logging

from app.vector_store.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class CollectionInitializer:
    """Initialize and prepare Qdrant collection for ingestion and search."""

    @staticmethod
    def initialize(vector_size: int = 1536) -> None:
        """
        Initialize the Qdrant collection.

        Verifies Qdrant connectivity and creates collection if missing.

        Args:
            vector_size: Dimension of the embedding vectors.

        Raises:
            Exception: If Qdrant is unreachable or collection creation fails.
        """
        try:
            logger.info("Initializing Qdrant collection...")
            qdrant_service = QdrantService()

            logger.info("Verifying Qdrant connectivity...")
            # Test connection
            qdrant_service.collection_exists()

            logger.info("Qdrant connectivity verified. Creating collection if needed...")
            qdrant_service.create_collection(vector_size=vector_size)

            logger.info("Collection initialization completed successfully")
        except Exception as e:
            logger.error(f"Failed to initialize collection: {str(e)}")
            raise
