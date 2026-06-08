from pydantic import BaseModel


class IncidentIngestionRecord(BaseModel):
    """Record to be ingested into Qdrant for a resolved incident with its datafix."""

    incident_number: str
    short_description: str
    description: str
    state: str
    resolution_notes: str | None
    assignment_group: str
    assigned_to: str
    created_date: str
    updated_date: str
    datafix_id: str | None = None
    datafix_description: str | None = None
    datafix_code: str | None = None


class IngestionSummary(BaseModel):
    """Summary of an ingestion run."""

    total_resolved_incidents: int
    incidents_with_datafixes: int
    incidents_without_datafixes: int
    total_incidents_ingested: int
    failed_count: int
    batch_size: int
    total_batches: int
