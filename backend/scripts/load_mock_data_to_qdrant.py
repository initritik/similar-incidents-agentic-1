#!/usr/bin/env python3
"""
Ingestion script for loading mock incidents and datafixes into Qdrant Cloud.

This script should be run manually after configuring the environment variables:
- OPENAI_API_KEY
- QDRANT_URL
- QDRANT_API_KEY
- QDRANT_COLLECTION_NAME (optional, defaults to incident_resolution_collection)
- INGESTION_BATCH_SIZE (optional, defaults to 10)

Usage:
    python scripts/load_mock_data_to_qdrant.py

The script will:
1. Connect to Qdrant Cloud
2. Create the collection if it does not exist
3. Load resolved incidents from mock data
4. Match incidents with their datafixes
5. Generate embeddings using OpenAI
6. Upsert records in batches
7. Print a summary

Note:
- Only RESOLVED incidents are ingested
- OPEN and WORK_IN_PROGRESS incidents are skipped
- The process is idempotent and safe to run multiple times
"""

import logging
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

logger = logging.getLogger(__name__)


def main():
    """Main entry point for the ingestion script."""
    try:
        # Import after loading environment
        from backend.app.ingestion.ingestion_runner import IngestionRunner

        # Run ingestion
        IngestionRunner.run()

    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()
