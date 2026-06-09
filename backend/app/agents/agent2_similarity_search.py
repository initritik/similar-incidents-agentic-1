import logging

from backend.app.mock_data.datafixes import MOCK_DATAFIXES
from backend.app.mock_data.incidents import MOCK_INCIDENTS
from backend.app.models import Incident
from backend.app.schemas.agent_responses import Agent2Response
from backend.app.vector_store.vector_search_service import VectorSearchService

logger = logging.getLogger(__name__)


class Agent2SimilaritySearch:
    """Agent 2: Finds semantically similar incidents and their associated datafixes."""

    def __init__(self):
        try:
            self.vector_search_service = VectorSearchService()
        except ValueError as exc:
            logger.warning("Vector search unavailable; using mock similarity fallback: %s", exc)
            self.vector_search_service = None

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
            logger.info(f"Searching for incidents similar to {incident.incident_number}")

            if self.vector_search_service is None:
                results = self._search_mock_incidents(incident, limit, score_threshold)
            else:
                # Search for similar incidents
                results = self.vector_search_service.search_similar_incidents(
                    incident=incident,
                    limit=limit,
                    score_threshold=score_threshold,
                )

            if not results:
                logger.info("No similar incidents found")
                return Agent2Response(
                    success=True,
                    message="No similar incidents found.",
                    match_count=0,
                    similar_incidents=[],
                )

            logger.info(f"Found {len(results)} similar incidents")

            # Build response with results
            return Agent2Response(
                success=True,
                message=f"Found {len(results)} similar incident(s).",
                match_count=len(results),
                similar_incidents=results,
            )

        except Exception as e:
            logger.error(f"Agent 2 failed: {str(e)}")
            return Agent2Response(
                success=False,
                message=f"Failed to search for similar incidents: {str(e)}",
                match_count=0,
                similar_incidents=[],
            )

    def _search_mock_incidents(
        self,
        incident: Incident,
        limit: int,
        score_threshold: float,
    ) -> list[dict]:
        """Small deterministic fallback for local development and tests."""
        query_terms = self._tokenize(
            f"{incident.short_description} {incident.description} {incident.assignment_group}"
        )
        scored: list[dict] = []

        for candidate in MOCK_INCIDENTS:
            if candidate.incident_number == incident.incident_number:
                continue
            if not candidate.resolution_notes:
                continue

            candidate_terms = self._tokenize(
                f"{candidate.short_description} {candidate.description} {candidate.assignment_group}"
            )
            overlap = len(query_terms & candidate_terms)
            denominator = max(len(query_terms | candidate_terms), 1)
            score = overlap / denominator

            if candidate.assignment_group == incident.assignment_group:
                score += 0.45

            score = min(score, 0.99)
            if score < score_threshold:
                continue

            datafix = next(
                (
                    item.model_dump()
                    for item in MOCK_DATAFIXES
                    if item.incident_number == candidate.incident_number
                ),
                None,
            )
            payload = candidate.model_dump()
            payload["similarity_score"] = score
            payload["datafix"] = datafix
            scored.append(payload)

        scored.sort(key=lambda item: item["similarity_score"], reverse=True)
        return scored[:limit]

    @staticmethod
    def _tokenize(text: str) -> set[str]:
        return {
            token.strip(".,;:()[]{}'\"").lower()
            for token in text.split()
            if len(token.strip(".,;:()[]{}'\"")) > 2
        }
