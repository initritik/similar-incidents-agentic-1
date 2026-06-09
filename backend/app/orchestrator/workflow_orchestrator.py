import logging
from datetime import UTC, datetime

from app.agents import (
    Agent1DataIntegrityChecker,
    Agent3SimilarIncidentAnalyzer,
    Agent4ResolutionCapture,
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

    def start_workflow(
        self,
        incident_number: str,
        provide_resolution: bool | None = None,
        resolution_notes: str | None = None,
        datafix_description: str | None = None,
        datafix_code: str | None = None,
    ) -> WorkflowExecution:
        workflow = self.status_store.create_workflow(incident_number)
        logger.info("Workflow created")

        # Execute Agent 1
        workflow = self.execute_agent1(workflow.workflow_id, incident_number)

        if workflow.overall_status == WorkflowStatus.FAILED:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 2", "Agent 3", "Agent 4", "Agent 5"),
                "Skipped because Agent 1 failed.",
            )
            logger.info("Workflow completed")
            return workflow

        # If Agent 1 succeeded, execute Agent 2
        workflow = self.execute_agent2(workflow.workflow_id, incident_number)

        if workflow.overall_status == WorkflowStatus.FAILED:
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 3", "Agent 4", "Agent 5"),
                "Skipped because Agent 2 failed.",
            )
            logger.info("Workflow completed")
            return workflow

        # If Agent 2 succeeded, execute Agent 3
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
            workflow = self._skip_agents(
                workflow.workflow_id,
                ("Agent 4", "Agent 5"),
                "Skipped because similar incidents were found.",
            )
            logger.info("Workflow completed")
            return workflow

        workflow = self.execute_agent4(
            workflow_id=workflow.workflow_id,
            incident_number=incident_number,
            provide_resolution=provide_resolution,
            resolution_notes=resolution_notes,
            datafix_description=datafix_description,
            datafix_code=datafix_code,
        )

        # Agent 5 is intentionally not implemented yet.
        workflow = self._skip_agents(
            workflow.workflow_id,
            ("Agent 5",),
            "Pending future implementation.",
        )

        logger.info("Workflow completed")
        stored_workflow = self.status_store.get_workflow(workflow.workflow_id)
        return stored_workflow if stored_workflow is not None else workflow

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
            result=result.model_dump(),
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
            # Get the validated incident from Agent 1
            incident = IncidentService.get_incident_by_number(incident_number)
            if incident is None:
                raise ValueError(f"Incident {incident_number} not found")

            # Search for similar incidents
            if self.agent2 is None:
                self.agent2 = Agent2SimilaritySearch()
            result = self.agent2.search_similar_incidents(incident)

            if result.success:
                logger.info(f"Agent 2 completed. Found {result.match_count} similar incidents")
                # Store the result for Agent 3
                self.status_store.store_agent_result(
                    workflow_id=workflow_id,
                    agent_name="Agent 2",
                    result=result.model_dump(),
                )
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 2",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Similar incident search completed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.error("Agent 2 failed")
                self.status_store.store_agent_result(
                    workflow_id=workflow_id,
                    agent_name="Agent 2",
                    result=result.model_dump(),
                )
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
            current_task="Filtering and ranking similar incidents.",
            message="Agent 3 started.",
            started_at=datetime.now(UTC),
        )

        try:
            # Get the Agent 2 results from workflow state
            agent2_results = self.status_store.get_agent_result(workflow_id, "Agent 2")

            if agent2_results is None:
                raise ValueError("Agent 2 results not found in workflow state")

            # Process with Agent 3
            result = self.agent3.analyze(agent2_results)

            if result.success:
                logger.info(
                    f"Agent 3 completed. Found {result.match_count} top match(es). "
                    f"similar_incidents_found={result.similar_incidents_found}."
                )
                # Store the result for future agents
                self.status_store.store_agent_result(
                    workflow_id=workflow_id,
                    agent_name="Agent 3",
                    result=result.model_dump(),
                )
                workflow = self.status_store.update_agent_status(
                    workflow_id=workflow_id,
                    agent_name="Agent 3",
                    status=WorkflowStatus.COMPLETED,
                    current_task="Similar incident retrieval and ranking completed.",
                    message=result.message,
                    completed_at=datetime.now(UTC),
                )
            else:
                logger.error("Agent 3 failed")
                self.status_store.store_agent_result(
                    workflow_id=workflow_id,
                    agent_name="Agent 3",
                    result=result.model_dump(),
                )
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
                result=result.model_dump(),
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

    def execute_agent5(self, workflow_id: str, incident_number: str) -> None:
        raise NotImplementedError("Agent 5 has not been implemented yet.")

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

