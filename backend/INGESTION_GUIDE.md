# Data Ingestion Guide

This document explains all the ways to ingest incidents and datafixes into Qdrant Cloud.

## Overview

The system provides **three methods** to ingest resolved incidents and their associated datafixes into Qdrant for semantic search:

1. **Manual Script** - For initial setup and bulk loading
2. **HTTP API Endpoints** - For programmatic ingestion from the frontend or external systems
3. **Incremental Ingestion** - For adding individual resolved incidents to the knowledge base

---

## Prerequisites

Before ingesting data, ensure your `.env` file is configured:

```env
# Required: OpenAI API key for generating embeddings
OPENAI_API_KEY=sk-your-actual-key-here

# Required: Qdrant Cloud credentials
QDRANT_URL=https://your-cluster.qdrant.io
QDRANT_API_KEY=your-qdrant-api-key-here
QDRANT_COLLECTION_NAME=incident_resolution_collection

# Optional: Batch size for processing (default: 10)
INGESTION_BATCH_SIZE=10
```

### Get Credentials

1. **OpenAI API Key**: https://platform.openai.com/account/api-keys
2. **Qdrant Cloud**: https://qdrant.tech/cloud/ (Sign up, create a cluster, get API key)

---

## Method 1: Manual Script (Recommended for Initial Setup)

### What it does:
- Loads all **RESOLVED** incidents from mock data
- Matches each incident with its datafix
- Generates embeddings using OpenAI's `text-embedding-3-small`
- Creates a Qdrant collection if it doesn't exist
- Upserts records in batches
- Prints a detailed summary

### How to run:

```bash
# From the backend directory
cd backend

# Option A: Using the script in backend/scripts/
python scripts/load_mock_data_to_qdrant.py

# Option B: Using the script in backend/app/scripts/
python app/scripts/load_mock_data_to_qdrant.py

# Option C: Using Python directly
python -m app.scripts.load_mock_data_to_qdrant
```

### Expected output:
```
================================================================================
STARTING INGESTION PIPELINE
================================================================================

[Step 1] Initializing Qdrant collection...
[Step 1] Collection initialization completed

[Step 2] Starting data ingestion...
[Step 2] Data ingestion completed

[Step 3] INGESTION SUMMARY
================================================================================
Total resolved incidents found: 20
Incidents with datafixes: 15
Incidents without datafixes: 5
Total incidents ingested: 20
Failed batches: 0
Batch size: 10
Total batches processed: 2
================================================================================
INGESTION PIPELINE COMPLETED SUCCESSFULLY
```

### Characteristics:
- ✅ Idempotent (safe to run multiple times)
- ✅ Detailed logging and error handling
- ✅ Batch processing for efficiency
- ✅ Skips non-RESOLVED incidents automatically
- ❌ Requires manual execution
- ❌ Cannot be triggered from the frontend

---

## Method 2: HTTP API Endpoints (Recommended for Runtime)

### Endpoint 1: Load All Incidents

**Load all resolved incidents into Qdrant:**

```http
POST /api/ingestion/load-all
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/ingestion/load-all \
  -H "Content-Type: application/json"
```

**Response:**
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

---

### Endpoint 2: Load Single Incident (Incremental)

**Ingest a single incident incrementally (useful after it's resolved):**

```http
POST /api/ingestion/load-single/{incident_number}
```

**cURL example:**
```bash
curl -X POST http://localhost:8000/api/ingestion/load-single/INC000001 \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Incident INC000001 successfully ingested into Qdrant."
}
```

**Possible responses:**
- `200 OK` - Incident successfully ingested
- `400 Bad Request` - Incident exists but is not RESOLVED
- `404 Not Found` - Incident not found
- `500 Internal Server Error` - Qdrant or embedding service error

**Note:** Only RESOLVED incidents are indexed. OPEN and WORK_IN_PROGRESS incidents are skipped.

---

### Endpoint 3: Check Ingestion Status

**Check if Qdrant is connected and collection exists:**

```http
GET /api/ingestion/status
```

**cURL example:**
```bash
curl http://localhost:8000/api/ingestion/status
```

**Response (Success):**
```json
{
  "message": "Qdrant is connected and collection exists.",
  "collection_name": "incident_resolution_collection",
  "ready": true
}
```

**Response (Collection Missing):**
```json
{
  "message": "Qdrant is connected but collection does not exist. Run /api/ingestion/load-all to create it.",
  "collection_name": "incident_resolution_collection",
  "ready": false
}
```

**Response (Connection Error):**
```json
{
  "message": "Cannot connect to Qdrant: [WinError 10061] No connection could be made... Check QDRANT_URL, QDRANT_API_KEY, and OPENAI_API_KEY in .env",
  "detail": "..."
}
```

---

## Method 3: Incremental Ingestion via Code

**If you want to programmatically ingest data in Python:**

```python
from app.ingestion.ingestion_service import IngestionService

# Create service
service = IngestionService()

# Option 1: Load all resolved incidents
summary = service.ingest_data()
print(f"Ingested {summary.total_incidents_ingested} incidents")

# Option 2: Load single incident
success = service.ingest_single_incident("INC000001")
if success:
    print("INC000001 ingested successfully")
```

---

## Data Ingestion Flow

```
Mock Data (incidents.py + datafixes.py)
         ↓
   Filter RESOLVED
         ↓
  Match with Datafix
         ↓
Generate Embeddings (OpenAI)
         ↓
    Batch Processing
         ↓
   Qdrant Cloud
```

---

## What Gets Ingested

**For each RESOLVED incident, the system indexes:**

| Field | Source | Used For |
|-------|--------|----------|
| `incident_number` | Mock data | Unique identifier |
| `short_description` | Mock data | Semantic search |
| `description` | Mock data | Semantic search |
| `resolution_notes` | Mock data | Semantic search |
| `assignment_group` | Mock data | Metadata |
| `assigned_to` | Mock data | Metadata |
| `state` | Mock data | Filtering (only RESOLVED) |
| `datafix_id` | Associated datafix | Knowledge base link |
| `datafix_description` | Associated datafix | Context |
| `datafix_code` | Associated datafix | Solution reference |
| `similarity_score` | Computed at search time | Ranking |

---

## Troubleshooting

### "Cannot connect to Qdrant"
- ✅ Check `QDRANT_URL` is correct (should be `https://...` for cloud)
- ✅ Check `QDRANT_API_KEY` is valid
- ✅ Ensure your Qdrant cluster is running
- ✅ Check firewall/network connectivity

### "Incorrect API key provided" (OpenAI)
- ✅ Check `OPENAI_API_KEY` starts with `sk-`
- ✅ Verify it's not a test key
- ✅ Check you have enough API credits

### "Collection does not exist"
- ✅ Run `/api/ingestion/load-all` or the manual script first
- ✅ This is normal on first setup

### "Incident not found" or "not in RESOLVED state"
- ✅ Check incident number format (e.g., INC000001)
- ✅ Only RESOLVED incidents can be ingested
- ✅ OPEN and WORK_IN_PROGRESS incidents are skipped

---

## Best Practices

### Initial Setup
1. Run the manual script: `python scripts/load_mock_data_to_qdrant.py`
2. Verify status: `GET /api/ingestion/status`
3. Test semantic search

### Runtime Updates
- Use `POST /api/ingestion/load-single/{incident_number}` when a new incident is resolved
- No need to reload the entire collection
- Updates are incremental and fast

### Monitoring
- Check logs for ingestion errors
- Use the status endpoint regularly
- Monitor OpenAI API usage (embeddings are billable)

---

## FAQ

**Q: Can I ingest real ServiceNow incidents instead of mock data?**
A: Currently, the system only supports mock data from `mock_data/incidents.py` and `mock_data/datafixes.py`. To support real data, you would need to modify the `IngestionService` class to connect to ServiceNow API instead.

**Q: How long does ingestion take?**
A: Depends on:
- Number of incidents (20 mock incidents ≈ 10-30 seconds)
- OpenAI API latency (50-200ms per embedding)
- Batch size (default: 10)
- Network speed

**Q: Can I change which incidents are indexed?**
A: Yes, modify the filter in `ingestion_service.py`:
```python
# Change this condition to adjust which incidents are indexed
if incident.state != IncidentState.RESOLVED:
    continue
```

**Q: Is ingestion reversible?**
A: You would need to:
1. Delete the collection in Qdrant Cloud dashboard, or
2. Use Qdrant API to delete specific points

**Q: Can I update existing incident embeddings?**
A: Yes, re-ingesting the same incident will overwrite the old embedding (idempotent).

---

## Next Steps

1. ✅ Configure `.env` with your credentials
2. ✅ Run initial ingestion: `python scripts/load_mock_data_to_qdrant.py`
3. ✅ Verify: `GET /api/ingestion/status`
4. ✅ Run workflows to test semantic search
5. ✅ Use `/api/ingestion/load-single/{incident_number}` for incremental updates

