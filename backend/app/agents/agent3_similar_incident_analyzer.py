import logging

from app.schemas.agent_responses import Agent3Response, SimilarIncidentDetail

logger = logging.getLogger(__name__)


class Agent3SimilarIncidentAnalyzer:
    """Agent 3: analyzes Agent 2 results and selects UI-ready top matches."""

    SIMILARITY_THRESHOLD = 0.3
    MAX_TOP_MATCHES = 5

    def analyze(self, agent2_results: dict) -> Agent3Response:
        """
        Analyze Agent 2 output without performing any additional vector search.

        Args:
            agent2_results: Agent 2 response payload containing similar_incidents.

        Returns:
            Agent3Response with threshold-filtered, score-sorted top matches.
        """
        try:
            logger.info("Agent3 started")

            if not agent2_results.get("success", False):
                logger.info("No similar incidents found")
                return self._build_no_match_response()

            similar_incidents = agent2_results.get("similar_incidents", [])

            logger.info("Applying similarity threshold")
            logger.info("Filtering low-score matches")
            filtered_matches = self._filter_by_threshold(similar_incidents)

            if not filtered_matches:
                logger.info("No similar incidents found")
                return self._build_no_match_response()

            logger.info("Sorting matches")
            sorted_matches = sorted(
                filtered_matches,
                key=lambda incident: incident.get("similarity_score", 0),
                reverse=True,
            )

            logger.info("Selecting top 5 incidents")
            top_matches = sorted_matches[: self.MAX_TOP_MATCHES]

            logger.info("Similar incidents found")
            logger.info("Agent3 completed")
            return Agent3Response(
                success=True,
                similar_incidents_found=True,
                message="Similar incidents found.",
                match_count=len(top_matches),
                top_matches=[
                    self._build_similar_incident_detail(match) for match in top_matches
                ],
            )

        except Exception as exc:
            logger.error("Agent3 failed: %s", str(exc))
            return Agent3Response(
                success=False,
                similar_incidents_found=False,
                message=f"Failed to analyze similar incidents: {str(exc)}",
                match_count=0,
                top_matches=[],
            )

    def process(self, agent2_results: dict) -> Agent3Response:
        """Backward-compatible alias for callers using the older method name."""
        return self.analyze(agent2_results)

    def _filter_by_threshold(self, incidents: list[dict]) -> list[dict]:
        return [
            incident
            for incident in incidents
            if incident.get("similarity_score", 0) >= self.SIMILARITY_THRESHOLD
        ]

    def _build_similar_incident_detail(self, incident: dict) -> SimilarIncidentDetail:
        datafix = incident.get("datafix") or {}

        return SimilarIncidentDetail(
            incident_number=incident.get("incident_number", ""),
            short_description=incident.get("short_description", ""),
            description=incident.get("description", ""),
            state=incident.get("state", ""),
            resolution_notes=incident.get("resolution_notes"),
            assignment_group=incident.get("assignment_group", ""),
            assigned_to=incident.get("assigned_to", ""),
            similarity_score=incident.get("similarity_score", 0.0),
            datafix_id=datafix.get("datafix_id"),
            datafix_description=datafix.get("description"),
            datafix_code=datafix.get("datafix_code"),
        )

    @staticmethod
    def _build_no_match_response() -> Agent3Response:
        logger.info("Agent3 completed")
        return Agent3Response(
            success=True,
            similar_incidents_found=False,
            message="No similar incidents found.",
            match_count=0,
            top_matches=[],
        )
