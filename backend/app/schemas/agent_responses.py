from pydantic import BaseModel, Field

from app.models.enums import WorkflowStatus
from app.models.incident import Incident


class Agent1Response(BaseModel):
    success: bool
    message: str
    incident: Incident | None = None
    missing_fields: list[str] = Field(default_factory=list)
    # NEW: Critical for already-resolved incidents
    incident_resolved: bool = Field(
        default=False,
        description="True if the incident is already in RESOLVED state (Agent1 early exit)"
    )


class Agent2Response(BaseModel):
    success: bool
    message: str
    match_count: int
    similar_incidents: list[dict] = Field(
        default_factory=list,
        description="List of similar incidents with their details, similarity scores, and associated datafixes",
    )


class SimilarIncidentDetail(BaseModel):
    incident_number: str
    short_description: str
    description: str
    state: str
    resolution_notes: str | None = None
    assignment_group: str
    assigned_to: str
    similarity_score: float = Field(ge=0.0, le=1.0)
    datafix_id: str | None = None
    datafix_description: str | None = None
    datafix_code: str | None = None


class Agent3Response(BaseModel):
    success: bool
    similar_incidents_found: bool
    message: str
    match_count: int
    top_matches: list[SimilarIncidentDetail] = Field(
        default_factory=list,
        description="Top 5 similar incidents ranked by similarity score.",
    )


class Agent4Response(BaseModel):
    success: bool
    message: str
    saved: bool
    saved_incident_number: str | None = None
    ingested_to_qdrant: bool
    datafix_saved: bool
    incident_state_updated: bool = Field(
        default=False,
        description="True when the incident was successfully transitioned to RESOLVED state.",
    )
    error: str | None = None


class Agent5Response(BaseModel):
    success: bool
    message: str
    recommended_resolution: str
    recommended_datafix: str
    source_incident_numbers: list[str] = Field(default_factory=list)
    source_resolution_notes: list[str] = Field(default_factory=list)
    source_datafix_ids: list[str] = Field(default_factory=list)
    confidence_summary: str