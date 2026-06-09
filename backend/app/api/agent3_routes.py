from fastapi import APIRouter

from app.agents.agent3_similar_incident_analyzer import Agent3SimilarIncidentAnalyzer
from app.schemas import Agent3Response

router = APIRouter(prefix="/api/agents/agent3", tags=["Agent 3"])


@router.post(
    "/process",
    response_model=Agent3Response,
    summary="Process similar incident retrieval and ranking",
    description=(
        "Run Agent 3 to filter, rank, and prepare similar incidents from Agent 2 results. "
        "Agent 3 filters incidents by similarity threshold (30%) and selects top 5."
    ),
)
def process_similar_incidents(agent2_results: dict) -> Agent3Response:
    """
    Process Agent 2 results to retrieve and rank similar incidents.

    Args:
        agent2_results: Response payload from Agent 2.

    Returns:
        Agent3Response with filtered top 5 incidents and future routing flag.
    """
    agent = Agent3SimilarIncidentAnalyzer()
    return agent.analyze(agent2_results)
