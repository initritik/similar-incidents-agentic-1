import sys
import unittest
from datetime import datetime
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.models import Incident, IncidentState


class Agent1DataIntegrityTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_valid_incident(self) -> None:
        response = self.client.post(
            "/api/agents/agent1/validate",
            json={"incident_number": "INC000001"},
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload["success"])
        self.assertEqual(payload["message"], "Incident data validated successfully.")
        self.assertEqual(payload["incident"]["incident_number"], "INC000001")

    def test_non_existent_incident(self) -> None:
        response = self.client.post(
            "/api/agents/agent1/validate",
            json={"incident_number": "INC999999"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "success": False,
                "message": "Incident not found.",
                "incident": None,
                "missing_fields": [],
            },
        )

    def test_invalid_format(self) -> None:
        response = self.client.post(
            "/api/agents/agent1/validate",
            json={"incident_number": "TEST123"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "success": False,
                "message": (
                    "Please enter a valid incident identifier in the format INC "
                    "followed by 6 digits."
                ),
                "incident": None,
                "missing_fields": [],
            },
        )

    def test_incident_with_missing_description(self) -> None:
        incident = self._incident_with(description="")

        with patch(
            "app.agents.agent1_data_integrity.IncidentService.get_incident_by_number",
            return_value=incident,
        ):
            response = self.client.post(
                "/api/agents/agent1/validate",
                json={"incident_number": "INC000001"},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertFalse(payload["success"])
        self.assertEqual(payload["missing_fields"], ["description"])

    def test_incident_with_missing_short_description(self) -> None:
        incident = self._incident_with(short_description="")

        with patch(
            "app.agents.agent1_data_integrity.IncidentService.get_incident_by_number",
            return_value=incident,
        ):
            response = self.client.post(
                "/api/agents/agent1/validate",
                json={"incident_number": "INC000001"},
            )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertFalse(payload["success"])
        self.assertEqual(payload["missing_fields"], ["short_description"])

    def _incident_with(self, **updates: object) -> Incident:
        data = {
            "incident_number": "INC000001",
            "short_description": "Valid short description",
            "description": "Valid description",
            "state": IncidentState.RESOLVED,
            "resolution_notes": "Resolved",
            "created_date": datetime(2026, 5, 1, 9, 12),
            "updated_date": datetime(2026, 5, 1, 11, 30),
            "assignment_group": "VMware Access Provisioning",
            "assigned_to": "Anika Sharma",
        }
        data.update(updates)
        return Incident.model_validate(data)


if __name__ == "__main__":
    unittest.main()

