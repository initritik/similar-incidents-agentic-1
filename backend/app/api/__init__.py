from app.api.agent1_routes import router as agent1_router
from app.api.agent2_routes import router as agent2_router
from app.api.agent3_routes import router as agent3_router
from app.api.agent4_routes import router as agent4_router
from app.api.agent5_routes import router as agent5_router
from app.api.datafix_routes import router as datafix_router
from app.api.incident_routes import router as incident_router
from app.api.ingestion_routes import router as ingestion_router
from app.api.workflow_routes import router as workflow_router

__all__ = [
    "agent1_router",
    "agent2_router",
    "agent3_router",
    "agent4_router",
    "agent5_router",
    "datafix_router",
    "incident_router",
    "ingestion_router",
    "workflow_router",
]
