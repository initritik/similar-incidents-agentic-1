from pydantic import BaseModel, Field
from typing import Optional

class Agent4ResolutionRequest(BaseModel):
    incident_number: str = Field(..., description="The incident number to resolve")
    resolution_notes: str = Field(..., min_length=1, description="Detailed resolution notes")
    optional_datafix_code: Optional[str] = Field(None, description="Optional code for the datafix")

class Agent4Response(BaseModel):
    success: bool
    message: str
    incident_number: str
    knowledge_base_updated: bool
    qdrant_upsert_completed: bool