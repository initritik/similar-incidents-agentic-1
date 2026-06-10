#!/usr/bin/env python3
"""
DEPRECATED: Use backend/scripts/load_mock_data_to_qdrant.py instead.

This file is kept only for backward compatibility.
The main ingestion script is now at: backend/scripts/load_mock_data_to_qdrant.py
"""

import logging
import sys

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    logger.error("ERROR: This script has been moved!")
    logger.error("Please use: python scripts/load_mock_data_to_qdrant.py")
    logger.error("")
    logger.error("From the backend directory, run:")
    logger.error("  python scripts/load_mock_data_to_qdrant.py")
    sys.exit(1)
