#!/usr/bin/env python3
"""Test script to check Qdrant connectivity."""
import os

# Set up environment
os.environ.setdefault("QDRANT_URL", "http://localhost:6333")
os.environ.setdefault("QDRANT_API_KEY", "test-key")

try:
    from qdrant_client import QdrantClient
    
    print("Attempting to connect to Qdrant...")
    client = QdrantClient(url="http://localhost:6333", api_key="test-key")
    
    # Try to get collections
    collections = client.get_collections()
    print(f"✓ Connected to Qdrant")
    print(f"  Collections: {len(collections.collections)}")
    
except Exception as e:
    print(f"✗ Error connecting to Qdrant:")
    print(f"  Type: {type(e).__name__}")
    print(f"  Message: {str(e)}")
