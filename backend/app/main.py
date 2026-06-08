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
