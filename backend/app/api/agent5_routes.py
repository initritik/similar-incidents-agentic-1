from fastapi import APIRouter, HTTPException

from backend.app.agents.agent5_resolution_recommendation import Agent5ResolutionRecommendation
from backend.app.schemas.agent5_schemas import Agent5Request, Agent5Response

router = APIRouter(prefix="/api/agents/agent5", tags=["Agent 5"])


@router.post("/recommend", response_model=Agent5Response)
async def recommend_resolution(request: Agent5Request):
    """
    Endpoint for Agent 5 to generate recommendations based on similar incidents.
    Usually called after Agent 3 identifies matches.
    """
    try:
        if not request.similar_incidents:
            raise HTTPException(
                status_code=400,
                detail="Agent 5 requires similar incidents to generate a recommendation.",
            )

        agent5_agent = Agent5ResolutionRecommendation()
        response = agent5_agent.generate_recommendation(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating recommendation: {str(e)}",
        ) from e
