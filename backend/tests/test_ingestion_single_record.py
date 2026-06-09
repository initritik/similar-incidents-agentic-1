import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.ingestion.ingestion_service import IngestionService


class FakeEmbeddingService:
    def generate_embedding(self, text: str) -> list[float]:
        return [0.1, 0.2, 0.3]


class FakeQdrantService:
    def __init__(self) -> None:
        self.points_by_id = {}

    def upsert_batch(self, points) -> None:
        for point in points:
            self.points_by_id[point.id] = point


class IngestionSingleRecordTests(unittest.TestCase):
    def setUp(self) -> None:
        self.service = IngestionService.__new__(IngestionService)
        self.service.embedding_service = FakeEmbeddingService()
        self.service.qdrant_service = FakeQdrantService()
        self.service.batch_size = 10

    def test_duplicate_submissions_update_existing_qdrant_record(self) -> None:
        self.service.ingest_single_resolution(
            incident_number="INC000005",
            short_description="Active VMware access provisioning issue",
            description="VMware profile is inactive after onboarding.",
            resolution_notes="First resolution.",
            assignment_group="VMware Access Provisioning",
            assigned_to="Karan Malhotra",
            created_date="2026-05-05T09:20:00",
            updated_date="2026-05-05T09:20:00",
        )
        self.service.ingest_single_resolution(
            incident_number="INC000005",
            short_description="Active VMware access provisioning issue",
            description="VMware profile is inactive after onboarding.",
            resolution_notes="Updated resolution.",
            assignment_group="VMware Access Provisioning",
            assigned_to="Karan Malhotra",
            created_date="2026-05-05T09:20:00",
            updated_date="2026-05-05T09:20:00",
        )

        self.assertEqual(len(self.service.qdrant_service.points_by_id), 1)
        point = next(iter(self.service.qdrant_service.points_by_id.values()))
        self.assertEqual(point.payload["incident_number"], "INC000005")
        self.assertEqual(point.payload["resolution_notes"], "Updated resolution.")


if __name__ == "__main__":
    unittest.main()
