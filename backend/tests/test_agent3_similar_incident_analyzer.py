import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.agents.agent3_similar_incident_analyzer import Agent3SimilarIncidentAnalyzer


class Agent3SimilarIncidentAnalyzerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.agent = Agent3SimilarIncidentAnalyzer()

    def test_open_vmware_incident_returns_vmware_resolved_incidents(self) -> None:
        result = self.agent.analyze(
            self._agent2_response(
                [
                    self._match("INC000001", "VMware access not provisioned", 0.93),
                    self._match("INC000002", "VMware entitlement missing", 0.88),
                ]
            )
        )

        self.assertTrue(result.success)
        self.assertTrue(result.similar_incidents_found)
        self.assertEqual(result.message, "Similar incidents found.")
        self.assertEqual(result.match_count, 2)
        self.assertEqual(
            [match.incident_number for match in result.top_matches],
            ["INC000001", "INC000002"],
        )

    def test_open_claims_incident_returns_claims_resolved_incidents(self) -> None:
        result = self.agent.analyze(
            self._agent2_response(
                [
                    self._match("INC000021", "Claims batch failed", 0.9),
                    self._match("INC000022", "Claim stuck because policy flag is blocked", 0.82),
                ]
            )
        )

        self.assertTrue(result.similar_incidents_found)
        self.assertEqual(result.match_count, 2)
        self.assertEqual(result.top_matches[0].incident_number, "INC000021")
        self.assertEqual(result.top_matches[1].incident_number, "INC000022")

    def test_similarity_below_threshold_returns_no_matches(self) -> None:
        result = self.agent.analyze(
            self._agent2_response(
                [
                    self._match("INC000001", "VMware access not provisioned", 0.29),
                    self._match("INC000021", "Claims batch failed", 0.1),
                ]
            )
        )

        self.assertTrue(result.success)
        self.assertFalse(result.similar_incidents_found)
        self.assertEqual(result.message, "No similar incidents found.")
        self.assertEqual(result.match_count, 0)
        self.assertEqual(result.top_matches, [])

    def test_more_than_five_matches_returns_only_top_five(self) -> None:
        result = self.agent.analyze(
            self._agent2_response(
                [
                    self._match("INC000001", "Match 1", 0.41),
                    self._match("INC000002", "Match 2", 0.94),
                    self._match("INC000003", "Match 3", 0.73),
                    self._match("INC000004", "Match 4", 0.65),
                    self._match("INC000005", "Match 5", 0.86),
                    self._match("INC000006", "Match 6", 0.52),
                ]
            )
        )

        self.assertTrue(result.similar_incidents_found)
        self.assertEqual(result.match_count, 5)
        self.assertEqual(
            [match.incident_number for match in result.top_matches],
            ["INC000002", "INC000005", "INC000003", "INC000004", "INC000006"],
        )

    def test_returned_matches_include_associated_datafix_information(self) -> None:
        result = self.agent.analyze(
            self._agent2_response(
                [
                    self._match(
                        "INC000001",
                        "VMware access not provisioned",
                        0.93,
                        datafix={
                            "datafix_id": "DFX000001",
                            "description": "Activate VMware access profile.",
                            "datafix_code": "UPDATE USER_ACCESS SET ACCESS_STATUS='ACTIVE';",
                        },
                    )
                ]
            )
        )

        top_match = result.top_matches[0]
        self.assertEqual(top_match.datafix_id, "DFX000001")
        self.assertEqual(
            top_match.datafix_description,
            "Activate VMware access profile.",
        )
        self.assertIn("UPDATE USER_ACCESS", top_match.datafix_code)

    @staticmethod
    def _agent2_response(matches: list[dict]) -> dict:
        return {
            "success": True,
            "message": f"Found {len(matches)} similar incident(s).",
            "match_count": len(matches),
            "similar_incidents": matches,
        }

    @staticmethod
    def _match(
        incident_number: str,
        short_description: str,
        similarity_score: float,
        datafix: dict | None = None,
    ) -> dict:
        return {
            "incident_number": incident_number,
            "short_description": short_description,
            "description": f"{short_description} detailed description.",
            "state": "RESOLVED",
            "resolution_notes": "Issue was resolved.",
            "assignment_group": "Support",
            "assigned_to": "Analyst",
            "similarity_score": similarity_score,
            "datafix": datafix,
        }


if __name__ == "__main__":
    unittest.main()
