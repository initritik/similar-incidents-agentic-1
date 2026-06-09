from pydantic import BaseModel, Field

from backend.app.models.incident import Incident


class SimilarIncidentResult(BaseModel):
    incident: Incident
    similarity_score: float = Field(ge=0.0, le=1.0)

