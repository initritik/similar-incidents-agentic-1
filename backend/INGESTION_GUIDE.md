# Ingestion Setup & Execution Guide

## Overview
The ingestion system creates OpenAI embeddings for all resolved incidents and their datafixes, then stores them in Qdrant for semantic similarity search.

## Prerequisites

### 1. OpenAI API Key
- Get from: https://platform.openai.com/api-keys
- Uses model: `text-embedding-3-small` (1536-dimensional vectors)

### 2. Qdrant Cloud Setup
- Sign up at: https://qdrant.tech/
- Create a cloud cluster
- Get URL (format: `https://xxxx.eu-west-2-0.aws.cloud.qdrant.io`)
- Generate API key

## Configuration

### Step 1: Set Environment Variables
Create or update `backend/.env`:

```
OPENAI_API_KEY=sk-proj-YOUR_KEY_HERE
QDRANT_URL=https://your-cluster.eu-west-2-0.aws.cloud.qdrant.io
QDRANT_API_KEY=YOUR_QDRANT_KEY_HERE
QDRANT_COLLECTION_NAME=incident_resolution_collection
INGESTION_BATCH_SIZE=10
LOG_LEVEL=INFO
```

### Step 2: Verify Credentials
The backend will validate credentials on startup. Check for these error messages:

```
ERROR: OPENAI_API_KEY not set
ERROR: QDRANT_URL not set
ERROR: QDRANT_API_KEY not set
```

## Running Ingestion

### From Backend Directory:

```powershell
# Navigate to backend
cd backend

# Activate virtual environment (if using venv)
& .\.venv\Scripts\Activate.ps1

# Run the ingestion script
python scripts/load_mock_data_to_qdrant.py
```

### Expected Output:

```
2026-06-11 14:32:15 - root - INFO - Starting ingestion script...
2026-06-11 14:32:15 - root - INFO - Environment variables loaded from .env
================================================================================
INGESTION PIPELINE STARTING
================================================================================

[Step 1] Initializing Qdrant collection...
[Step 1] ✓ Collection ready

[Step 2] Ingesting mock data with embeddings...
================================================================================
STARTING MOCK DATA INGESTION
================================================================================
Batch size: 10
Collected 5 resolved incidents with datafixes
Total batches to process: 1
Processing batch 1/1
  ✓ Batch 1 completed successfully (5 records)
================================================================================
INGESTION COMPLETED
  Total resolved incidents: 5
  With datafixes: 4
  Without datafixes: 1
  Successfully ingested: 5
  Failed: 0
================================================================================

[Step 3] INGESTION SUMMARY
--------------------------------------------------------------------------------
Total resolved incidents: 5
  With datafixes: 4
  Without datafixes: 1
Successfully ingested: 5
Failed batches: 0
Batch size: 10
Total batches: 1
--------------------------------------------------------------------------------

✓ INGESTION PIPELINE COMPLETED SUCCESSFULLY
```

## What Gets Ingested

### Resolved Incidents (will be ingested)
- INC000001 - VMware access not provisioned
- INC000002 - VMware entitlement missing
- INC000003 - VMware console access stuck
- INC000006 - Policy synchronization failed
- INC000007 - Data sync failed
- INC000008 - Database replication error

### Skipped (not resolved)
- INC000004 - WORK_IN_PROGRESS
- INC000005 - OPEN

## Data Format in Qdrant

Each record contains:
```json
{
  "id": "hash of incident_number",
  "vector": [/* 1536-dim OpenAI embedding */],
  "payload": {
    "incident_number": "INC000001",
    "short_description": "...",
    "description": "...",
    "state": "RESOLVED",
    "resolution_notes": "...",
    "assignment_group": "...",
    "assigned_to": "...",
    "created_date": "2026-05-01T09:12:00",
    "updated_date": "2026-05-01T11:30:00",
    "datafix_id": "DFX-INC000001",
    "datafix_description": "...",
    "datafix_code": "..."
  }
}
```

## Troubleshooting

### Error: "OPENAI_API_KEY environment variable is not set"
**Solution:** Add OPENAI_API_KEY to backend/.env and restart

### Error: "QDRANT_URL and QDRANT_API_KEY environment variables must be set"
**Solution:** Add QDRANT_URL and QDRANT_API_KEY to backend/.env and restart

### Error: "Failed to connect to Qdrant"
**Cause:** Qdrant cluster is not running or URL is incorrect
**Solution:**
- Verify Qdrant cloud cluster is running
- Check URL format (should end with :6333)
- Verify API key is correct

### Error: "API call failed with status 401"
**Cause:** Invalid OpenAI API key
**Solution:** Verify API key is correct and has quota available

### Error: "Collection already exists"
**Cause:** First run already created collection
**Solution:** Normal on second run, can safely re-run ingestion

## Monitoring Ingestion

### During Execution
- Check console output for progress
- Each batch will show success/failure count
- Look for "✓" marks indicating successful operations

### After Execution
- Check Qdrant Cloud dashboard to verify points were created
- Query should return results for INC000001, INC000002, etc.

## Performance Notes

- **Batch size:** 10 records per batch (configurable in .env)
- **Embedding time:** ~1-2 seconds per record (OpenAI API)
- **Total time:** ~30-60 seconds for all mock data
- **Vector dimension:** 1536 (text-embedding-3-small)
- **Distance metric:** Cosine similarity

## Next Steps

1. Verify ingestion completed successfully
2. Start the backend: `python -m uvicorn app.main:app --reload`
3. Start the frontend: `npm run dev`
4. Test with incident INC000001 (has similar resolved incidents)

## Load_dotenv Locations

The system loads environment variables at these points:
1. **backend/scripts/load_mock_data_to_qdrant.py** - Called at script startup
2. **backend/app/main.py** - Called when FastAPI starts
3. **EmbeddingService.__init__** - Reads OPENAI_API_KEY
4. **QdrantService.__init__** - Reads QDRANT_URL, QDRANT_API_KEY

This ensures credentials are available regardless of how the app is started.
