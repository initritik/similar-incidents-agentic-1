import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models import WorkflowStatus
from backend.app.orchestrator import workflow_store


class WorkflowOrchestratorTests(unittest.TestCase):
    def setUp(self) -> None:
        workflow_store.clear_workflows()
        self.client = TestClient(app)

    def test_start_workflow_runs_agent1_successfully(self) -> None:
        response = self.client.post(
            "/api/workflows/start",
            json={"incident_number": "INC000005"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["incident_number"], "INC000005")
        self.assertEqual(payload["overall_status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][0]["agent_name"], "Agent 1")
        self.assertEqual(payload["agent_statuses"][0]["status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][1]["status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][2]["status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][3]["status"], WorkflowStatus.SKIPPED)
        self.assertEqual(payload["agent_statuses"][4]["status"], WorkflowStatus.COMPLETED)
        self.assertIn("agent_5", payload["agent_results"])

    def test_start_workflow_records_agent1_failure(self) -> None:
        response = self.client.post(
            "/api/workflows/start",
            json={"incident_number": "INVALID"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["overall_status"], WorkflowStatus.FAILED)
        self.assertEqual(payload["agent_statuses"][0]["status"], WorkflowStatus.FAILED)
        self.assertIn("valid incident identifier", payload["agent_statuses"][0]["message"])

    def test_get_workflow_returns_stored_status(self) -> None:
        start_response = self.client.post(
            "/api/workflows/start",
            json={"incident_number": "INC000005"},
        )
        workflow_id = start_response.json()["workflow_id"]

        response = self.client.get(f"/api/workflows/{workflow_id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["workflow_id"], workflow_id)

    def test_get_workflow_returns_404_for_unknown_id(self) -> None:
        response = self.client.get("/api/workflows/not-found")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"message": "Workflow not found"})


if __name__ == "__main__":
    unittest.main()
