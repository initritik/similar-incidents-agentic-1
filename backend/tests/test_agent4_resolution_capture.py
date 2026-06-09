import sys
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.agents.agent4_resolution_capture import Agent4ResolutionCapture
from app.models import Incident, IncidentState


class FakeIngestionService:
    def __init__(self) -> None:
        self.saved_records = []

    def ingest_single_resolution(self, **kwargs):
        kwargs["state"] = IncidentState.RESOLVED.value
        self.saved_records.append(kwargs)


class Agent4ResolutionCaptureTests(unittest.TestCase):
    def setUp(self) -> None:
        self.ingestion_service = FakeIngestionService()
        self.agent = Agent4ResolutionCapture(
            ingestion_service=self.ingestion_service
        )
        self.incident = Incident(
            incident_number="INC000005",
            short_description="Active VMware access provisioning issue",
            description="VMware profile is inactive after onboarding.",
            state=IncidentState.OPEN,
            resolution_notes=None,
            created_date=datetime(2026, 5, 5, 9, 20),
            updated_date=datetime(2026, 5, 5, 9, 20),
            assignment_group="VMware Access Provisioning",
            assigned_to="Karan Malhotra",
        )

    def test_resolution_can_be_captured_and_stored(self) -> None:
        result = self.agent.capture(
            incident=self.incident,
            provide_resolution=True,
            resolution_notes="Activated VMware profile and replayed sync.",
            datafix_description="Activate VMware access profile.",
            datafix_code="UPDATE USER_ACCESS SET ACCESS_STATUS='ACTIVE';",
        )

        self.assertTrue(result.success)
        self.assertTrue(result.saved)
        self.assertTrue(result.ingested_to_qdrant)
        self.assertTrue(result.datafix_saved)
        self.assertEqual(result.saved_incident_number, "INC000005")
        self.assertEqual(len(self.ingestion_service.saved_records), 1)
        saved_record = self.ingestion_service.saved_records[0]
        self.assertEqual(saved_record["incident_number"], "INC000005")
        self.assertEqual(saved_record["state"], IncidentState.RESOLVED.value)
        self.assertEqual(saved_record["datafix_id"], "DFX-INC000005")

    def test_missing_datafix_details_do_not_break_save_flow(self) -> None:
        result = self.agent.capture(
            incident=self.incident,
            provide_resolution=True,
            resolution_notes="Activated VMware profile.",
        )

        self.assertTrue(result.success)
        self.assertTrue(result.saved)
        self.assertFalse(result.datafix_saved)
        saved_record = self.ingestion_service.saved_records[0]
        self.assertIsNone(saved_record["datafix_id"])
        self.assertIsNone(saved_record["datafix_description"])
        self.assertIsNone(saved_record["datafix_code"])

    def test_user_declining_resolution_does_not_fail(self) -> None:
        result = self.agent.capture(
            incident=self.incident,
            provide_resolution=False,
        )

        self.assertTrue(result.success)
        self.assertEqual(result.message, "No resolution provided. Nothing was saved.")
        self.assertFalse(result.saved)
        self.assertFalse(result.ingested_to_qdrant)
        self.assertEqual(self.ingestion_service.saved_records, [])

    def test_no_resolution_notes_returns_prompt_without_save(self) -> None:
        result = self.agent.capture(incident=self.incident)

        self.assertTrue(result.success)
        self.assertEqual(result.message, "Do you want to provide a resolution?")
        self.assertFalse(result.saved)
        self.assertEqual(self.ingestion_service.saved_records, [])


if __name__ == "__main__":
    unittest.main()
