import logging
from datetime import UTC, datetime

from app.agents import (
    Agent1DataIntegrityChecker,
    Agent3SimilarIncidentAnalyzer,
    Agent4ResolutionCapture,
    Agent5ResolutionRecommendation,
)
from app.agents.agent2_similarity_search import Agent2SimilaritySearch
from app.models.enums import WorkflowStatus
from app.orchestrator.workflow_models import WorkflowExecution
from app.orchestrator.workflow_status_store import WorkflowStatusStore, workflow_store
from app.services.incident_service import IncidentService

logger = logging.getLogger(__name__)


class WorkflowOrchestrator:
    def __init__(self, status_store: WorkflowStatusStore = workflow_store) -> None:
        self.status_store = status_store
        self.agent1 = Agent1DataIntegrityChecker()
        self.agent2: Agent2SimilaritySearch | None = None
        self.agent3 = Agent3SimilarIncidentAnalyzer()
        self.agent4 = Agent4ResolutionCapture()
        self.agent5 = Agent5ResolutionRecommendation()

    def start_workflow(
        self,
        incident_number: str,
        provide_resolution: bool | None = None,
        resolution_notes: str | None = None,
        datafix_description: str | None = None,
        datafix_code: str | None = None,
    ) -> WorkflowExecution:
        logger.info(f"Starting workflow for incident: {incident_number}")
        workflow = self.status_store.create_workflow(incident_number)
        logger.info(f"Workflow created with ID: {workflow.workflow_id}")

        # ── Agent 1 ──────────────────────────────────────────────────────────
        workflow = self.execute_agent1(workflow.workflow_id, incident_number)

        # Early-exit: incident is already RESOLVED — Agent 1 is SKIPPED,
        # skip the remaining agents with a clear resolved-state message.
        agent1_result = self.status_store.get_agent_result(workflow.workflow_id, "Agent 1")
        incident_resolved = (
            agent1_result.get("incident_resolved", False) if agent1_result else False
        )
        if incident_resolved:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 2", "Agent 3", "Agent 4", "Agent 5"),
                "Skipped — incident is already in RESOLVED state. No further processing required.",
            )
            logger.info("Workflow completed — incident already resolved")
            return workflow

        if workflow.overall_status == WorkflowStatus.FAILED:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 2", "Agent 3", "Agent 4", "Agent 5"),
                "Skipped because Agent 1 failed.",
            )
            logger.info("Workflow completed")
            return workflow

        # ── Agent 2 ──────────────────────────────────────────────────────────
        workflow = self.execute_agent2(workflow.workflow_id, incident_number)

        if workflow.overall_status == WorkflowStatus.FAILED:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 3", "Agent 4", "Agent 5"),
                "Skipped because Agent 2 failed.",
            )
            logger.info("Workflow completed")
            return workflow

        # ── Agent 3 ──────────────────────────────────────────────────────────
        workflow = self.execute_agent3(workflow.workflow_id)

        if workflow.overall_status == WorkflowStatus.FAILED:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 4", "Agent 5"),
                "Skipped because Agent 3 failed.",
            )
            logger.info("Workflow completed")
            return workflow

        agent3_results = self.status_store.get_agent_result(
            workflow.workflow_id,
            "Agent 3",
        )
        similar_incidents_found = (
            agent3_results.get("similar_incidents_found", False)
            if agent3_results
            else False
        )

        if similar_incidents_found:
            # ── Agent 5 path: similar incidents found ─────────────────────────
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 4",),
                "Skipped — similar incident(s) found. Agent 5 will generate the recommended resolution.",
            )
            workflow = self.execute_agent5(
                workflow_id=workflow.workflow_id,
                incident_number=incident_number,
            )
        else:
            # ── Agent 4 path: no similar incidents (new incident) ────────────
            has_resolution = bool(resolution_notes and resolution_notes.strip())

            if has_resolution:
                workflow = self.execute_agent4(
                    workflow_id=workflow.workflow_id,
                    incident_number=incident_number,
                    provide_resolution=provide_resolution,
                    resolution_notes=resolution_notes,
                    datafix_description=datafix_description,
                    datafix_code=datafix_code,
                )
                workflow = self._skip_agents(
                    workflow.workflow_id,
                    ("Agent 5",),
                    "Skipped — no similar incidents found. Resolution captured via Agent 4.",
                )
            else:
                workflow = self._skip_agents(
                    workflow.workflow_id,
                    ("Agent 4",),
                    "Awaiting user input — no similar incidents found. Please provide resolution notes.",
                )
                workflow = self._skip_agents(
                    workflow.workflow_id,
                    ("Agent 5",),
                    "Skipped — no similar incidents found to generate a recommendation from.",
                )

        logger.info("Workflow completed")
        stored_workflow = self.status_store.get_workflow(workflow.workflow_id)
        return stored_workflow if stored_workflow is not None else workflow

    # ── Individual agent executors ────────────────────────────────────────────

    def execute_agent1(self, workflow_id: str, incident_number: str) -> WorkflowExecution:
        logger.info("Agent 1 started")
        self.status_store.update_agent_status(
            workflow_id=workflow_id,
            agent_name="Agent 1",
            status=WorkflowStatus.RUNNING,
            current_task="Validating incident data integrity.",
            message="Agent 1 started.",
            started_at=datetime.now(UTC),
        )

        result = self.agent1.validate(incident_number)
        self.status_store.store_agent_result(
            workflow_id=workflow_id,
            agent_name="Agent 1",
            result=result.model_dump(mode="json"),
        )

        if result.success:
            logger.info("Agent 1 completed successfully")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 1",
                status=WorkflowStatus.COMPLETED,
                current_task="Data integrity validation completed.",
                message=result.message,
                completed_at=datetime.now(UTC),
            )
        elif result.incident_resolved:
            # Incident is already resolved — treat Agent 1 as SKIPPED, not FAILED
            logger.info("Agent 1 skipped — incident is already in RESOLVED state")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 1",
                status=WorkflowStatus.SKIPPED,
                current_task="Incident is already resolved. Workflow stopped.",
                message=result.message,
                completed_at=datetime.now(UTC),
            )
        else:
            logger.info("Agent 1 failed")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 1",
                status=WorkflowStatus.FAILED,
                current_task="Data integrity validation failed.",
                message=result.message,
                completed_at=datetime.now(UTC),
            )

        if workflow is None:
            raise ValueError("Workflow not found.")
        return workflow

    def execute_agent2(self, workflow_id: str, incident_number: str) -> WorkflowExecution:
        logger.info("Agent 2 started")
        self.status_store.update_agent_status(
            workflow_id=workflow_id,
            agent_name="Agent 2",
            status=WorkflowStatus.RUNNING,
            current_task="Searching for similar incidents.",
            message="Agent 2 started.",
            started_at=datetime.now(UTC),
        )

        try:
            self.agent2 = Agent2SimilaritySearch(incident_number)
            result = self.agent2.search()
            self.status_store.store_agent_result(
                workflow_id=workflow_id,
                agent_name="Agent 2",
                result=result.model_dump(mode="json"),
            )

            if result.success:
                logger.info("Agent 2 completed successfully")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 2",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Similar incident search completed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.info("Agent 2 failed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 2",
                    status=WorkflowStatus.FAILED,
                    current_task="Similar incident search failed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )

        except Exception as e:
            logger.error(f"Agent 2 error: {str(e)}")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 2",
                status=WorkflowStatus.FAILED,
                current_task="Similar incident search failed.",
                message=f"Error: {str(e)}",
                completed_at=datetime.now(UTC),
            )

        if workflow is None:
            raise ValueError("Workflow not found.")
        return workflow

    def execute_agent3(self, workflow_id: str) -> WorkflowExecution:
        logger.info("Agent 3 started")
        self.status_store.update_agent_status(
            workflow_id=workflow_id,
            agent_name="Agent 3",
            status=WorkflowStatus.RUNNING,
            current_task="Retrieving and ranking similar incidents.",
            message="Agent 3 started.",
            started_at=datetime.now(UTC),
        )

        try:
            agent2_results = self.status_store.get_agent_result(workflow_id, "Agent 2")
            if agent2_results is None:
                raise ValueError("Agent 2 results not found in workflow state.")

            result = self.agent3.analyze(agent2_results=agent2_results)
            self.status_store.store_agent_result(
                workflow_id=workflow_id,
                agent_name="Agent 3",
                result=result.model_dump(mode="json"),
            )

            if result.success:
                logger.info("Agent 3 completed successfully")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 3",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Similar incident retrieval and ranking completed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.info("Agent 3 failed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 3",
                    status=WorkflowStatus.FAILED,
                    current_task="Similar incident retrieval and ranking failed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )

        except Exception as e:
            logger.error(f"Agent 3 error: {str(e)}")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 3",
                status=WorkflowStatus.FAILED,
                current_task="Similar incident retrieval and ranking failed.",
                message=f"Error: {str(e)}",
                completed_at=datetime.now(UTC),
            )

        if workflow is None:
            raise ValueError("Workflow not found.")
        return workflow

    def execute_agent4(
        self,
        workflow_id: str,
        incident_number: str,
        provide_resolution: bool | None = None,
        resolution_notes: str | None = None,
        datafix_description: str | None = None,
        datafix_code: str | None = None,
    ) -> WorkflowExecution:
        logger.info("Agent 4 started")
        self.status_store.update_agent_status(
            workflow_id=workflow_id,
            agent_name="Agent 4",
            status=WorkflowStatus.RUNNING,
            current_task="Capturing a new resolution for future retrieval.",
            message="Agent 4 started.",
            started_at=datetime.now(UTC),
        )

        try:
            incident = IncidentService.get_incident_by_number(incident_number)
            if incident is None:
                raise ValueError(f"Incident {incident_number} not found")

            current_workflow = self.status_store.get_workflow(workflow_id)
            if current_workflow is None:
                raise ValueError("Workflow not found.")

            result = self.agent4.capture(
                incident=incident,
                provide_resolution=provide_resolution,
                resolution_notes=resolution_notes,
                datafix_description=datafix_description,
                datafix_code=datafix_code,
                workflow_context={
                    "workflow_id": workflow_id,
                    "agent_results": current_workflow.agent_results,
                },
            )

            self.status_store.store_agent_result(
                workflow_id=workflow_id,
                agent_name="Agent 4",
                result=result.model_dump(mode="json"),
            )

            if result.success:
                logger.info("Agent 4 completed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 4",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Resolution capture completed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.error("Agent 4 failed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 4",
                    status=WorkflowStatus.FAILED,
                    current_task="Resolution capture failed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )

        except Exception as e:
            logger.error(f"Agent 4 failed: {str(e)}")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 4",
                status=WorkflowStatus.FAILED,
                current_task="Resolution capture failed.",
                message=f"Error: {str(e)}",
                completed_at=datetime.now(UTC),
            )

        if workflow is None:
            raise ValueError("Workflow not found.")
        return workflow

    def execute_agent5(self, workflow_id: str, incident_number: str) -> WorkflowExecution:
        logger.info("Agent5 started")
        self.status_store.update_agent_status(
            workflow_id=workflow_id,
            agent_name="Agent 5",
            status=WorkflowStatus.RUNNING,
            current_task="Generating resolution recommendation from similar resolved incidents.",
            message="Agent5 started.",
            started_at=datetime.now(UTC),
        )

        try:
            agent1_results = self.status_store.get_agent_result(workflow_id, "Agent 1")
            original_incident: dict = {}
            if agent1_results and agent1_results.get("incident"):
                original_incident = agent1_results["incident"]

            agent3_results = self.status_store.get_agent_result(workflow_id, "Agent 3")
            if agent3_results is None:
                raise ValueError("Agent 3 results not found in workflow state.")

            logger.info("Fetching resolved similar incidents")
            result = self.agent5.recommend(
                original_incident=original_incident,
                agent3_results=agent3_results,
            )

            self.status_store.store_agent_result(
                workflow_id=workflow_id,
                agent_name="Agent 5",
                result=result.model_dump(mode="json"),
            )

            if result.success:
                logger.info("Agent5 completed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 5",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Resolution recommendation generated.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.error("Agent5 failed")
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 5",
                    status=WorkflowStatus.FAILED,
                    current_task="Resolution recommendation failed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )

        except Exception as e:
            logger.error(f"Agent5 failed: {str(e)}")
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name="Agent 5",
                status=WorkflowStatus.FAILED,
                current_task="Resolution recommendation failed.",
                message=f"Error: {str(e)}",
                completed_at=datetime.now(UTC),
            )

        if workflow is None:
            raise ValueError("Workflow not found.")
        return workflow

    # ── Helpers ───────────────────────────────────────────────────────────────

    def _skip_agents(
        self,
        workflow_id: str,
        agent_names: tuple[str, ...],
        message: str,
    ) -> WorkflowExecution:
        workflow = self.status_store.get_workflow(workflow_id)
        if workflow is None:
            raise ValueError("Workflow not found.")

        for agent_name in agent_names:
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name=agent_name,
                status=WorkflowStatus.SKIPPED,
                current_task=message,
                message=message,
                completed_at=datetime.now(UTC),
            )
            if workflow is None:
                raise ValueError("Workflow not found.")

        return workflow