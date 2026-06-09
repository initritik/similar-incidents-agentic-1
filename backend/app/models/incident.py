from datetime import datetime

from pydantic import BaseModel, Field

from backend.app.models.enums import IncidentState


class Incident(BaseModel):
    incident_number: str = Field(examples=["INC000001"])
    short_description: str
    description: str
    state: IncidentState
    resolution_notes: str | None
    created_date: datetime
    updated_date: datetime
    assignment_group: str
    assigned_to: str

