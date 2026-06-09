import logging

from fastapi import APIRouter, status
from fastapi.responses import JSONResponse

from backend.app.ingestion.ingestion_models import IngestionSummary
from backend.app.ingestion.ingestion_runner import IngestionRunner
from backend.app.ingestion.ingestion_service import IngestionService
from backend.app.schemas import MessageResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ingestion", tags=["Ingestion"])


@router.post(
    "/load-all",
    response_model=IngestionSummary,
    summary="Load all resolved incidents into Qdrant",
    description=(
        "Trigger a full ingestion of all RESOLVED incidents from mock data "
        "into Qdrant Cloud. Only incidents with state=RESOLVED are indexed. "
        "This operation is idempotent and safe to run multiple times."
    ),
    responses={
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": MessageResponse,
            "description": "Ingestion failed (e.g., Qdrant connection error, API key invalid).",
        },
    },
)
def load_all_incidents() -> IngestionSummary:
    """
    Load all resolved incidents and their datafixes into Qdrant Cloud.

    Returns:
        IngestionSummary with statistics about what was ingested.

    Raises:
        Exception: If Qdrant connection fails or ingestion encounters an error.
    """
    try:
        logger.info("Ingestion endpoint triggered: load-all")
        IngestionRunner.run()
        
        # Get the summary by running the ingestion service
        ingestion_service = IngestionService()
        summary = ingestion_service.ingest_data()
        
        return summary
    except Exception as e:
        logger.error(f"Ingestion failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": (
                    f"Ingestion failed: {str(e)}. "
                    "Check that QDRANT_URL points to a running Qdrant instance and "
                    "that QDRANT_API_KEY is valid."
                )
            },
        )


@router.post(
    "/load-single/{incident_number}",
    summary="Ingest a single incident",
    description=(
        "Ingest a single incident into Qdrant Cloud incrementally. "
        "Useful for adding newly resolved incidents without reloading the entire collection. "
        "Only RESOLVED incidents are indexed."
    ),
    responses={
        status.HTTP_200_OK: {
            "model": MessageResponse,
            "description": "Incident successfully ingested.",
        },
        status.HTTP_404_NOT_FOUND: {
            "model": MessageResponse,
            "description": "Incident not found in mock data.",
        },
        status.HTTP_400_BAD_REQUEST: {
            "model": MessageResponse,
            "description": "Incident exists but is not in RESOLVED state.",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": MessageResponse,
            "description": "Ingestion failed due to Qdrant or embedding service error.",
        },
    },
)
def load_single_incident(incident_number: str) -> JSONResponse:
    """
    Ingest a single incident by incident number.

    Args:
        incident_number: The incident number (e.g., INC000001).

    Returns:
        JSON response with status message.
    """
    try:
        logger.info(f"Ingestion endpoint triggered: load-single/{incident_number}")
        
        ingestion_service = IngestionService()
        success = ingestion_service.ingest_single_incident(incident_number)
        
        if success:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": f"Incident {incident_number} successfully ingested into Qdrant."
                },
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={
                    "message": f"Incident {incident_number} could not be ingested. "
                    "Check that it exists and is in RESOLVED state."
                },
            )
            
    except Exception as e:
        logger.error(f"Single incident ingestion failed: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"message": f"Ingestion error: {str(e)}"},
        )


@router.get(
    "/status",
    summary="Get ingestion status",
    description="Check if Qdrant is connected and collection exists.",
    responses={
        status.HTTP_200_OK: {
            "model": MessageResponse,
            "description": "Qdrant is accessible.",
        },
        status.HTTP_500_INTERNAL_SERVER_ERROR: {
            "model": MessageResponse,
            "description": "Cannot connect to Qdrant or collection does not exist.",
        },
    },
)
def ingestion_status() -> JSONResponse:
    """
    Check Qdrant connection and collection status.

    Returns:
        JSON response with connection and collection status.
    """
    try:
        from backend.app.vector_store.qdrant_service import QdrantService
        
        qdrant_service = QdrantService()
        exists = qdrant_service.collection_exists()
        
        if exists:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Qdrant is connected and collection exists.",
                    "collection_name": qdrant_service.collection_name,
                    "ready": True,
                },
            )
        else:
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "message": "Qdrant is connected but collection does not exist. Run /api/ingestion/load-all to create it.",
                    "collection_name": qdrant_service.collection_name,
                    "ready": False,
                },
            )
            
    except Exception as e:
        logger.error(f"Cannot connect to Qdrant: {str(e)}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "message": (
                    f"Cannot connect to Qdrant: {str(e)}. "
                    "Check QDRANT_URL, QDRANT_API_KEY, and OPENAI_API_KEY in .env"
                ),
            },
        )
