#!/usr/bin/env python3
"""
Diagnostic script to check Qdrant collection status and data count.

Usage:
    python scripts/check_qdrant_data.py
"""

import os
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from app.vector_store.qdrant_service import QdrantService

load_dotenv()


def main():
    """Check Qdrant collection status."""
    print("=" * 80)
    print("QDRANT COLLECTION DIAGNOSTIC")
    print("=" * 80)

    try:
        # Initialize Qdrant service
        service = QdrantService()
        print(f"\n[Step 1] Connecting to Qdrant...")
        print(f"  Collection name: {service.collection_name}")

        # Check if collection exists
        exists = service.collection_exists()
        print(f"\n[Step 2] Checking collection existence...")
        if exists:
            print(f"  [OK] Collection EXISTS")
        else:
            print(f"  [FAIL] Collection DOES NOT EXIST")
            print(f"\n  Run ingestion first: python scripts/load_mock_data_to_qdrant.py")
            return

        # Get collection info
        print(f"\n[Step 3] Fetching collection info...")
        collection_info = service.client.get_collection(service.collection_name)
        print(f"  [OK] Collection retrieved")

        # Check point count
        point_count = collection_info.points_count
        print(f"\n[Step 4] Checking data...")
        print(f"  Points in collection: {point_count}")

        if point_count == 0:
            print(f"\n  [FAIL] NO DATA in collection!")
            print(f"  Run ingestion to load mock data: python scripts/load_mock_data_to_qdrant.py")
            return
        else:
            print(f"  [OK] Collection has data: {point_count} points")

        # Try a test search
        print(f"\n[Step 5] Testing search capability...")
        try:
            # Get first point to use as a search query
            points = service.client.scroll(
                collection_name=service.collection_name,
                limit=1,
                with_payload=True,
                with_vectors=True,
            )

            if points[0]:
                first_point = points[0][0]
                vector = first_point.vector

                if isinstance(vector, dict) and "default" in vector:
                    query_vector = vector["default"]
                else:
                    query_vector = vector

                results = service.client.query_points(
                    collection_name=service.collection_name,
                    query=query_vector,
                    limit=3,
                )
                print(f"  [OK] Search successful: Found {len(results.points)} results")

                # Print sample results
                if results.points:
                    print(f"\n  Sample results:")
                    for i, point in enumerate(results.points[:3], 1):
                        incident = point.payload.get("incident_number", "UNKNOWN")
                        score = point.score
                        print(f"    {i}. {incident} (score: {score:.4f})")

        except Exception as e:
            print(f"  [FAIL] Search test failed: {str(e)}")

        print(f"\n" + "=" * 80)
        print(f"STATUS: [OK] Qdrant collection is ready!")
        print(f"=" * 80)

    except Exception as e:
        print(f"\n[FAIL] Error: {str(e)}")
        print(f"\nTroubleshooting steps:")
        print(f"1. Check QDRANT_URL in backend/.env")
        print(f"2. Check QDRANT_API_KEY in backend/.env")
        print(f"3. Verify Qdrant Cloud is running")
        print(f"4. Run: python scripts/load_mock_data_to_qdrant.py")
        sys.exit(1)


if __name__ == "__main__":
    main()
