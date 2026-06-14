import logging
import re

from app.models.enums import IncidentState
from app.schemas.agent_responses import Agent5Response

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Placeholder substitution patterns
# Each tuple is (regex_pattern, replacement_placeholder).
# Applied to datafix code so no real env-specific values leak into output.
# ---------------------------------------------------------------------------
_PLACEHOLDER_RULES: list[tuple[str, str]] = [
    # VMware IDs  e.g. VMW10234
    (r"VMW\d+", "<paste VMware ID here>"),
    # Staff IDs  e.g. STF21001
    (r"STF\d+", "<paste staff ID here>"),
    # Policy IDs  e.g. POL7001
    (r"POL\d+", "<paste policy ID here>"),
    # User IDs  e.g. USR-00123  or  UID000001
    (r"USR[-_]?\d+|UID\d+", "<paste user ID here>"),
    # Email addresses
    (r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "<paste email ID here>"),
    # Generic numeric IDs that appear as quoted string values in SQL  e.g. ='12345'
    (r"(?<==')[0-9]{4,}(?=')", "<paste ID here>"),
]

_MIN_SIMILARITY = 0.30  # mirrors Agent 3 threshold


class Agent5ResolutionRecommendation:
    """
    Agent 5: Resolution Recommendation Generator.

    Receives Agent 3 top matches and synthesises a recommended resolution
    and datafix from the resolved historical incidents stored in Qdrant.
    Only incidents in RESOLVED state with similarity >= 30 % are considered.
    """

    def recommend(
        self,
        *,
        original_incident: dict,
        agent3_results: dict,
    ) -> "Agent5Response":
        """
        Generate a recommended resolution from Agent 3 top matches.

        Args:
            original_incident: Incident dict from Agent 1 output.
            agent3_results:    Full Agent 3 response dict.

        Returns:
            Agent5Response (structured, UI-ready).
        """
        try:
            logger.info("Agent5 started")

            # Guard: only run when similar incidents were found
            if not agent3_results.get("similar_incidents_found", False):
                logger.info("Agent5 skipped – no similar tickets found by Agent3")
                return self._no_match_response()

            top_matches: list[dict] = agent3_results.get("top_matches", [])

            logger.info("Fetching resolved similar tickets")
            logger.info("Filtering resolved records")
            resolved = self._filter_resolved(top_matches)

            if not resolved:
                logger.info("Agent5 – no resolved tickets remain after filtering")
                return self._no_match_response()

            logger.info("Extracting resolution notes")
            logger.info("Extracting datafix patterns")

            source_incident_numbers = [m.get("incident_number", "") for m in resolved]
            source_resolution_notes = [
                m.get("resolution_notes") or "" for m in resolved
            ]
            source_datafix_ids = [
                m.get("datafix_id") or "" for m in resolved if m.get("datafix_id")
            ]
            datafix_codes = [
                m.get("datafix_code") for m in resolved if m.get("datafix_code")
            ]

            logger.info("Generating recommendation")

            recommended_resolution = self._build_resolution_summary(
                original_incident=original_incident,
                resolved_matches=resolved,
                resolution_notes=source_resolution_notes,
            )

            recommended_datafix = self._build_datafix_recommendation(
                datafix_codes=datafix_codes,
                resolved_matches=resolved,
            )

            confidence_summary = self._build_confidence_summary(resolved)

            logger.info("Recommendation generated successfully")
            logger.info("Agent5 completed")

            return Agent5Response(
                success=True,
                message="Recommended resolution generated successfully.",
                recommended_resolution=recommended_resolution,
                recommended_datafix=recommended_datafix,
                source_incident_numbers=source_incident_numbers,
                source_resolution_notes=source_resolution_notes,
                source_datafix_ids=source_datafix_ids,
                confidence_summary=confidence_summary,
            )

        except Exception as exc:
            logger.error("Agent5 failed: %s", str(exc))
            return Agent5Response(
                success=False,
                message=f"Agent5 failed: {str(exc)}",
                recommended_resolution="",
                recommended_datafix="",
                source_incident_numbers=[],
                source_resolution_notes=[],
                source_datafix_ids=[],
                confidence_summary="",
            )

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _filter_resolved(self, matches: list[dict]) -> list[dict]:
        """Keep only RESOLVED incidents that meet the similarity threshold."""
        filtered = []
        for m in matches:
            state = (m.get("state") or "").upper()
            score = m.get("similarity_score", 0.0)
            has_notes = bool(m.get("resolution_notes"))

            if (
                state == IncidentState.RESOLVED.value
                and score >= _MIN_SIMILARITY
                and has_notes
            ):
                filtered.append(m)

        return filtered

    def _build_resolution_summary(
        self,
        *,
        original_incident: dict,
        resolved_matches: list[dict],
        resolution_notes: list[str],
    ) -> str:
        """Synthesise a natural-language resolution recommendation."""
        count = len(resolved_matches)
        incident_refs = ", ".join(
            m.get("incident_number", "") for m in resolved_matches
        )
        top = resolved_matches[0]
        top_score_pct = int(top.get("similarity_score", 0) * 100)

        # Collect unique, non-empty notes
        unique_notes = list(dict.fromkeys(n for n in resolution_notes if n.strip()))

        notes_block = "\n".join(f"  - {note}" for note in unique_notes)

        summary = (
            f"Based on {count} historically resolved ticket(s) "
            f"({incident_refs}) with up to {top_score_pct}% semantic similarity "
            f"to the current ticket, the following resolution is recommended:\n\n"
            f"Historical resolution notes from matching tickets:\n{notes_block}\n\n"
            f"Recommended action:\n"
            f"  1. Review the resolution notes above for the most relevant pattern.\n"
            f"  2. Identify the specific resource identifier for the affected entity "
            f"(e.g. VMware ID, Staff ID, User ID, Policy ID).\n"
            f"  3. Apply the datafix pattern shown in the 'Recommended Datafix' "
            f"section, substituting the environment-specific placeholders.\n"
            f"  4. Verify the fix by confirming the user can access the affected "
            f"resource.\n"
            f"  5. Update the ticket with resolution notes and close it.\n\n"
            f"Note: This recommendation is synthesised from {count} similar "
            f"resolved ticket(s) stored in the knowledge base."
        )
        return summary

    def _build_datafix_recommendation(
        self,
        *,
        datafix_codes: list[str],
        resolved_matches: list[dict],
    ) -> str:
        """
        Build a datafix recommendation with env-specific values replaced by
        placeholders.  Prefers the code from the highest-scoring match;
        falls back to a pattern synthesised from all available codes.
        """
        if not datafix_codes:
            # No datafix code available – produce a descriptive placeholder
            descriptions = [
                m.get("datafix_description") or ""
                for m in resolved_matches
                if m.get("datafix_description")
            ]
            if descriptions:
                return (
                    "No datafix code found in matching tickets.\n\n"
                    "Datafix descriptions from similar resolved tickets:\n"
                    + "\n".join(f"  - {d}" for d in descriptions)
                )
            return "No datafix information available from similar resolved tickets."

        # Use the code from the best-scoring match that has code
        best_code = datafix_codes[0]
        sanitised = self._apply_placeholders(best_code)

        header = (
            "The following datafix pattern is based on previously resolved "
            "tickets.\nReplace all placeholder values with the actual "
            "environment-specific identifiers before executing.\n\n"
        )

        if len(datafix_codes) > 1:
            header += (
                f"Note: {len(datafix_codes)} similar datafix pattern(s) were found. "
                "The most consistent pattern is shown below.\n\n"
            )

        return header + sanitised

    @staticmethod
    def _apply_placeholders(code: str) -> str:
        """Replace environment-specific literal values with named placeholders."""
        result = code
        for pattern, placeholder in _PLACEHOLDER_RULES:
            result = re.sub(pattern, placeholder, result)
        return result

    @staticmethod
    def _build_confidence_summary(resolved_matches: list[dict]) -> str:
        """Derive a confidence label from the top similarity score."""
        if not resolved_matches:
            return ""

        top_score = resolved_matches[0].get("similarity_score", 0.0)
        count = len(resolved_matches)

        if top_score >= 0.80:
            level = "High"
            detail = "very strong semantic similarity"
        elif top_score >= 0.55:
            level = "Medium-High"
            detail = "strong semantic similarity"
        elif top_score >= 0.40:
            level = "Medium"
            detail = "moderate semantic similarity"
        else:
            level = "Low-Medium"
            detail = "partial semantic similarity"

        return (
            f"{level} confidence – recommendation is based on {count} resolved "
            f"incident(s) with {detail} (top score: {int(top_score * 100)}%)."
        )

    @staticmethod
    def _no_match_response() -> "Agent5Response":
        logger.info("Agent5 completed")
        return Agent5Response(
            success=False,
            message="No resolved similar tickets available for recommendation.",
            recommended_resolution="",
            recommended_datafix="",
            source_incident_numbers=[],
            source_resolution_notes=[],
            source_datafix_ids=[],
            confidence_summary="",
        )