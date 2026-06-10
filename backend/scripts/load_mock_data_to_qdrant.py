#!/usr/bin/env python3
"""
Mock Data Ingestion Script

This script loads resolved incidents and datafixes from mock data into Qdrant
and generates OpenAI embeddings for semantic similarity search.

Prerequisites:
    1. Create backend/.env with:
       - OPENAI_API_KEY
       - QDRANT_URL
       - QDRANT_API_KEY
       - QDRANT_COLLECTION_NAME (optional, defaults to incident_resolution_collection)
       - INGESTION_BATCH_SIZE (optional, defaults to 10)

    2. Install dependencies:
       pip install -r requirements.txt

Usage:
    From the backend directory:
    python scripts/load_mock_data_to_qdrant.py

Process:
    1. Load environment variables from .env file
    2. Connect to Qdrant Cloud
    3. Initialize the vector collection
    4. Load resolved incidents and match with datafixes
    5. Generate embeddings using OpenAI text-embedding-3-small
    6. Upsert records in batches to Qdrant
    7. Print ingestion summary

Results:
    - Only RESOLVED incidents are ingested (OPEN/WORK_IN_PROGRESS skipped)
    - Each record includes incident data + datafix data (if available) + embedding vector
    - The process is idempotent (safe to run multiple times)
    - Existing records are updated if incident_number matches
"""

import logging
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables from .env BEFORE any other imports
from dotenv import load_dotenv
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
        logger.info("Starting ingestion script...")
        logger.info("Environment variables loaded from .env")
        
        # Import AFTER loading environment
        from app.ingestion.ingestion_runner import IngestionRunner

        # Run the ingestion pipeline
        IngestionRunner.run()

    except Exception as e:
        logger.error(f"Fatal error: {str(e)}")
        logger.error("Check .env file and ensure all credentials are set correctly:")
        logger.error("  - OPENAI_API_KEY")
        logger.error("  - QDRANT_URL")
        logger.error("  - QDRANT_API_KEY")
        sys.exit(1)

#just for committing

if __name__ == "__main__":
    main()
