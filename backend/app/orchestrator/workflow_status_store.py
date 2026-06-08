from copy import deepcopy
from datetime import UTC, datetime
from threading import RLock
from uuid import uuid4

from app.models.enums import WorkflowStatus
from app.orchestrator.workflow_models import WorkflowAgentStatus, WorkflowExecution


class WorkflowStatusStore:
    def __init__(self) -> None:
        self._workflows: dict[str, WorkflowExecution] = {}
        self._lock = RLock()

    def create_workflow(self, incident_number: str) -> WorkflowExecution:
        workflow = WorkflowExecution(
            workflow_id=str(uuid4()),
            incident_number=incident_number,
            created_at=datetime.now(UTC),
            overall_status=WorkflowStatus.RUNNING,
            agent_statuses=[
                WorkflowAgentStatus(
                    agent_name="Agent 1",
                    status=WorkflowStatus.PENDING,
                    current_task="Data integrity validation",
                    message="Waiting to start.",
                ),
                WorkflowAgentStatus(
                    agent_name="Agent 2",
                    status=WorkflowStatus.PENDING,
                    current_task="Pending future implementation.",
                    message="Waiting to start.",
                ),
                WorkflowAgentStatus(
                    agent_name="Agent 3",
                    status=WorkflowStatus.PENDING,
                    current_task="Pending future implementation.",
                    message="Waiting to start.",
                ),
                WorkflowAgentStatus(
                    agent_name="Agent 4",
                    status=WorkflowStatus.PENDING,
                    current_task="Pending future implementation.",
                    message="Waiting to start.",
                ),
                WorkflowAgentStatus(
                    agent_name="Agent 5",
                    status=WorkflowStatus.PENDING,
                    current_task="Pending future implementation.",
                    message="Waiting to start.",
                ),
            ],
        )

        with self._lock:
            self._workflows[workflow.workflow_id] = workflow
            return workflow.model_copy(deep=True)

    def get_workflow(self, workflow_id: str) -> WorkflowExecution | None:
        with self._lock:
            workflow = self._workflows.get(workflow_id)
            return workflow.model_copy(deep=True) if workflow else None

    def update_agent_status(
        self,
        workflow_id: str,
        agent_name: str,
        status: WorkflowStatus,
        current_task: str | None = None,
        message: str | None = None,
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
    ) -> WorkflowExecution | None:
        with self._lock:
            workflow = self._workflows.get(workflow_id)
            if workflow is None:
                return None

            for agent_status in workflow.agent_statuses:
                if agent_status.agent_name == agent_name:
                    agent_status.status = status
                    if current_task is not None:
                        agent_status.current_task = current_task
                    if message is not None:
                        agent_status.message = message
                    if started_at is not None:
                        agent_status.started_at = started_at
                    if completed_at is not None:
                        agent_status.completed_at = completed_at
                    break

            self._refresh_overall_status(workflow)
            return workflow.model_copy(deep=True)

    def get_all_workflows(self) -> list[WorkflowExecution]:
        with self._lock:
            return deepcopy(list(self._workflows.values()))

    def store_agent_result(
        self,
        workflow_id: str,
        agent_name: str,
        result: dict,
    ) -> WorkflowExecution | None:
        """Store the result/output from an agent."""
        with self._lock:
            workflow = self._workflows.get(workflow_id)
            if workflow is None:
                return None

            # Store result with lowercase agent name key
            agent_key = agent_name.lower().replace(" ", "_")
            workflow.agent_results[agent_key] = result
            return workflow.model_copy(deep=True)

    def get_agent_result(self, workflow_id: str, agent_name: str) -> dict | None:
        """Retrieve a stored agent result."""
        with self._lock:
            workflow = self._workflows.get(workflow_id)
            if workflow is None:
                return None

            agent_key = agent_name.lower().replace(" ", "_")
            return workflow.agent_results.get(agent_key)

    def clear_workflows(self) -> None:
        with self._lock:
            self._workflows.clear()

    def _refresh_overall_status(self, workflow: WorkflowExecution) -> None:
        statuses = [agent.status for agent in workflow.agent_statuses]

        if any(status == WorkflowStatus.FAILED for status in statuses):
            workflow.overall_status = WorkflowStatus.FAILED
            return

        if any(status == WorkflowStatus.RUNNING for status in statuses):
            workflow.overall_status = WorkflowStatus.RUNNING
            return

        if all(
            status in {WorkflowStatus.COMPLETED, WorkflowStatus.SKIPPED}
            for status in statuses
        ):
            workflow.overall_status = WorkflowStatus.COMPLETED
            return

        workflow.overall_status = WorkflowStatus.PENDING


workflow_store = WorkflowStatusStore()
