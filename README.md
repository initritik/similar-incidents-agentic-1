# AI-Powered Incident Resolution Assistant

This repository contains the initial project foundation for an AI-powered Incident Resolution Assistant. It includes a React, TypeScript, Vite, Tailwind CSS, and ShadCN UI frontend plus a Python 3.13 FastAPI backend.

No incident workflows, agent implementations, vector search, AI integrations, mock APIs, or business logic are included yet.

## Project Structure

```text
.
├── frontend/
├── backend/
├── docs/
├── .gitignore
└── README.md
```

## Frontend Setup

Prerequisites:

- Node.js 24 LTS or newer
- npm 11 or newer

Install dependencies:

```bash
cd frontend
npm install
```

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

