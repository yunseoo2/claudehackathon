# Continuum - Backend Setup Guide

## Overview

Continuum is a hackathon project that ingests internal documents and builds an organizational knowledge graph to compute risk, simulate departures, and provide RAG-style Q&A.

## Architecture

- **Backend**: FastAPI (Python) with SQLAlchemy
- **Database**: PostgreSQL (via Docker)
- **LLM**: Claude 3.5 Sonnet (Anthropic Messages API)
- **Frontend**: Next.js (assumed, not covered here)

---

## Setup Instructions

### 1. Start PostgreSQL Database

The project uses Docker Compose to run PostgreSQL locally.

```bash
# Start Postgres in the background
docker-compose up -d

# Verify it's running
docker-compose ps
```

**Database Configuration:**
- Host: `localhost:5555`
- Database: `continuum`
- User: `continuum`
- Password: `continuum`
- Volume: `continuum_pgdata` (persists data)

### 2. Set Up Python Environment

```bash
# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Edit [.env](.env) and add your Anthropic API key:

```bash
# .env file
DATABASE_URL=postgresql+psycopg2://continuum:continuum@localhost:5555/continuum
ANTHROPIC_API_KEY=sk-ant-...  # Get from https://console.anthropic.com/
```

**Note:** You can leave `ANTHROPIC_API_KEY` empty during development. The app will return mocked responses instead of calling Claude.

### 4. Initialize Database

```bash
# Create all tables
python -m api.init_db
```

This creates the following tables:
- `people` - Team members and document owners
- `documents` - Internal docs (runbooks, guides, etc.)
- `topics` - High-level topics (Deployments, Payroll, etc.)
- `systems` - Systems referenced in docs (ArgoCD, HRIS, etc.)
- `document_topics` - Many-to-many relationship
- `document_systems` - Many-to-many relationship

### 5. Seed Initial Data

```bash
# Insert sample people and documents
python -m api.seed_data
```

This adds:
- 6 people (Alice, Megan, Jason, Bob, Priya, Carlos)
- 8 documents (Deployment Runbook, Payroll Guide, etc.)

### 6. Ingest Topics and Systems

```bash
# Extract topics/systems from documents using Claude
python -m api.ingest_topics_and_systems
```

This script:
- Reads all documents from the database
- Calls Claude (or uses keyword matching if API key not set) to extract:
  - Topics (e.g., "Deployments", "Payroll", "CI/CD")
  - Systems (e.g., "ArgoCD", "HRIS", "Payout Engine")
  - Summary of the document
- Upserts topics/systems and creates links to documents

### 7. Start the FastAPI Server

```bash
# Run the API server with auto-reload
python -m uvicorn api.index:app --reload
```

The API will be available at: **http://localhost:8000**

---

## API Endpoints

### 1. Health Check
```http
GET /health
```

### 2. Simulate Departure
```http
POST /api/simulate-departure
Content-Type: application/json

{
  "person_id": 1
}
```

**Returns:**
- Orphaned documents (owned only by this person)
- Impacted topics (where they're the sole owner)
- Under-documented systems (referenced only in their docs)
- Claude-generated handoff summary and cross-training suggestions

### 3. Documents at Risk
```http
GET /api/documents/at-risk?recommend=true
```

**Returns:**
- Risk scores per document (based on bus factor, staleness, criticality)
- Topic statistics (docs count, owners count, staleness)
- Team resilience score (0-100)
- Optional: Claude-generated improvement recommendations (if `recommend=true`)

### 4. RAG Q&A
```http
POST /api/query
Content-Type: application/json

{
  "question": "How do I deploy a new service?"
}
```

**Returns:**
- Claude-generated answer based on relevant documents
- List of referenced documents
- People to contact for more info
- Resilience metadata (owners count, overall risk)

### 5. Onboarding Assistant
```http
POST /api/recommend-onboarding
Content-Type: application/json

# Team onboarding
{
  "mode": "team",
  "team": "Infra"
}

# OR handoff from one person to another
{
  "mode": "handoff",
  "person_leaving": 1,
  "person_joining": 2
}
```

**Returns:**
- Claude-generated onboarding plan with prioritized documents and learning path

---

## Database Schema

```
people
├── id (PK)
├── name
├── email (unique)
├── role
├── team
└── created_at

documents
├── id (PK)
├── title
├── owner_id (FK → people.id)
├── team
├── content (Text)
├── summary (Text)
├── critical (Boolean)
├── last_updated
└── created_at

topics
├── id (PK)
└── name (unique)

systems
├── id (PK)
├── name (unique)
└── description

document_topics (association table)
├── document_id (PK, FK → documents.id)
├── topic_id (PK, FK → topics.id)
└── added_at

document_systems (association table)
├── document_id (PK, FK → documents.id)
├── system_id (PK, FK → systems.id)
└── added_at
```

---

## Project Structure

```
claudehackathon/
├── api/
│   ├── __init__.py
│   ├── index.py              # FastAPI app entry point
│   ├── routes.py             # API route handlers
│   ├── services.py           # Business logic (risk scoring, RAG, etc.)
│   ├── db.py                 # SQLAlchemy setup (engine, session, Base)
│   ├── models.py             # ORM models (Person, Document, Topic, System)
│   ├── schemas.py            # Pydantic request/response models
│   ├── anthropic_client.py   # Claude API wrapper
│   ├── init_db.py            # Database initialization script
│   ├── seed_data.py          # Seed sample people and documents
│   └── ingest_topics_and_systems.py  # Extract topics/systems with Claude
├── docker-compose.yml        # PostgreSQL container config
├── .env                      # Environment variables
├── requirements.txt          # Python dependencies
├── README.md                 # Quick start guide
└── SETUP_GUIDE.md           # This file
```

---

## Development Workflow

1. **Make schema changes?**
   - Edit [api/models.py](api/models.py)
   - Drop and recreate tables: `python -m api.init_db`
   - Re-run seed: `python -m api.seed_data`

2. **Add new endpoints?**
   - Add Pydantic schemas to [api/schemas.py](api/schemas.py)
   - Add business logic to [api/services.py](api/services.py)
   - Add route handler to [api/routes.py](api/routes.py)

3. **Update Claude prompts?**
   - Edit prompt templates in [api/services.py](api/services.py)

4. **Switch to embeddings for better RAG?**
   - Replace `select_relevant_docs()` in [api/services.py](api/services.py:106-120)
   - Use OpenAI embeddings or Anthropic's embedding endpoint

---

## Troubleshooting

### Database connection errors
```bash
# Check if Postgres is running
docker-compose ps

# Check logs
docker-compose logs db

# Restart Postgres
docker-compose restart db
```

### Tables not created
```bash
# Re-run init script
python -m api.init_db
```

### Claude API errors
- Verify `ANTHROPIC_API_KEY` is set in `.env`
- Check API quota at https://console.anthropic.com/
- Review error messages in terminal output

### Port conflicts
- Postgres runs on **5555** (not default 5432) to avoid conflicts
- FastAPI runs on **8000** by default
- Frontend (Next.js) typically uses **3000** or **3001**

---

## Next Steps

1. **Frontend Integration**
   - Consume these API endpoints from your Next.js app
   - Build dashboards for at-risk documents and topic statistics
   - Add interactive departure simulation tool

2. **Production Deployment**
   - Use managed Postgres (e.g., Supabase, AWS RDS)
   - Set `DATABASE_URL` to production connection string
   - Add authentication/authorization
   - Enable CORS for your production frontend domain

3. **Enhancements**
   - Add vector embeddings for better document retrieval
   - Implement caching for expensive Claude calls
   - Add real-time staleness alerts
   - Build team dashboards and metrics
   - Add document versioning and change tracking

---

## Testing the API

You can test the API using `curl`, Postman, or the built-in FastAPI docs at **http://localhost:8000/docs**

### Example: Simulate Alice leaving

```bash
curl -X POST http://localhost:8000/api/simulate-departure \
  -H "Content-Type: application/json" \
  -d '{"person_id": 1}'
```

### Example: Get at-risk documents

```bash
curl http://localhost:8000/api/documents/at-risk?recommend=true
```

### Example: Ask a question

```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I rollback a deployment?"}'
```

---

## License

Hackathon project - use freely!
