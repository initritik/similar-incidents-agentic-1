import logging

from fastapi import APIRouter, HTTPException, status

from app.agents.agent2_similarity_search import Agent2SimilaritySearch
from app.schemas import Agent1ValidationRequest, Agent2Response
from app.services import IncidentService
from app.utils.validators import is_valid_incident_number

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/agents/agent2", tags=["Agent 2"])


@router.post(
    "/search",
    response_model=Agent2Response,
    status_code=status.HTTP_200_OK,
    summary="Search for similar tickets",
    description=(
        "Run Agent 2 to search for incidents semantically similar to the provided incident. "
        "This endpoint generates embeddings using OpenAI and searches the Qdrant vector database "
        "for similar resolved incidents. Returns the top matches with their associated datafixes."
    ),
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "model": Agent2Response,
            "description": "Invalid ticket identifier format.",
        },
    },
)
def search_similar_incidents(request: Agent1ValidationRequest) -> Agent2Response:
    """
    Search for incidents similar to the provided incident number.

    Args:
        request: Request with incident_number to search for.

    Returns:
        Agent2Response with similar incidents or empty list if none found.
    """
    # Validate incident number format
    if not is_valid_incident_number(request.incident_number):
        logger.warning(f"Invalid ticket number format: {request.incident_number}")
        return Agent2Response(
            success=False,
            message="Invalid ticket identifier format.",
            match_count=0,
            similar_incidents=[],
        )

    try:
        # Fetch the incident
        incident = IncidentService.get_incident_by_number(request.incident_number)

        if incident is None:
            logger.info(f"Ticket not found: {request.incident_number}")
            return Agent2Response(
                success=False,
                message=f"Ticket {request.incident_number} not found.",
                match_count=0,
                similar_incidents=[],
            )

        # Search for similar incidents
        agent = Agent2SimilaritySearch()
        result = agent.search_similar_incidents(incident)
        logger.info(f"Agent2 search completed: found {result.match_count} matches")
        return result
    except Exception as e:
        logger.error(f"Agent2 search failed: {str(e)}", exc_info=True)
        return Agent2Response(
            success=False,
            message=f"Similarity search failed: {str(e)}",
            match_count=0,
            similar_incidents=[],
        )
