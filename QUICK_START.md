# Complete System Startup Guide

## Quick Start (5 minutes)

### 1. Backend Setup & Ingestion

```powershell
# Terminal 1: Backend
cd backend
& .\.venv\Scripts\Activate.ps1
python scripts/load_mock_data_to_qdrant.py  # Load mock data with embeddings
python -m uvicorn app.main:app --reload     # Start backend
```

### 2. Frontend Setup

```powershell
# Terminal 2: Frontend
cd frontend
npm install                                   # If first time
npm run dev                                   # Start frontend
```

### 3. Test Workflow

1. Open http://localhost:5173
2. Enter: **INC000005**
3. Click "Start Workflow"
4. Watch agents execute in real-time
5. See results after completion

## Prerequisites

✅ **OpenAI API Key** - Set in `backend/.env`  
✅ **Qdrant Cloud** - URL and API key in `backend/.env`  
✅ **Node.js** - For frontend  
✅ **Python 3.11+** - For backend  
✅ **Virtual environment** - Already set up in `backend/.venv`  

## Important Files

### Backend
- `backend/.env` - Credentials for OpenAI and Qdrant
- `backend/scripts/load_mock_data_to_qdrant.py` - Ingestion script (RUN THIS FIRST)
- `backend/INGESTION_GUIDE.md` - Detailed ingestion setup
- `backend/INGESTION_CLEANUP.md` - What was refactored
- `backend/app/main.py` - FastAPI application

### Frontend
- `frontend/.env` - API base URL (should be `http://localhost:8000`)
- `frontend/src/services/workflowService.ts` - API communication
- `frontend/src/utils/dateUtils.ts` - DateTime handling
- `frontend/src/utils/dataMappers.ts` - Response normalization

### Documentation
- `INTEGRATION_SUMMARY.md` - Architecture and integration details
- `DEMO_VALIDATION.md` - Test scenarios
- `SETUP_VECTOR_DB.md` - Vector database setup
- `TROUBLESHOOTING_ERROR.md` - Common errors
- `POLLING_BEHAVIOR.md` - Polling configuration

## Startup Order

**CRITICAL: Follow this exact order!**

```
1. backend/.env configured ✓
   ↓
2. Run: python scripts/load_mock_data_to_qdrant.py (one-time)
   ↓
   Output: "✓ INGESTION PIPELINE COMPLETED SUCCESSFULLY"
   ↓
3. Start backend: python -m uvicorn app.main:app --reload
   ↓
   Output: "INFO:     Uvicorn running on http://127.0.0.1:8000"
   ↓
4. Start frontend: npm run dev
   ↓
   Output: "Local: http://localhost:5173"
   ↓
5. Open browser: http://localhost:5173
   ↓
6. Test workflow with INC000005
```

## What Happens During Startup

### Step 1: Ingestion
1. Load .env file (OPENAI_API_KEY, QDRANT_URL, QDRANT_API_KEY)
2. Connect to Qdrant Cloud
3. Create `incident_resolution_collection` if needed
4. Load 5 resolved incidents from mock data
5. For each incident:
   - Generate embedding using OpenAI text-embedding-3-small
   - Create Qdrant point with embedding + incident data + datafix data
6. Upsert all points to Qdrant

### Step 2: Backend Startup
1. Load .env file
2. Initialize FastAPI app
3. Register all 8 routers (agents, workflows, incidents, datafixes)
4. Create singleton instances of services:
   - WorkflowOrchestrator
   - EmbeddingService (connects to OpenAI)
   - QdrantService (connects to Qdrant)
5. Health check endpoint ready

### Step 3: Frontend Startup
1. Vite dev server starts
2. TypeScript compilation
3. API service configured (points to http://localhost:8000)
4. Ready to accept user input

## Testing the System

### Scenario 1: Valid Incident with Similar Incidents
```
Input: INC000005
Expected Flow:
  Agent 1 → Validate incident ✓
  Agent 2 → Search similar incidents ✓ (finds INC000001-3, 6-8)
  Agent 3 → Analyze incidents ✓
  Agent 4 → SKIPPED (similar found)
  Agent 5 → Recommendation ✓
Output: Shows similar incidents + recommendation
```

### Scenario 2: Invalid Format
```
Input: INVALID123
Expected: Immediate error "Invalid incident format"
```

### Scenario 3: Network Resilience
```
Steps:
1. Start workflow
2. Kill backend (Ctrl+C)
3. Observe: polling continues with backoff
4. Restart backend
5. Observe: workflow resumes and completes
```

## Troubleshooting

### Backend won't start
```
Error: OPENAI_API_KEY not found
Action: Check backend/.env exists and has OPENAI_API_KEY

Error: QDRANT connection failed
Action: Verify QDRANT_URL format and API key in .env
```

### Workflow fails with "An unexpected error occurred"
```
Action: Run ingestion again
$ python scripts/load_mock_data_to_qdrant.py
```

### Frontend can't reach backend
```
Error: Network error
Action: Verify backend is running on http://localhost:8000
```

### Ingestion hangs
```
Likely: OpenAI API timeout (embeddings are slow)
Action: Wait up to 60 seconds, or check API key quota
```

## Health Checks

### Backend Health
```powershell
curl http://localhost:8000/health
# Expected: {"status":"healthy"}
```

### Qdrant Connection
```powershell
# Check in backend logs for:
# "QdrantService initialized with collection: incident_resolution_collection"
```

### Embeddings Working
```powershell
# Check in ingestion output for:
# "Embedding generated successfully. Vector size: 1536"
```

## Performance Expectations

| Operation | Time | Notes |
|-----------|------|-------|
| Ingestion | 30-60s | First-time OpenAI embeddings generation |
| Workflow Start | 1-2s | Returns immediately with workflow_id |
| Polling Interval | 1.5s | Starts, increases with backoff on errors |
| Workflow Completion | 10-15s | Total time from start to "COMPLETED" |
| Full UI Load | <3s | Frontend asset loading |

## Common Issues & Fixes

### "collection_exists() failed"
- Already exists → Normal, continue
- Connection error → Check QDRANT_URL and API_KEY

### "API rate limit"
- Hit OpenAI rate limit
- Wait 1-2 minutes and retry ingestion

### "Workflow stuck on Agent 2"
- Embeddings not generated properly
- Re-run ingestion script

### "Workflow completes but shows "COMPLETED" without results"
- Data normalization issue
- Check browser console for errors
- Verify all agents returned results

## Advanced: Running Without Frontend

```powershell
# If you just want to test the API:
cd backend
& .\.venv\Scripts\Activate.ps1
python -m uvicorn app.main:app

# Then in another terminal:
curl -X POST http://localhost:8000/api/workflows/start \
  -H "Content-Type: application/json" \
  -d '{"incident_number":"INC000005"}'
```

## Environment Variables Reference

```bash
# backend/.env

# OpenAI
OPENAI_API_KEY=sk-proj-...        # Required: Your OpenAI API key

# Qdrant Cloud
QDRANT_URL=https://....eu-west...  # Required: Qdrant cluster URL
QDRANT_API_KEY=eyJ...             # Required: Qdrant API key
QDRANT_COLLECTION_NAME=...        # Optional: Defaults to incident_resolution_collection

# Ingestion
INGESTION_BATCH_SIZE=10           # Optional: Batch size for ingestion
LOG_LEVEL=INFO                    # Optional: DEBUG, INFO, WARNING, ERROR
```

## Next Steps After Demo

1. ✅ Verify all workflows work (see DEMO_VALIDATION.md)
2. ⬜ Add persistent database (instead of mock data)
3. ⬜ Add user authentication
4. ⬜ Deploy to staging environment
5. ⬜ Load testing for concurrent workflows
6. ⬜ Production deployment

## Support

For detailed information, see:
- Architecture: [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
- Ingestion: [backend/INGESTION_GUIDE.md](./backend/INGESTION_GUIDE.md)
- Testing: [DEMO_VALIDATION.md](./DEMO_VALIDATION.md)
- Errors: [TROUBLESHOOTING_ERROR.md](./TROUBLESHOOTING_ERROR.md)

---

**Status:** ✅ Ready to Demo  
**Last Updated:** 2026-06-11  
**Credentials:** Already configured in backend/.env
