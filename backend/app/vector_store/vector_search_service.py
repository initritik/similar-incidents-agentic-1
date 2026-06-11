import logging

from app.models.datafix import Datafix
from app.models.incident import Incident
from app.models.similar_incident import SimilarIncidentResult
from app.services.datafix_service import DatafixService
from app.vector_store.embedding_service import EmbeddingService
from app.vector_store.qdrant_service import QdrantService

logger = logging.getLogger(__name__)


class VectorSearchService:
    """Service for semantic similarity search using vector embeddings."""

    def __init__(self):
        self.embedding_service = EmbeddingService()
        self.qdrant_service = QdrantService()

    def search_similar_incidents(
        self,
        incident: Incident,
        limit: int = 5,
        score_threshold: float = 0.5,
    ) -> list[dict]:
        """
        Search for incidents similar to the provided incident.

        Args:
            incident: The incident to find similar matches for.
            limit: Maximum number of results to return.
            score_threshold: Minimum similarity score (0.3 = 30%).

        Returns:
            List of dicts containing incident details, similarity score, and associated datafixes.

        Raises:
            Exception: If search fails.
        """
        try:
            logger.info(f"Searching for incidents similar to {incident.incident_number}")

            # Create embedding input from short_description and description
            embedding_input = self._build_embedding_input(incident)
            logger.debug("Built embedding input for search")

            # Generate embedding for the search
            query_embedding = self.embedding_service.generate_embedding(embedding_input)
            logger.debug("Generated query embedding")

            # Search Qdrant
            scored_points = self.qdrant_service.search_similar_incidents(
                query_embedding=query_embedding,
                limit=limit,
                score_threshold=score_threshold,
            )

            if not scored_points:
                logger.info("No similar incidents found")
                return []

            # Build results with incident and datafix information
            results = []
            for scored_point in scored_points:
                result = self._build_result(scored_point)
                results.append(result)

            logger.info(f"Found {len(results)} similar incidents")
            return results

        except Exception as e:
            logger.error(f"Failed to search similar incidents: {str(e)}")
            raise

    def _build_embedding_input(self, incident: Incident) -> str:
        """
        Build the text to embed from incident fields.

        Args:
            incident: The incident to extract text from.

        Returns:
            Combined text from short_description and description.
        """
        parts = [
            incident.short_description or "",
            incident.description or "",
        ]
        text = " ".join(parts).strip()
        return text

    def _build_result(self, scored_point) -> dict:
        """
        Build a result dict from a scored point.

        Args:
            scored_point: A ScoredPoint from Qdrant.

        Returns:
            Dict with incident details, similarity score, and associated datafixes.
        """
        payload = scored_point.payload
        similarity_score = scored_point.score

        # Build incident data from payload
        incident_data = {
            "incident_number": payload.get("incident_number"),
            "short_description": payload.get("short_description"),
            "description": payload.get("description"),
            "state": payload.get("state"),
            "resolution_notes": payload.get("resolution_notes"),
            "assignment_group": payload.get("assignment_group"),
            "assigned_to": payload.get("assigned_to"),
            "created_date": payload.get("created_date"),
            "updated_date": payload.get("updated_date"),
        }

        # Get associated datafix
        datafix = None
        datafix_id = payload.get("datafix_id")
        if datafix_id:
            datafix = DatafixService.get_datafix_by_id(datafix_id)

        datafix_data = None
        if datafix:
            datafix_data = {
                "datafix_id": datafix.datafix_id,
                "description": datafix.description,
                "datafix_code": datafix.datafix_code,
            }

        return {
            "incident_number": incident_data["incident_number"],
            "short_description": incident_data["short_description"],
            "description": incident_data["description"],
            "state": incident_data["state"],
            "resolution_notes": incident_data["resolution_notes"],
            "assignment_group": incident_data["assignment_group"],
            "assigned_to": incident_data["assigned_to"],
            "created_date": incident_data["created_date"],
            "updated_date": incident_data["updated_date"],
            "similarity_score": similarity_score,
            "datafix": datafix_data,
        }
