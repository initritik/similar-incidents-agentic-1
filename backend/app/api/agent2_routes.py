from fastapi import APIRouter

from backend.app.agents.agent2_similarity_search import Agent2SimilaritySearch
from backend.app.schemas import Agent1ValidationRequest, Agent2Response
from backend.app.services import IncidentService

router = APIRouter(prefix="/api/agents/agent2", tags=["Agent 2"])


@router.post(
    "/search",
    response_model=Agent2Response,
    summary="Search for similar incidents",
    description=(
        "Run Agent 2 to search for incidents semantically similar to the provided incident. "
        "This endpoint generates embeddings using OpenAI and searches the Qdrant vector database "
        "for similar resolved incidents. Returns the top matches with their associated datafixes."
    ),
)
def search_similar_incidents(request: Agent1ValidationRequest) -> Agent2Response:
    """
    Search for incidents similar to the provided incident number.

    Args:
        request: Request with incident_number to search for.

    Returns:
        Agent2Response with similar incidents or empty list if none found.
    """
    # Fetch the incident
    incident = IncidentService.get_incident_by_number(request.incident_number)

    if incident is None:
        return Agent2Response(
            success=False,
            message=f"Incident {request.incident_number} not found.",
            match_count=0,
            similar_incidents=[],
        )

    # Search for similar incidents
    agent = Agent2SimilaritySearch()
    return agent.search_similar_incidents(incident)
