import logging

from app.schemas.agent_responses import Agent3Response, SimilarIncidentDetail

logger = logging.getLogger(__name__)


class Agent3SimilarIncidentAnalyzer:
    """Agent 3: analyzes Agent 2 results and selects UI-ready top matches.

    Only incidents with a similarity score >= SIMILARITY_THRESHOLD are
    considered "similar". If all retrieved incidents fall below this threshold
    the incident is treated as completely new and Agent 4 will be invoked to
    capture a resolution from the user.
    """

    SIMILARITY_THRESHOLD = 0.5  # 50 % — incidents below this are "not similar"
    MAX_TOP_MATCHES = 5

    def analyze(self, agent2_results: dict) -> Agent3Response:
        """
        Analyze Agent 2 output without performing any additional vector search.

        Args:
            agent2_results: Agent 2 response payload containing similar_incidents.

        Returns:
            Agent3Response with threshold-filtered, score-sorted top matches.
            similar_incidents_found=False when all scores are below SIMILARITY_THRESHOLD.
        """
        try:
            logger.info("Agent3 started")

            if not agent2_results.get("success", False):
                logger.info("No similar tickets found (Agent 2 unsuccessful)")
                return self._build_no_match_response()

            similar_incidents = agent2_results.get("similar_incidents", [])

            logger.info(
                "Applying %.0f%% similarity threshold (%d candidates)",
                self.SIMILARITY_THRESHOLD * 100,
                len(similar_incidents),
            )
            filtered_matches = self._filter_by_threshold(similar_incidents)

            if not filtered_matches:
                logger.info(
                    "No tickets met the %.0f%% threshold — treating as new ticket",
                    self.SIMILARITY_THRESHOLD * 100,
                )
                return self._build_no_match_response()

            logger.info("Sorting %d filtered matches by score", len(filtered_matches))
            sorted_matches = sorted(
                filtered_matches,
                key=lambda incident: incident.get("similarity_score", 0),
                reverse=True,
            )

            top_matches = sorted_matches[: self.MAX_TOP_MATCHES]

            logger.info(
                "Agent3 completed — %d similar ticket(s) above threshold",
                len(top_matches),
            )
            return Agent3Response(
                success=True,
                similar_incidents_found=True,
                message=f"Found {len(top_matches)} similar ticket(s) with similarity ≥ {int(self.SIMILARITY_THRESHOLD * 100)}%.",
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
                message=f"Failed to analyze similar tickets: {str(exc)}",
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
        logger.info("Agent3 completed — no similar tickets above threshold")
        return Agent3Response(
            success=True,
            similar_incidents_found=False,
            message="No similar tickets found above the 50% threshold. This appears to be a new ticket type."
            match_count=0,
            top_matches=[],
        )