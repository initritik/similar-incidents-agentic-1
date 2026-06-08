from enum import StrEnum


class IncidentState(StrEnum):
    OPEN = "OPEN"
    WORK_IN_PROGRESS = "WORK_IN_PROGRESS"
    RESOLVED = "RESOLVED"


class WorkflowStatus(StrEnum):
    PENDING = "PENDING"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"

