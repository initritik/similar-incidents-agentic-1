import logging
import os
from fastapi.middleware.cors import CORSMiddleware

# Load environment variables at startup
from dotenv import load_dotenv
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

from fastapi import FastAPI

from app.api import (
    agent1_router,
    agent2_router,
    agent3_router,
    agent4_router,
    agent5_router,
    datafix_router,
    incident_router,
    workflow_router,
)

app = FastAPI(title="Incident Resolution Assistant API")

# Configure CORS based on environment
app_env = os.getenv("APP_ENV", "development")
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")

if app_env == "production":
    allow_origins = [
        frontend_url,
        "https://similar-incidents-agentic-1.onrender.com",  # Replace with actual Render URL
    ]
else:
    # Development: allow localhost and common ports
    allow_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    allow_credentials=False,
)

app.include_router(incident_router)
app.include_router(datafix_router)
app.include_router(agent1_router)
app.include_router(agent2_router)
app.include_router(agent3_router)
app.include_router(agent4_router)
app.include_router(agent5_router)
app.include_router(workflow_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "healthy"}