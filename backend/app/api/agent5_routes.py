from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.agents import Agent3SimilarIncidentAnalyzer, Agent5ResolutionRecommendation
from app.schemas import Agent5Response

router = APIRouter(prefix="/api/agents/agent5", tags=["Agent 5"])


class Agent5RecommendationRequest(BaseModel):
    """
    Standalone request to run Agent 5 directly.
    Provide an agent3_results payload (as returned by Agent 3) and
    optionally the original incident details.
    """

    agent3_results: dict = Field(
        description="Full Agent 3 response dict (must contain top_matches)."
    )
    original_incident: dict = Field(
        default_factory=dict,
        description="Original incident details from Agent 1 (optional but recommended).",
    )


@router.post(
    "/recommend",
    response_model=Agent5Response,
    summary="Generate resolution recommendation from similar incidents",
    description=(
        "Run Agent 5 standalone. Accepts an Agent 3 result payload and "
        "returns a structured resolution recommendation built from resolved "
        "historical incidents and their datafixes."
    ),
)
def recommend_resolution(request: Agent5RecommendationRequest) -> Agent5Response:
    agent = Agent5ResolutionRecommendation()
    return agent.recommend(
        original_incident=request.original_incident,
        agent3_results=request.agent3_results,
    )