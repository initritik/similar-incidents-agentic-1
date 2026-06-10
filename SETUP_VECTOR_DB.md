# Setup Instructions - Vector Database & Mock Data

## Issue
When you try to start a workflow with INC000005, you get "An unexpected error occurred" because Agent 2 (similarity search) requires the Qdrant vector database to be running and populated with mock data.

## Prerequisites
1. **OpenAI API Key** - Required for generating embeddings
2. **Qdrant Cloud Account** - For the vector database
   - Sign up at https://qdrant.tech/
   - Create a cloud cluster
   - Get your API Key and URL

## Setup Steps

### Step 1: Configure Environment Variables

Create or update `backend/.env` with:
```
OPENAI_API_KEY=your_openai_api_key_here
QDRANT_URL=https://your-cluster-url:6333
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=incident_resolution_collection
INGESTION_BATCH_SIZE=10
```

### Step 2: Activate Backend Virtual Environment

```powershell
# From the project root directory
cd backend
& .\.venv\Scripts\Activate.ps1
```

### Step 3: Load Mock Data to Qdrant

```powershell
# From backend directory with venv activated
python scripts/load_mock_data_to_qdrant.py
```

You should see output like:
```
Connecting to Qdrant at: https://your-cluster-url:6333
Creating/checking collection...
Loading mock incidents...
Generating embeddings and upserting to Qdrant...
Summary: X incidents processed successfully
```

### Step 4: Start Backend

```powershell
# From backend directory
python -m uvicorn app.main:app --reload
```

Backend should be running at `http://localhost:8000`

### Step 5: Start Frontend

In another terminal:
```powershell
cd frontend
npm install  # if not already done
npm run dev
```

Frontend should be running at `http://localhost:5173`

## Troubleshooting

### "Failed to connect to Qdrant" Error
- Check if QDRANT_URL is correct (should end in :6333)
- Verify QDRANT_API_KEY is valid
- Ensure Qdrant cluster is running

### "OPENAI_API_KEY not found" Error
- Verify .env file exists in `backend/` directory
- Check that OPENAI_API_KEY is set correctly
- Restart the backend after updating .env

### "No similar incidents found" (workflow succeeds but Agent 2 has no results)
- This is normal for the first run if mock data wasn't fully ingested
- Run the ingestion script again: `python scripts/load_mock_data_to_qdrant.py`
- Verify the script completed successfully with "X incidents processed"

### Still getting errors?
1. Check backend console for detailed error messages
2. Verify all environment variables are set correctly
3. Try re-running the mock data ingestion script
4. Restart both backend and frontend

## What Gets Ingested?

Only **RESOLVED** incidents are ingested into Qdrant for similarity matching:
- INC000001 (VMware access not provisioned) ✓
- INC000002 (VMware entitlement missing) ✓
- INC000003 (VMware console access stuck) ✓
- INC000006 (Policy synchronization failed) ✓
- INC000007 (Data sync failed) ✓
- INC000008 (Database replication error) ✓

**Not ingested** (OPEN/IN_PROGRESS):
- INC000004 (WORK_IN_PROGRESS)
- INC000005 (OPEN) - Only used for testing, not in vector DB

## Test Workflow

After setup is complete:
1. Go to http://localhost:5173
2. Enter: **INC000005**
3. Click "Start Workflow"
4. Should complete successfully with Agent 2 showing similar incidents found

✅ Success = Workflow completes without "An unexpected error occurred"
