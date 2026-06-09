from datetime import datetime

from pydantic import BaseModel

from backend.app.models.enums import WorkflowStatus


class AgentStatus(BaseModel):
    agent_name: str
    status: WorkflowStatus
    current_task: str | None
    start_time: datetime | None
    end_time: datetime | None

