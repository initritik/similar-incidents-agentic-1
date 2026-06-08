import logging
from datetime import UTC, datetime

from app.agents import Agent1DataIntegrityChecker, Agent3SimilarIncidentRetriever
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
        self.agent2 = Agent2SimilaritySearch()
        self.agent3 = Agent3SimilarIncidentRetriever()

    def start_workflow(self, incident_number: str) -> WorkflowExecution:
        workflow = self.status_store.create_workflow(incident_number)
        logger.info("Workflow created")

        # Execute Agent 1
        workflow = self.execute_agent1(workflow.workflow_id, incident_number)

        # If Agent 1 succeeded, execute Agent 2
        if workflow.overall_status != WorkflowStatus.FAILED:
            workflow = self.execute_agent2(workflow.workflow_id, incident_number)

        # If Agent 2 succeeded, execute Agent 3
        if workflow.overall_status != WorkflowStatus.FAILED:
            workflow = self.execute_agent3(workflow.workflow_id)

        # Skip remaining agents
        workflow = self._skip_future_agents(workflow.workflow_id)

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
            result = self.agent3.process(agent2_results)

            if result.success:
                logger.info(
                    f"Agent 3 completed. Found {result.total_matches_found} total matches, "
                    f"top {len(result.top_similar_incidents)} returned. "
                    f"Routing to {result.next_agent}."
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

    def execute_agent4(self, workflow_id: str, incident_number: str) -> None:
        raise NotImplementedError("Agent 4 has not been implemented yet.")

    def execute_agent5(self, workflow_id: str, incident_number: str) -> None:
        raise NotImplementedError("Agent 5 has not been implemented yet.")

    def _skip_future_agents(self, workflow_id: str) -> WorkflowExecution:
        workflow = self.status_store.get_workflow(workflow_id)
        if workflow is None:
            raise ValueError("Workflow not found.")

        # Skip Agent 4, 5 (Agent 1, 2, 3 have already been processed)
        for agent_name in ("Agent 4", "Agent 5"):
            workflow = self.status_store.update_agent_status(
                workflow_id=workflow_id,
                agent_name=agent_name,
                status=WorkflowStatus.SKIPPED,
                current_task="Pending future implementation.",
                message=f"{agent_name} is not implemented yet.",
                completed_at=datetime.now(UTC),
            )
            if workflow is None:
                raise ValueError("Workflow not found.")

        return workflow

