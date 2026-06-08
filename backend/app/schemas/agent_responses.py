from pydantic import BaseModel, Field

from app.models.datafix import Datafix
from app.models.enums import WorkflowStatus
from app.models.incident import Incident
from app.models.similar_incident import SimilarIncidentResult


class Agent1Response(BaseModel):
    success: bool
    message: str
    incident: Incident | None = None
    missing_fields: list[str] = []


class Agent2Response(BaseModel):
    success: bool
    message: str
    match_count: int
    similar_incidents: list[dict] = Field(
        default_factory=list,
        description="List of similar incidents with their details, similarity scores, and associated datafixes",
    )


class SimilarIncidentDetail(BaseModel):
    """Detailed information about a similar incident with datafix."""

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
    """Agent 3 retrieval and ranking response."""

    success: bool
    message: str
    similar_incidents_found: bool
    total_matches_found: int
    top_similar_incidents: list[SimilarIncidentDetail] = Field(
        default_factory=list,
        description="Top 5 similar incidents ranked by similarity score",
    )
    next_agent: str = Field(
        description="Routing decision: 'agent4' if no similar incidents found, 'agent5' if found",
    )


class Agent4Response(BaseModel):
    status: WorkflowStatus
    validation_notes: list[str]
    is_ready_for_review: bool


class Agent5Response(BaseModel):
    status: WorkflowStatus
    final_resolution_notes: str | None = None
    audit_notes: list[str]
