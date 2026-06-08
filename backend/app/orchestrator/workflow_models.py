from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import WorkflowStatus


class WorkflowAgentStatus(BaseModel):
    agent_name: str
    status: WorkflowStatus
    current_task: str
    started_at: datetime | None = None
    completed_at: datetime | None = None
    message: str


class WorkflowExecution(BaseModel):
    workflow_id: str
    incident_number: str
    created_at: datetime
    overall_status: WorkflowStatus
    agent_statuses: list[WorkflowAgentStatus]
    agent_results: dict[str, dict] = Field(
        default_factory=dict,
        description="Results from each completed agent (e.g., agent_1, agent_2, agent_3)",
    )


class StartWorkflowRequest(BaseModel):
    incident_number: str = Field(examples=["INC000005"])

