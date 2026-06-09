# Quick Start: Data Ingestion

## Why No API Before?

Previously, there was **only a manual Python script** (`scripts/load_mock_data_to_qdrant.py`) to ingest incidents. This required:
- Stopping the backend server
- Running the script manually from terminal
- No way to trigger ingestion from the frontend
- No status checking capability

## What's Changed

I've added **3 new HTTP endpoints** to the backend so you can:
- ✅ Ingest data programmatically from the frontend
- ✅ Check if Qdrant is ready
- ✅ Add individual incidents without reloading everything
- ✅ No manual script execution needed

---

## The 3 Ways to Ingest Data

### Method 1: Via Frontend/REST API

**Load all incidents:**
```bash
curl -X POST http://localhost:8000/api/ingestion/load-all
```

**Check status:**
```bash
curl http://localhost:8000/api/ingestion/status
```

**Add single incident:**
```bash
curl -X POST http://localhost:8000/api/ingestion/load-single/INC000001
```

### Method 2: Via Python Script (Still Available)

```bash
cd backend
python scripts/load_mock_data_to_qdrant.py
```

This is still available and recommended for **initial bulk loading** during development.

### Method 3: Programmatically in Python

```python
from app.ingestion.ingestion_service import IngestionService

service = IngestionService()
summary = service.ingest_data()  # Load all
service.ingest_single_incident("INC000001")  # Load one
```

---

## Files Added/Modified

### Created:
- `backend/app/api/ingestion_routes.py` - New API endpoints
- `backend/INGESTION_GUIDE.md` - Detailed documentation

### Modified:
- `backend/app/api/__init__.py` - Export ingestion router
- `backend/app/main.py` - Include ingestion router

---

## Quick Setup

1. **Configure `.env`** with your Qdrant and OpenAI credentials:
   ```env
   OPENAI_API_KEY=sk-your-key-here
   QDRANT_URL=https://your-cluster.qdrant.io
   QDRANT_API_KEY=your-key-here
   ```

2. **Check status:**
   ```bash
   curl http://localhost:8000/api/ingestion/status
   ```

3. **Load incidents:**
   - Option A: Run script: `python scripts/load_mock_data_to_qdrant.py`
   - Option B: Call API: `POST /api/ingestion/load-all`

4. **Verify:** Check status again to confirm collection was created

---

## API Responses

### Successful Load-All:
```json
{
  "total_resolved_incidents": 20,
  "incidents_with_datafixes": 15,
  "incidents_without_datafixes": 5,
  "total_incidents_ingested": 20,
  "failed_count": 0,
  "batch_size": 10,
  "total_batches": 2
}
```

### Successful Single Incident:
```json
{
  "message": "Incident INC000001 successfully ingested into Qdrant."
}
```

### Status Check:
```json
{
  "message": "Qdrant is connected and collection exists.",
  "collection_name": "incident_resolution_collection",
  "ready": true
}
```

---

## Key Points

- 🔄 **Idempotent**: Running ingestion multiple times is safe
- 📚 **Only RESOLVED**: Only incidents with state=RESOLVED are indexed
- 🚀 **Batch Processing**: Handles large datasets efficiently (default: 10 items per batch)
- 📊 **Detailed Logs**: Both script and API provide detailed logging
- 🔧 **Error Handling**: Proper HTTP status codes and error messages

---

## For Complete Details

See `backend/INGESTION_GUIDE.md` for:
- Detailed endpoint documentation
- Troubleshooting guide
- FAQ
- Advanced configuration
- Data flow diagram

