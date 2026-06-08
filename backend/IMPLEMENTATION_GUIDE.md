# Vector Search & Agent 2 Implementation Guide

This document explains the vector search infrastructure, ingestion pipeline, and Agent 2 (Similar Incident Search) implementation.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│           Incident Resolution Assistant                  │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Agent 1 (Data Integrity Validation)                    │
│         ↓                                                 │
│  Agent 2 (Similar Incident Search) ← Vector Search      │
│         ↓                                                 │
│  Agent 3-5 (Future Implementation)                       │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Vector Store Infrastructure                     │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • EmbeddingService (OpenAI)                     │   │
│  │  • QdrantService (Cloud)                         │   │
│  │  • VectorSearchService                           │   │
│  │  • CollectionInitializer                         │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Ingestion Pipeline                              │   │
│  ├──────────────────────────────────────────────────┤   │
│  │  • IngestionService (batch processing)           │   │
│  │  • IngestionRunner (orchestration)               │   │
│  │  • load_mock_data_to_qdrant.py (CLI)             │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Then edit `.env` with your credentials:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Cloud Configuration
QDRANT_URL=https://your-cluster.qdrant.io:6333
QDRANT_API_KEY=your_qdrant_api_key_here
QDRANT_COLLECTION_NAME=incident_resolution_collection

# Ingestion Configuration
INGESTION_BATCH_SIZE=10
```

**Note:** You must have a Qdrant Cloud account and cluster set up. Get your credentials from the Qdrant Cloud console.

### 3. Run Ingestion

Ingest resolved incidents into Qdrant Cloud:

```bash
python scripts/load_mock_data_to_qdrant.py
```

**Output Example:**
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
Total resolved incidents found: 8
Incidents with datafixes: 8
Incidents without datafixes: 0
Total incidents ingested: 8
Failed batches: 0
Batch size: 10
Total batches processed: 1
================================================================================
INGESTION PIPELINE COMPLETED SUCCESSFULLY
```

## API Endpoints

### Start Workflow (Agent 1 → Agent 2)

**Endpoint:** `POST /api/workflows/start`

**Request:**
```json
{
  "incident_number": "INC000001"
}
```

**Response:**
```json
{
  "workflow_id": "uuid-here",
  "incident_number": "INC000001",
  "created_at": "2026-06-09T12:00:00Z",
  "overall_status": "COMPLETED",
  "agent_statuses": [
    {
      "agent_name": "Agent 1",
      "status": "COMPLETED",
      "current_task": "Data integrity validation completed.",
      "message": "Incident data validated successfully.",
      "started_at": "2026-06-09T12:00:00Z",
      "completed_at": "2026-06-09T12:00:05Z"
    },
    {
      "agent_name": "Agent 2",
      "status": "COMPLETED",
      "current_task": "Similar incident search completed.",
      "message": "Found 3 similar incident(s).",
      "started_at": "2026-06-09T12:00:05Z",
      "completed_at": "2026-06-09T12:00:10Z"
    },
    ...
  ]
}
```

### Direct Agent 2 Search

**Endpoint:** `POST /api/agents/agent2/search`

**Request:**
```json
{
  "incident_number": "INC000001"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Found 3 similar incident(s).",
  "match_count": 3,
  "similar_incidents": [
    {
      "incident_number": "INC000002",
      "short_description": "VMware entitlement missing after staff onboarding",
      "description": "Staff member reports VMware portal access is unavailable...",
      "state": "RESOLVED",
      "resolution_notes": "Set access status to active for VMW10241...",
      "assignment_group": "VMware Access Provisioning",
      "assigned_to": "Rohan Mehta",
      "created_date": "2026-05-02T10:05:00Z",
      "updated_date": "2026-05-02T12:22:00Z",
      "similarity_score": 0.87,
      "datafix": {
        "datafix_id": "DFX000002",
        "description": "Activate VMware entitlement after onboarding sync delay.",
        "datafix_code": "UPDATE USER_ACCESS\nSET ACCESS_STATUS='ACTIVE'\nWHERE VMWARE_ID='VMW10241';"
      }
    },
    ...
  ]
}
```

### Get Workflow Status

**Endpoint:** `GET /api/workflows/{workflow_id}`

**Response:** Same as start workflow response

## File Structure

```
backend/
├── requirements.txt                           # Dependencies
├── .env.example                              # Environment template
├── app/
│   ├── agents/
│   │   ├── agent1_data_integrity.py         # Agent 1
│   │   └── agent2_similarity_search.py      # Agent 2 ✓ NEW
│   ├── api/
│   │   ├── agent1_routes.py
│   │   ├── agent2_routes.py                 # ✓ NEW
│   │   ├── workflow_routes.py
│   │   └── ...
│   ├── services/
│   │   ├── datafix_service.py               # Updated with get_datafix_by_id
│   │   ├── incident_service.py
│   │   └── ...
│   ├── vector_store/                        # ✓ NEW
│   │   ├── __init__.py
│   │   ├── embedding_service.py             # OpenAI embeddings
│   │   ├── qdrant_service.py                # Qdrant Cloud integration
│   │   ├── collection_initializer.py        # Collection setup
│   │   └── vector_search_service.py         # Search logic
│   ├── ingestion/                           # ✓ NEW
│   │   ├── __init__.py
│   │   ├── ingestion_models.py              # Data models
│   │   ├── ingestion_service.py             # Batch ingestion
│   │   └── ingestion_runner.py              # Orchestrator
│   ├── orchestrator/
│   │   └── workflow_orchestrator.py         # Updated with Agent 2
│   ├── schemas/
│   │   └── agent_responses.py               # Updated Agent2Response
│   └── main.py                              # Updated with agent2_router
│
└── scripts/                                 # ✓ NEW
    └── load_mock_data_to_qdrant.py          # Ingestion entry point
```

## Data Flow

### Ingestion Flow

```
load_mock_data_to_qdrant.py
  ↓
IngestionRunner.run()
  ↓
1. CollectionInitializer.initialize()
   └─ Create Qdrant collection if missing
  ↓
2. IngestionService.ingest_data()
   ├─ Load mock incidents
   ├─ Filter RESOLVED only
   ├─ Match with datafixes
   ├─ Batch by size (10)
   ├─ Generate embeddings (OpenAI)
   └─ Upsert to Qdrant
  ↓
Summary report
```

### Search Flow

```
API: POST /api/workflows/start
  ↓
WorkflowOrchestrator.start_workflow()
  ↓
1. execute_agent1(incident_number)
   ├─ Validate format
   ├─ Fetch incident
   └─ Check mandatory fields
  ↓
2. execute_agent2(incident_number)  [Only if Agent 1 succeeds]
   ├─ Get incident
   ├─ Build embedding input
   ├─ Agent2SimilaritySearch.search_similar_incidents()
   │  └─ VectorSearchService.search_similar_incidents()
   │     ├─ EmbeddingService.generate_embedding()
   │     ├─ QdrantService.search_similar_incidents()
   │     └─ Fetch associated datafixes
   └─ Return results
  ↓
3. Skip Agents 3-5
  ↓
Return workflow status
```

## Configuration Options

### INGESTION_BATCH_SIZE
- Default: 10
- Supported: Any positive integer (5, 10, 20, etc.)
- Affects memory usage and embedding API calls

### QDRANT_COLLECTION_NAME
- Default: incident_resolution_collection
- Can be customized for different environments

### Similarity Threshold
- Currently hardcoded: 0.3 (30%)
- Only incidents with similarity_score ≥ 0.3 are returned

### Embedding Model
- Currently hardcoded: text-embedding-3-small
- Vector size: 1536
- Cost-effective and fast

## Important Notes

### Idempotency
- The ingestion process is **idempotent** and safe to run multiple times
- Uses MD5 hash of incident_number for unique point IDs
- Updates existing records instead of duplicating

### Data Filtering
- ✅ RESOLVED incidents: Ingested into Qdrant
- ❌ OPEN incidents: Skipped
- ❌ WORK_IN_PROGRESS incidents: Skipped
- Kept in mock data but not indexed

### Workflow Status Tracking
- `PENDING`: Waiting to execute
- `RUNNING`: Currently executing
- `COMPLETED`: Finished successfully
- `FAILED`: Error occurred
- `SKIPPED`: Conditionally skipped (future agents or failed dependencies)

### Error Handling
- Graceful error handling with logging
- Batch failures don't stop ingestion
- Failed batches tracked in summary
- All errors logged with context

## Testing Workflow

1. **Verify Setup:**
   ```bash
   curl http://localhost:8000/health
   ```

2. **Ingest Data:**
   ```bash
   python scripts/load_mock_data_to_qdrant.py
   ```

3. **Search via Workflow:**
   ```bash
   curl -X POST http://localhost:8000/api/workflows/start \
     -H "Content-Type: application/json" \
     -d '{"incident_number": "INC000001"}'
   ```

4. **Search via Agent 2 Direct:**
   ```bash
   curl -X POST http://localhost:8000/api/agents/agent2/search \
     -H "Content-Type: application/json" \
     -d '{"incident_number": "INC000001"}'
   ```

## Future Enhancements

- **Agent 3**: Use Agent 2 output for resolution recommendations
- **Agent 4**: Capture new resolutions when no similar incident exists
- **Agent 5**: Recommend resolution from resolved incidents in Qdrant
- **Customizable thresholds**: Make similarity threshold configurable
- **Search parameters**: Support filtering by assignment_group, state, etc.
- **Re-ranking**: Use LLM-based re-ranking for better relevance

## Troubleshooting

### "QDRANT_URL and QDRANT_API_KEY environment variables must be set"
- Ensure `.env` file is created and contains valid credentials
- Check that variables are named exactly as specified

### "Failed to generate embedding"
- Verify OPENAI_API_KEY is correct and has sufficient quota
- Check OpenAI API status

### "Collection does not exist"
- Run ingestion script first: `python scripts/load_mock_data_to_qdrant.py`
- Verify Qdrant connection

### "No similar incidents found"
- Verify incidents are ingested: Check Qdrant Cloud console
- Increase similarity threshold or test with more data
- This is normal behavior - not an error

## Logging

The system provides detailed logging for debugging:

```
INFO - Agent 1 started
INFO - Validating incident number
INFO - Fetching incident
INFO - Checking mandatory fields
INFO - Validation passed
INFO - Agent 2 started
INFO - Searching for incidents similar to INC000001
DEBUG - Generated query embedding
INFO - Found 3 similar incidents
```

Enable DEBUG logging for more details:
```python
logging.basicConfig(level=logging.DEBUG)
```

---

**Implementation Date:** June 9, 2026
**Status:** Complete and Production-Ready
