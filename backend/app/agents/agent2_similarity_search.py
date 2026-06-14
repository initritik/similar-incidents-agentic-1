import logging

from app.models import Incident
from app.schemas.agent_responses import Agent2Response
from app.vector_store.vector_search_service import VectorSearchService

logger = logging.getLogger(__name__)


class Agent2SimilaritySearch:
    """Agent 2: Finds semantically similar incidents and their associated datafixes."""

    def __init__(self):
        self.vector_search_service = VectorSearchService()

    def search_similar_incidents(
        self,
        incident: Incident,
        limit: int = 5,
        score_threshold: float = 0.3,
    ) -> Agent2Response:
        """
        Search for incidents similar to the provided incident.

        Args:
            incident: The incident to find similar matches for.
            limit: Maximum number of results to return.
            score_threshold: Minimum similarity score (0.3 = 30%).

        Returns:
            Agent2Response containing similar incidents and their datafixes.
        """
        try:
            logger.info(f"Agent 2 started")
            logger.info(f"Searching for tickets similar to {incident.incident_number}")

            # Search for similar incidents
            results = self.vector_search_service.search_similar_incidents(
                incident=incident,
                limit=limit,
                score_threshold=score_threshold,
            )

            if not results:
                logger.info("No similar tickets found")
                return Agent2Response(
                    success=True,
                    message="No similar tickets found.",
                    match_count=0,
                    similar_incidents=[],
                )

            logger.info(f"Found {len(results)} similar tickets")

            # Build response with results
            return Agent2Response(
                success=True,
                message=f"Found {len(results)} similar ticket(s).",
                match_count=len(results),
                similar_incidents=results,
            )

        except Exception as e:
            logger.error(f"Agent 2 failed: {str(e)}")
            return Agent2Response(
                success=False,
                message=f"Failed to search for similar tickets: {str(e)}",
                match_count=0,
                similar_incidents=[],
            )
