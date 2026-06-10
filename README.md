# AI-Powered Incident Resolution Assistant - 5-Agent Orchestration POC

## 🚀 Quick Start

**Start here:** [QUICK_START.md](./QUICK_START.md)

This is the complete guide for setting up and running the entire system in 5 minutes.

## System Architecture

**5-Agent Orchestration Pipeline:**
```
Incident Input
    ↓
Agent 1: Data Integrity Validation
    ↓
Agent 2: Semantic Similarity Search (using OpenAI embeddings + Qdrant)
    ↓
Agent 3: Similar Incident Analysis
    ↓
    ├─→ Agent 4: Resolution Capture (if no similar incidents)
    │
    └─→ Agent 5: Resolution Recommendation (if similar incidents found)
    ↓
Workflow Output
```

## Stack

**Frontend:**
- React 19 + TypeScript 6
- Vite build tool
- Tailwind CSS + ShadCN UI
- Real-time polling with exponential backoff

**Backend:**
- FastAPI (Python 3.11+)
- Pydantic v2 for data validation
- OpenAI embeddings (text-embedding-3-small)
- Qdrant Cloud for vector search
- Mock data for demo

## Key Features

✅ **End-to-End Integration** - Frontend and backend fully aligned  
✅ **DateTime Serialization** - Proper ISO string handling  
✅ **Error Resilience** - Exponential backoff polling  
✅ **Data Normalization** - Type-safe response handling  
✅ **Mock Data** - 5 resolved incidents with datafixes  
✅ **OpenAI Embeddings** - Semantic similarity search  
✅ **Qdrant Vector DB** - Cloud-based similarity search  

## Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | **START HERE** - Complete 5-minute setup |
| [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) | Architecture, contract alignment, datetime handling |
| [backend/INGESTION_GUIDE.md](./backend/INGESTION_GUIDE.md) | Setup vector database and load mock data |
| [backend/INGESTION_CLEANUP.md](./backend/INGESTION_CLEANUP.md) | What was refactored in ingestion system |
| [DEMO_VALIDATION.md](./DEMO_VALIDATION.md) | 9 test scenarios for validation |
| [SETUP_VECTOR_DB.md](./SETUP_VECTOR_DB.md) | Vector database prerequisites |
| [TROUBLESHOOTING_ERROR.md](./TROUBLESHOOTING_ERROR.md) | Common errors and solutions |
| [POLLING_BEHAVIOR.md](./frontend/src/utils/POLLING_BEHAVIOR.md) | Polling configuration details |

## Setup Overview

### Step 1: Configure Credentials
```
backend/.env
├── OPENAI_API_KEY=sk-proj-...
├── QDRANT_URL=https://...
└── QDRANT_API_KEY=...
```

### Step 2: Load Mock Data
```powershell
cd backend
python scripts/load_mock_data_to_qdrant.py
```

### Step 3: Start Backend
```powershell
python -m uvicorn app.main:app --reload
```

### Step 4: Start Frontend
```powershell
cd frontend
npm run dev
```

### Step 5: Test
Open http://localhost:5173 and enter incident number `INC000005`

## Project Status

| Aspect | Status | Notes |
|--------|--------|-------|
| **Integration** | ✅ Complete | All endpoints aligned |
| **DateTime Serialization** | ✅ Complete | ISO strings throughout |
| **Error Handling** | ✅ Complete | Comprehensive with recovery |
| **Polling Resilience** | ✅ Complete | Exponential backoff, max 3 errors |
| **Data Normalization** | ✅ Complete | Type-safe response handling |
| **Demo Ready** | ✅ Complete | All scenarios validated |
| **Vector DB** | ✅ Setup Guide Complete | Requires credentials |
| **OpenAI Integration** | ✅ Complete | Using text-embedding-3-small |

## Test Scenarios

1. ✅ Valid incident with similar incidents found
2. ✅ Valid incident with no similar incidents
3. ✅ Invalid incident format
4. ✅ Incident not found
5. ✅ Backend temporarily unavailable (resilience test)
6. ✅ Real-time status updates
7. ✅ Error message display
8. ✅ Multiple workflows
9. ✅ Performance validation

See [DEMO_VALIDATION.md](./DEMO_VALIDATION.md) for detailed scenarios.

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── agents/              # 5 agent implementations
│   │   ├── api/                 # Workflow and agent routes
│   │   ├── ingestion/           # Mock data ingestion with embeddings
│   │   ├── orchestrator/        # Workflow orchestration
│   │   ├── models/              # Data models
│   │   ├── services/            # Business logic
│   │   ├── vector_store/        # Qdrant + OpenAI integration
│   │   ├── schemas/             # Request/response schemas
│   │   ├── mock_data/           # Mock incidents and datafixes
│   │   └── main.py              # FastAPI app
│   ├── scripts/
│   │   └── load_mock_data_to_qdrant.py  # Ingestion script
│   ├── tests/                   # Unit tests
│   ├── .env                     # Credentials (confidential)
│   ├── requirements.txt         # Python dependencies
│   └── INGESTION_GUIDE.md       # Detailed ingestion setup
│
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API communication
│   │   ├── utils/               # dateUtils, dataMappers
│   │   ├── types/               # TypeScript types
│   │   ├── pages/               # Page components
│   │   └── App.tsx              # Main app
│   ├── package.json             # Node dependencies
│   └── vite.config.ts           # Vite configuration
│
├── docs/                        # Additional documentation
├── QUICK_START.md               # ⭐ START HERE
├── INTEGRATION_SUMMARY.md
├── DEMO_VALIDATION.md
├── TROUBLESHOOTING_ERROR.md
└── README.md
```

## Prerequisites

- **Node.js** 24+ (frontend)
- **Python** 3.11+ (backend)
- **OpenAI API Key** (for embeddings)
- **Qdrant Cloud Account** (for vector DB)
- **.env file** configured with credentials

## Backend Setup

```powershell
cd backend
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

## Frontend Setup

```powershell
cd frontend
npm install
```

## Troubleshooting

**Backend won't start:**
- Check `backend/.env` exists with all credentials
- Verify `OPENAI_API_KEY` and Qdrant credentials

**Workflow fails with "An unexpected error occurred":**
- Run ingestion script: `python scripts/load_mock_data_to_qdrant.py`
- Check backend logs for actual error

**Frontend can't reach backend:**
- Verify backend is running on `http://localhost:8000`
- Check health: `curl http://localhost:8000/health`

**For more help:** See [TROUBLESHOOTING_ERROR.md](./TROUBLESHOOTING_ERROR.md)

## Key Implementation Details

### DateTime Handling
- Backend serializes to ISO strings using `model_dump(mode="json")`
- Frontend parses ISO strings safely with `dateUtils.parseISO()`
- Displays in user-friendly format: "HH:MM:SS"

### Polling Strategy
- Initial poll interval: 1.5 seconds
- Exponential backoff: 1.5x multiplier per error
- Max 3 consecutive transient errors before stopping
- Terminal states: COMPLETED, FAILED

### Embeddings
- Model: `text-embedding-3-small`
- Dimension: 1536
- Input: incident short_description + description
- Used for semantic similarity search

### API Contracts
- All datetime fields: ISO 8601 strings
- Agent results: snake_case keys (agent_1, agent_2, etc.)
- Errors: Consistent HTTPException with detail field
- Status codes: 400 (validation), 404 (not found), 500 (server error)

## Demo Checklist

Before running the demo:
- [ ] Credentials configured in `backend/.env`
- [ ] Ingestion script run successfully
- [ ] Backend running and healthy
- [ ] Frontend running on localhost:5173
- [ ] Browser console open for debugging
- [ ] Test with INC000005

See [DEMO_VALIDATION.md](./DEMO_VALIDATION.md) for validation steps.

## Status

**Version:** 1.0 - Full Integration Complete  
**Date:** 2026-06-11  
**Ready:** ✅ Demo Ready  
**Next:** Production deployment planning

Run the frontend development server:

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173
```

## Backend Setup

Prerequisites:

- Python 3.13

Create a virtual environment from the `backend` directory.

Windows:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Linux/Mac:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

Install backend requirements:

```bash
pip install -r requirements.txt
```

Run the FastAPI development server:

```bash
uvicorn app.main:app --reload
```

Verify the health check:

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

## Notes

- Do not commit `.venv`; it is ignored by git.
- The frontend is scaffolded with Tailwind CSS and ShadCN UI conventions.
- The backend currently exposes only `GET /health`.

