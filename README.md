# Continuum

**Organizational knowledge graph for resilience, risk analysis, and smart onboarding**

Continuum ingests internal documents (runbooks, guides, onboarding docs) to build a knowledge graph of People ↔ Topics ↔ Systems. It computes risk (bus factor, staleness, criticality), simulates departures, and provides RAG-style Q&A with resilience metadata.

---

## 🚀 Quick Start (First Time Setup)

### Prerequisites
- Python 3.9+
- Node.js 16+ & yarn/npm

### 1. Clone & Install

```bash
# Clone the repo (if not already done)
git clone <your-repo-url>
cd claudehackathon

# Install frontend dependencies
yarn install
# OR: npm install
```

### 2. Backend Setup

```bash
# Create Python virtual environment (if not already created)
python3 -m venv api/.venv

# Activate it
source api/.venv/bin/activate  # Windows: api\.venv\Scripts\activate

# Install Python dependencies
pip install sqlalchemy==2.0.22 psycopg2-binary==2.9.6
```

### 3. Environment Configuration

Create a `.env` file in the project root to configure runtime secrets. `.env` is preferred and will take precedence over `.env.local`.

Example (edit values as needed):

```env
# Database (optional - leave commented to use SQLite fallback)
# DATABASE_URL=postgresql+psycopg2://continuum:continuum@localhost:5432/continuum

# Anthropic API Key (optional) — leave empty to use mocked LLM responses
ANTHROPIC_API_KEY=sk-ant-...
```

Notes:
- The app now prefers `.env` over `.env.local` (if both exist `.env` wins).
- If you do not set `DATABASE_URL`, the backend falls back to a local SQLite `dev.db`.

### 4. Initialize & Seed Database

Make sure your venv is activated (the project uses `api/.venv` by default):

```bash
source api/.venv/bin/activate
```

Create DB tables (the app also creates tables on startup):

```bash
# You can create tables programmatically by importing the DB module in Python:
python - <<'PY'
from api import db
db.init_db()
print('tables created')
PY
```

Seed sample data (recommended for demos):

```bash
# Seed people & documents (basic seeder)
python -m api.seed_data

# Run the ingest script to extract topics/systems and update document summaries
python -m api.ingest_topics_and_systems
```

Notes about the seed data:
- `api/seed_data.py` inserts several People and Documents (owners, teams, critical flags).
- `api/ingest_topics_and_systems.py` contains a stubbed extractor; it upserts `Topic` and `System` rows and links them to documents. Replace the stub with your Claude/Anthropic integration as needed.

### 5. Start Development Servers

Start frontend + backend together using the repo dev script:

```bash
yarn dev
# or
# npm run dev
```

You can also run just the backend (recommended during backend work):

```bash
uvicorn api.main:app --reload --port 8000
```

What runs:
- Backend API: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

To stop: press Ctrl+C

---

## 🔄 Daily Development (After First Setup)

```bash
# Just start both servers - database is already seeded
yarn dev
```

That's it! The SQLite database (`continuum.db`) persists between runs. No need to re-seed unless you want fresh data.

---

## 📦 Setting Up on a New Device

```bash
# 1. Clone repo
git clone <your-repo-url>
cd claudehackathon

# 2. Install dependencies
yarn install
python3 -m venv api/.venv
source api/.venv/bin/activate
pip install sqlalchemy==2.0.22 psycopg2-binary==2.9.6

# 3. Seed database
python -m api.init_db
python -m api.seed_data_rich
python -m api.ingest_topics_and_systems

# 4. Start dev servers
yarn dev
```

**Optional:** Add `ANTHROPIC_API_KEY` to `.env` for real Claude responses instead of mocked ones.

---

## 🧪 Testing the API

### Option 1: Interactive Docs (Recommended)
Visit http://localhost:8000/docs and use the "Try it out" buttons

### Option 2: cURL Examples

Use these exact commands (safe quoting) to test endpoints:

```bash
# Health
curl -sS -i http://localhost:8000/health

# At-risk documents
curl -sS http://localhost:8000/api/documents/at-risk | jq

# Simulate departure
curl -sS -i -H "Content-Type: application/json" -X POST http://localhost:8000/api/simulate-departure -d '{"person_id":1}'

# RAG query
curl -sS -i -H "Content-Type: application/json" -X POST http://localhost:8000/api/query -d '{"question":"How do I deploy?"}'

# Team onboarding
curl -sS -i -H "Content-Type: application/json" -X POST http://localhost:8000/api/recommend-onboarding -d '{"mode":"team","team":"Infra"}'
```

---

## Core Features

1. **Continuity Simulator** (`POST /api/simulate-departure`)
   - Compute bus factors, flag degraded topics
   - List orphaned docs and under-documented systems
   - Generate cross-training suggestions with Claude/Anthropic

2. **Resilience Radar** (`GET /api/documents/at-risk`)
   - Risk scoring per document and topic
   - Team resilience score (0-100)
   - Claude-powered improvement recommendations (optional)

3. **RAG Q&A** (`POST /api/query`)
   - Answer questions using relevant documents
   - List people to contact and resilience metadata

4. **Onboarding Assistant** (`POST /api/recommend-onboarding`)
   - Team onboarding plans
   - Person-to-person handoff guides

Anthropic integration notes:
- `api/anthropic_client.py` now reads `ANTHROPIC_API_KEY` at call time (so you can update `.env` without restarting) and includes simple retry/backoff for transient 5xx/429 errors.
- If `ANTHROPIC_API_KEY` is not set, the client returns a short mocked response to keep the app usable in development.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| **[API_REFERENCE.md](API_REFERENCE.md)** | Complete API documentation with all endpoints, request/response formats, and examples |
| **[BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)** | Deep dive into backend architecture, algorithms, and data flow |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Detailed setup instructions, troubleshooting, and configuration |
| **[PROJECT_STATUS.md](PROJECT_STATUS.md)** | Overall project status and implementation checklist |

---

## Tech Stack

- **Backend**: FastAPI + SQLAlchemy
- **Frontend**: Next.js + TypeScript + React
- **LLM**: Claude 3.5 Sonnet (Anthropic)
- **Database**: SQLite (default) or PostgreSQL (optional)
- **Backend**: FastAPI + SQLAlchemy
- **Frontend**: Next.js + TypeScript + React
- **LLM**: Claude (Anthropic) — optional; mocked when `ANTHROPIC_API_KEY` is absent
- **Database**: SQLite (default) or PostgreSQL (optional)