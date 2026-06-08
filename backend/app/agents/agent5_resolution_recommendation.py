import os
import logging
from typing import List

from openai import OpenAI

from app.schemas.agent5_schemas import Agent5Request, Agent5Response, SupportingIncidentInfo
from app.utils.placeholder_utils import standardize_placeholders

logger = logging.getLogger(__name__)

class Agent5ResolutionRecommendation:
    """
    Agent 5: Resolution Recommendation Engine.
    Synthesizes resolutions and datafix templates using LLM analysis.
    """

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        self.client = OpenAI(api_key=api_key) if api_key else None
        self.model = os.getenv("OPENAI_MODEL", "gpt-5-mini")

    def generate_recommendation(self, request: Agent5Request) -> Agent5Response:
        """
        Analyzes similar incidents and generates a consolidated recommendation.
        """
        incidents = request.similar_incidents
        
        if not incidents:
            return Agent5Response(
                success=False,
                message="No similar incidents provided for analysis.",
                recommended_resolution="",
                recommended_datafix_template="",
                confidence_score=0.0,
                supporting_incidents=[]
            )

        # 1. Calculate Deterministic Confidence Score
        confidence = self._calculate_confidence(incidents)

        # 2. Prepare context for LLM
        supporting_data = []
        for inc in incidents:
            datafix_code = inc.datafix.datafix_code if inc.datafix else "None"
            supporting_data.append(
                f"Incident: {inc.incident_number}\n"
                f"Short Desc: {inc.short_description}\n"
                f"Resolution: {inc.resolution_notes}\n"
                f"Datafix Code: {datafix_code}\n"
            )

        # 3. Call LLM to synthesize recommendation
        llm_result = self._call_llm_synthesizer(request.current_incident, supporting_data)
        
        # 4. Apply placeholders to LLM output to ensure standardization
        resolution = standardize_placeholders(llm_result.get("resolution", ""))
        datafix_template = standardize_placeholders(llm_result.get("datafix_template", ""))

        # 5. Format supporting incidents
        supporting_incidents = [
            SupportingIncidentInfo(incident_number=inc.incident_number, similarity_score=inc.similarity_score)
            for inc in incidents
        ]

        return Agent5Response(
            success=True,
            message="Resolution recommendation generated successfully.",
            recommended_resolution=resolution,
            recommended_datafix_template=datafix_template,
            confidence_score=round(confidence, 2),
            supporting_incidents=supporting_incidents
        )

    def _calculate_confidence(self, incidents: List) -> float:
        """Deterministic logic for confidence score."""
        if not incidents:
            return 0.0
            
        avg_similarity = sum(inc.similarity_score for inc in incidents) / len(incidents)
        datafix_ratio = sum(1 for inc in incidents if inc.datafix) / len(incidents)
        
        # Formula: 70% weight on similarity, 30% weight on datafix consistency
        score = (avg_similarity * 0.7 + datafix_ratio * 0.3) * 100
        return min(max(score, 0), 100)

    def _call_llm_synthesizer(self, current_inc: dict, supporting_data: List[str]) -> dict:
        """Synthesizes patterns into a single recommendation using OpenAI."""
        system_prompt = (
            "You are a technical support expert. Analyze historical incidents to provide a "
            "synthesized resolution and a reusable datafix template for the current issue. "
            "Important: Do not return specific IDs like VMW123 or EMP456. Replace them with "
            "standard placeholders like <PASTE_VMWARE_ID> or <PASTE_STAFF_ID>."
        )
        
        user_prompt = (
            f"Current Incident: {current_inc.get('short_description')}\n"
            f"Description: {current_inc.get('description')}\n\n"
            f"Historical Evidence:\n" + "\n---\n".join(supporting_data) +
            "\n\nProvide the response in the following format:\n"
            "RESOLUTION: <synthesized steps>\n"
            "DATAFIX_TEMPLATE: <reusable code snippet>"
        )

        if self.client is None:
            return self._fallback_synthesis(supporting_data)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
            )
        except Exception as exc:
            logger.warning("LLM synthesis failed; using deterministic fallback: %s", exc)
            return self._fallback_synthesis(supporting_data)

        content = response.choices[0].message.content

        # Basic parsing of the LLM response
        try:
            res_part = content.split("RESOLUTION:")[1].split("DATAFIX_TEMPLATE:")[0].strip()
            dfx_part = content.split("DATAFIX_TEMPLATE:")[1].strip()
        except (AttributeError, IndexError):
            logger.warning("LLM response was not parseable; using deterministic fallback")
            return self._fallback_synthesis(supporting_data)

        return {"resolution": res_part, "datafix_template": dfx_part}

    def _fallback_synthesis(self, supporting_data: List[str]) -> dict:
        evidence = supporting_data[0] if supporting_data else ""
        resolution = (
            "Review the current incident against the strongest historical match, "
            "apply the same remediation pattern, then validate access or processing "
            "status with the requester."
        )
        datafix_template = (
            "/* Adapt from strongest supporting incident. Replace identifiers before use. */\n"
            f"{evidence}"
        )
        return {"resolution": resolution, "datafix_template": datafix_template}
