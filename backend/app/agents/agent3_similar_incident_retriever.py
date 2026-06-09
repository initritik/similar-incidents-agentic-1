import logging

from backend.app.schemas.agent_responses import Agent3Response, SimilarIncidentDetail

logger = logging.getLogger(__name__)


class Agent3SimilarIncidentRetriever:
    """Agent 3: Retrieves, filters, and ranks similar incidents from Agent 2 results."""

    SIMILARITY_THRESHOLD = 0.3  # 30%
    MAX_TOP_INCIDENTS = 5

    def process(self, agent2_results: dict) -> Agent3Response:
        """
        Process Agent 2 results to filter, rank, and prepare UI-ready data.

        Args:
            agent2_results: Response from Agent 2 containing similar incidents.

        Returns:
            Agent3Response with filtered incidents and routing decision.
        """
        try:
            logger.info("Agent 3 started")

            # Extract incidents from Agent 2 results
            agent2_success = agent2_results.get("success", False)
            similar_incidents = agent2_results.get("similar_incidents", [])

            if not agent2_success or not similar_incidents:
                logger.info("No incidents from Agent 2")
                return self._build_no_match_response()

            # Filter incidents by similarity threshold
            filtered_incidents = self._filter_by_threshold(similar_incidents)

            if not filtered_incidents:
                logger.info("No incidents meet similarity threshold")
                return self._build_no_match_response()

            # Sort by similarity score descending
            sorted_incidents = self._sort_by_score(filtered_incidents)

            # Take top 5
            top_incidents = sorted_incidents[: self.MAX_TOP_INCIDENTS]

            # Build response
            logger.info(f"Found {len(top_incidents)} similar incidents")
            return self._build_match_response(top_incidents, len(filtered_incidents))

        except Exception as e:
            logger.error(f"Agent 3 failed: {str(e)}")
            return Agent3Response(
                success=False,
                message=f"Error processing similar incidents: {str(e)}",
                similar_incidents_found=False,
                total_matches_found=0,
                top_similar_incidents=[],
                next_agent="agent4",
            )

    def _filter_by_threshold(self, incidents: list[dict]) -> list[dict]:
        """
        Filter incidents by similarity threshold (30%).

        Args:
            incidents: List of incident dicts from Agent 2.

        Returns:
            Filtered list of incidents meeting threshold.
        """
        filtered = [
            incident
            for incident in incidents
            if incident.get("similarity_score", 0) >= self.SIMILARITY_THRESHOLD
        ]
        logger.debug(
            f"Filtered {len(filtered)} incidents from {len(incidents)} "
            f"using threshold {self.SIMILARITY_THRESHOLD}"
        )
        return filtered

    def _sort_by_score(self, incidents: list[dict]) -> list[dict]:
        """
        Sort incidents by similarity score in descending order.

        Args:
            incidents: List of incident dicts.

        Returns:
            Sorted list with highest scores first.
        """
        sorted_incidents = sorted(
            incidents,
            key=lambda x: x.get("similarity_score", 0),
            reverse=True,
        )
        logger.debug(f"Sorted {len(sorted_incidents)} incidents by similarity score")
        return sorted_incidents

    def _build_match_response(
        self,
        top_incidents: list[dict],
        total_matches_found: int,
    ) -> Agent3Response:
        """
        Build successful response with similar incidents found.

        Args:
            top_incidents: Top N incidents after filtering and sorting.
            total_matches_found: Total number of matches before top-5 selection.

        Returns:
            Agent3Response with match details and routing decision.
        """
        similar_incident_details = []

        for incident in top_incidents:
            detail = SimilarIncidentDetail(
                incident_number=incident.get("incident_number", ""),
                short_description=incident.get("short_description", ""),
                description=incident.get("description", ""),
                state=incident.get("state", ""),
                resolution_notes=incident.get("resolution_notes"),
                assignment_group=incident.get("assignment_group", ""),
                assigned_to=incident.get("assigned_to", ""),
                similarity_score=incident.get("similarity_score", 0.0),
                datafix_id=self._safe_get_nested(incident, "datafix", "datafix_id"),
                datafix_description=self._safe_get_nested(
                    incident, "datafix", "description"
                ),
                datafix_code=self._safe_get_nested(incident, "datafix", "datafix_code"),
            )
            similar_incident_details.append(detail)

        return Agent3Response(
            success=True,
            message=f"Found {len(similar_incident_details)} similar incident(s).",
            similar_incidents_found=True,
            total_matches_found=total_matches_found,
            top_similar_incidents=similar_incident_details,
            next_agent="agent5",
        )

    def _build_no_match_response(self) -> Agent3Response:
        """
        Build successful response indicating no similar incidents found.

        Returns:
            Agent3Response with no matches and routing to Agent 4.
        """
        return Agent3Response(
            success=True,
            message="No similar incidents found.",
            similar_incidents_found=False,
            total_matches_found=0,
            top_similar_incidents=[],
            next_agent="agent4",
        )

    @staticmethod
    def _safe_get_nested(obj: dict, *keys) -> str | None:
        """
        Safely get nested value from dict.

        Args:
            obj: Dictionary to traverse.
            *keys: Nested keys to follow.

        Returns:
            Value if found, None otherwise.
        """
        current = obj
        for key in keys:
            if isinstance(current, dict):
                current = current.get(key)
            else:
                return None
        return current
