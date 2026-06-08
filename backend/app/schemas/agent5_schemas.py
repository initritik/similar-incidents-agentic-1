from pydantic import BaseModel, Field
from typing import List, Optional

class DatafixInfo(BaseModel):
    datafix_id: str
    description: str
    datafix_code: str

class SimilarIncident(BaseModel):
    incident_number: str
    short_description: str
    description: str
    resolution_notes: str
    similarity_score: float
    datafix: Optional[DatafixInfo] = None

class Agent5Request(BaseModel):
    """Input for Agent 5, typically the output from Agent 3."""
    current_incident: dict = Field(..., description="Details of the incident currently being processed")
    similar_incidents: List[SimilarIncident] = Field(..., description="Top similar incidents found by Agent 3")

class SupportingIncidentInfo(BaseModel):
    incident_number: str
    similarity_score: float

class Agent5Response(BaseModel):
    success: bool
    message: str
    recommended_resolution: str
    recommended_datafix_template: str
    confidence_score: float
    supporting_incidents: List[SupportingIncidentInfo]

class Agent3MinimalResponse(BaseModel):
    """Used for the API endpoint to receive Agent 3's output directly."""
    success: bool
    similar_incidents_found: bool
    top_similar_incidents: List[SimilarIncident]