from dotenv import load_dotenv
from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    agent1_router,
    agent2_router,
    agent3_router,
    agent4_router,
    agent5_router,
    datafix_router,
    incident_router,
    ingestion_router,
    workflow_router,
)

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Incident Resolution Assistant API")


# Global exception handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    """Handle validation errors from Pydantic."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": f"Validation error: {str(exc.errors())}"},
    )


# Global exception handler for general exceptions
@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions."""
    error_message = str(exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": error_message},
    )


# Global exception handler for ValueError
@app.exception_handler(ValueError)
async def value_error_handler(request, exc):
    """Handle ValueError exceptions."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": str(exc)},
    )


app.add_middleware(
    CORSMiddleware,
    # List of origins that are allowed to make cross-origin requests.
    # In development, we allow localhost:5173 (Vite dev server default port).
    # In production, this would be restricted to specific frontend domains.
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://localhost:8000",
    ],
    # allow_origins=[
    #     "https://similar-incidents-temp-1.vercel.app",
    # ],  # don't add / at the end of the url
    # HTTP methods that are allowed for cross-origin requests.
    # OPTIONS is required for preflight requests; GET/POST/etc. are for actual requests.
    allow_methods=["GET", "POST", "OPTIONS"],
    # HTTP headers that are allowed in cross-origin requests.
    # * means allow any headers sent by the frontend.
    allow_headers=["*"],
    # Allow cookies/credentials to be sent with cross-origin requests.
    # Set to False if your frontend doesn't need to send authentication cookies.
    allow_credentials=False,
)

app.include_router(incident_router)
app.include_router(datafix_router)
app.include_router(agent1_router)
app.include_router(agent2_router)
app.include_router(agent3_router)
app.include_router(agent4_router)
app.include_router(agent5_router)
app.include_router(ingestion_router)
app.include_router(workflow_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}
