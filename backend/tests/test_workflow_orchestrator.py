import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from app.main import app
from app.models import WorkflowStatus
from app.orchestrator import workflow_store
from app.schemas import Agent2Response


class FakeAgent2SimilaritySearch:
    def search_similar_incidents(self, incident) -> Agent2Response:
        return Agent2Response(
            success=True,
            message="Found 1 similar incident(s).",
            match_count=1,
            similar_incidents=[
                {
                    "incident_number": "INC000001",
                    "short_description": "VMware access not provisioned",
                    "description": "Resolved VMware entitlement sync issue.",
                    "state": "RESOLVED",
                    "resolution_notes": "Activated profile.",
                    "assignment_group": "VMware Access Provisioning",
                    "assigned_to": "Anika Sharma",
                    "similarity_score": 0.91,
                    "datafix": {
                        "datafix_id": "DFX000001",
                        "description": "Activate VMware access profile.",
                        "datafix_code": "UPDATE USER_ACCESS SET ACCESS_STATUS='ACTIVE';",
                    },
                }
            ],
        )


class FakeAgent2NoMatchesSearch:
    def search_similar_incidents(self, incident) -> Agent2Response:
        return Agent2Response(
            success=True,
            message="No similar incidents found.",
            match_count=0,
            similar_incidents=[],
        )


class FakeIngestionService:
    saved_records: list[dict] = []

    def ingest_single_resolution(self, **kwargs):
        self.saved_records.append(kwargs)


class WorkflowOrchestratorTests(unittest.TestCase):
    def setUp(self) -> None:
        workflow_store.clear_workflows()
        FakeIngestionService.saved_records = []
        self.client = TestClient(app)

    def test_start_workflow_runs_agent1_successfully(self) -> None:
        with patch(
            "app.orchestrator.workflow_orchestrator.Agent2SimilaritySearch",
            return_value=FakeAgent2SimilaritySearch(),
        ):
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
        self.assertIn("agent_1", payload["agent_results"])
        self.assertIn("agent_2", payload["agent_results"])
        self.assertIn("agent_3", payload["agent_results"])
        self.assertNotIn("agent_4", payload["agent_results"])
        self.assertTrue(payload["agent_results"]["agent_3"]["similar_incidents_found"])

    def test_start_workflow_records_agent1_failure(self) -> None:
        response = self.client.post(
            "/api/workflows/start",
            json={"incident_number": "INVALID"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["overall_status"], WorkflowStatus.FAILED)
        self.assertEqual(payload["agent_statuses"][0]["status"], WorkflowStatus.FAILED)
        self.assertEqual(payload["agent_statuses"][1]["status"], WorkflowStatus.SKIPPED)
        self.assertEqual(payload["agent_statuses"][2]["status"], WorkflowStatus.SKIPPED)
        self.assertEqual(payload["agent_statuses"][3]["status"], WorkflowStatus.SKIPPED)
        self.assertIn("valid incident identifier", payload["agent_statuses"][0]["message"])
        self.assertIn("agent_1", payload["agent_results"])

    def test_agent4_runs_when_agent3_finds_no_similar_incidents(self) -> None:
        with (
            patch(
                "app.orchestrator.workflow_orchestrator.Agent2SimilaritySearch",
                return_value=FakeAgent2NoMatchesSearch(),
            ),
            patch(
                "app.agents.agent4_resolution_capture.IngestionService",
                return_value=FakeIngestionService(),
            ),
        ):
            response = self.client.post(
                "/api/workflows/start",
                json={
                    "incident_number": "INC000005",
                    "provide_resolution": True,
                    "resolution_notes": "Activated VMware profile and replayed sync.",
                    "datafix_code": "UPDATE USER_ACCESS SET ACCESS_STATUS='ACTIVE';",
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["overall_status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][2]["status"], WorkflowStatus.COMPLETED)
        self.assertEqual(payload["agent_statuses"][3]["status"], WorkflowStatus.COMPLETED)
        self.assertFalse(payload["agent_results"]["agent_3"]["similar_incidents_found"])
        self.assertTrue(payload["agent_results"]["agent_4"]["saved"])
        self.assertTrue(payload["agent_results"]["agent_4"]["ingested_to_qdrant"])
        self.assertEqual(len(FakeIngestionService.saved_records), 1)

    def test_agent4_decline_completes_without_save(self) -> None:
        with patch(
            "app.orchestrator.workflow_orchestrator.Agent2SimilaritySearch",
            return_value=FakeAgent2NoMatchesSearch(),
        ):
            response = self.client.post(
                "/api/workflows/start",
                json={
                    "incident_number": "INC000005",
                    "provide_resolution": False,
                },
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["agent_statuses"][3]["status"], WorkflowStatus.COMPLETED)
        self.assertFalse(payload["agent_results"]["agent_4"]["saved"])
        self.assertEqual(FakeIngestionService.saved_records, [])

    def test_get_workflow_returns_stored_status(self) -> None:
        with patch(
            "app.orchestrator.workflow_orchestrator.Agent2SimilaritySearch",
            return_value=FakeAgent2SimilaritySearch(),
        ):
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

