from fastapi import APIRouter, HTTPException

from app.agents.agent4_resolution_capture import Agent4ResolutionCapture
from app.schemas.agent4_schemas import Agent4ResolutionRequest, Agent4Response

router = APIRouter(prefix="/api/agents/agent4", tags=["Agent 4"])


@router.post("/submit-resolution", response_model=Agent4Response)
async def submit_resolution(request: Agent4ResolutionRequest):
    """
    Endpoint for Agent 4 to capture resolutions when no similar incidents are found.
    """
    try:
        agent4_agent = Agent4ResolutionCapture()
        response = agent4_agent.capture_resolution(request)
        if not response.success:
            # We return the response with success=False as per requirements
            return response
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error capturing resolution: {str(e)}",
        ) from e
