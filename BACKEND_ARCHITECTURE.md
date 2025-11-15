# Continuum Backend Architecture

## 🏗️ Overview

The Continuum backend is built with **FastAPI + SQLAlchemy + PostgreSQL** and provides 4 core API endpoints for organizational knowledge management and risk analysis.

---

## 📁 File Structure & Responsibilities

### **Core Application Files**

#### 1. **[api/main.py](api/main.py)** - Main Application Entry Point
**Purpose:** Standalone FastAPI app (without Vercel dependencies)

**What it does:**
- Creates the FastAPI app instance
- Sets up CORS middleware for frontend (ports 3000, 3001)
- Initializes database on startup
- Mounts API routes at `/api` prefix
- Provides health check endpoint at `/health`

**When to use:**
- Local development: `python -m uvicorn api.main:app --reload`
- This is what `yarn dev` uses

#### 2. **[api/index.py](api/index.py)** - Vercel Production Entry
**Purpose:** FastAPI app with Vercel AI SDK integration

**What it does:**
- Same as `main.py` but includes Vercel-specific middleware
- Has `/api/chat` endpoint for Vercel AI SDK
- Used for deployment to Vercel

**When to use:**
- Production deployment on Vercel
- Don't use locally (has Python 3.10+ dependencies)

---

### **Database Layer**

#### 3. **[api/db.py](api/db.py)** - Database Configuration
**What it does:**
- Reads `DATABASE_URL` from environment (defaults to SQLite if not set)
- Creates SQLAlchemy `engine` and `SessionLocal` factory
- Provides `Base` for ORM models
- `init_db()`: Creates all tables
- `get_db()`: FastAPI dependency for getting DB sessions

**Environment variables:**
```bash
DATABASE_URL=postgresql+psycopg2://continuum:continuum@localhost:5555/continuum
```

#### 4. **[api/models.py](api/models.py)** - SQLAlchemy ORM Models
**What it does:**
Defines 6 database tables as Python classes:

1. **Person** (lines 18-32)
   - Represents team members/document owners
   - Fields: id, name, email, role, team, created_at
   - Relationship: One person can own many documents

2. **Document** (lines 34-61)
   - Internal documentation (runbooks, guides, playbooks)
   - Fields: id, title, owner_id, team, content, summary, critical, last_updated, created_at
   - Relationships: Belongs to Person, has many Topics and Systems

3. **Topic** (lines 63-75)
   - High-level knowledge areas (e.g., "Deployments", "Payroll")
   - Fields: id, name (unique)
   - Relationship: Many-to-many with Documents

4. **System** (lines 77-90)
   - Infrastructure/services (e.g., "ArgoCD", "HRIS")
   - Fields: id, name (unique), description
   - Relationship: Many-to-many with Documents

5. **DocumentTopic** (lines 92-107)
   - Association table linking Documents ↔ Topics
   - Composite primary key: (document_id, topic_id)
   - Extra field: added_at timestamp

6. **DocumentSystem** (lines 109-121)
   - Association table linking Documents ↔ Systems
   - Composite primary key: (document_id, system_id)
   - Extra field: added_at timestamp

**Database Schema Diagram:**
```
Person (1) ----< (many) Document
                          |
                          +----< DocumentTopic >---- Topic
                          |
                          +----< DocumentSystem >---- System
```

---

### **API Layer**

#### 5. **[api/routes.py](api/routes.py)** - HTTP Route Handlers
**What it does:**
Defines 4 API endpoints that call service functions:

**Endpoints:**

1. **POST /api/simulate-departure** (line 17)
   - Input: `{"person_id": 1}`
   - Calls: `services.simulate_departure()`
   - Output: Orphaned docs, impacted topics, under-documented systems, Claude handoff summary

2. **GET /api/documents/at-risk** (line 25)
   - Query param: `?recommend=true` (optional)
   - Calls: `services.compute_documents_at_risk()`
   - Output: Topic stats, document risk scores, team resilience score

3. **POST /api/query** (line 39)
   - Input: `{"question": "How do I deploy?"}`
   - Calls: `services.rag_answer()`
   - Output: Claude answer, referenced docs, people to contact

4. **POST /api/recommend-onboarding** (line 45)
   - Input: `{"mode": "team", "team": "Infra"}` OR `{"mode": "handoff", "person_leaving": 1, "person_joining": 2}`
   - Calls: `services.recommend_onboarding()`
   - Output: Claude-generated onboarding plan

#### 6. **[api/schemas.py](api/schemas.py)** - Pydantic Models
**What it does:**
Defines request/response data structures for type safety:

- `PersonBase`, `Person` - Person data
- `DocumentBase`, `Document` - Document data
- `Topic`, `System` - Topic/System data
- `SimulateRequest` - Input for simulate-departure endpoint
- `QueryRequest` - Input for query endpoint
- `OnboardingRequest` - Input for onboarding endpoint

**Why use Pydantic:**
- Automatic validation of incoming JSON
- Type hints for editor autocomplete
- Auto-generated API docs (Swagger)

---

### **Business Logic Layer**

#### 7. **[api/services.py](api/services.py)** - Core Business Logic
**What it does:**
Implements all 4 core features. This is where the magic happens!

**Functions:**

1. **compute_topic_stats()** (lines 9-27)
   - Computes per-topic statistics
   - Returns: docs_count, owners_count, staleness_days
   - Used by: Risk scoring system

2. **simulate_departure()** (lines 30-73)
   - **What happens when someone leaves?**
   - Finds orphaned documents (owned only by departing person)
   - Identifies impacted topics (where they're sole owner)
   - Detects under-documented systems (only in their docs)
   - Calls Claude to generate handoff summary + cross-training plan
   - **Algorithm:**
     ```python
     for each topic:
         if person owns ALL docs in topic:
             mark topic as "at risk"

     for each system:
         if system only mentioned in person's docs:
             mark as "under-documented"
     ```

3. **compute_documents_at_risk()** (lines 76-103)
   - **Risk Scoring Algorithm:**
     ```python
     risk_score = 0

     # Factor 1: Ownership (40 points)
     if owners_count <= 1:
         risk_score += 40

     # Factor 2: Staleness (30 points max)
     risk_score += min(30, staleness_days // 7)

     # Factor 3: Criticality (30 points)
     if critical == True:
         risk_score += 30

     risk_score = min(100, risk_score)
     ```
   - Computes team resilience: `100 - average_risk`
   - Returns: Topic stats, document scores, team resilience score

4. **select_relevant_docs()** (lines 106-120)
   - **Simple keyword-based retrieval**
   - Scores docs by word overlap with question
   - Falls back to most recent docs if no matches
   - Returns top k documents (default: 3)
   - **Future enhancement:** Replace with vector embeddings

5. **rag_answer()** (lines 123-138)
   - **RAG (Retrieval-Augmented Generation) Pipeline:**
     1. Select relevant docs via keyword matching
     2. Format docs with title, summary, content (first 1000 chars)
     3. Call Claude with: docs + question
     4. Extract document owners
     5. Return: answer, referenced docs, people to contact

6. **recommend_onboarding()** (lines 141-158)
   - **Two modes:**
     - **Team mode:** Onboarding plan for joining a team
       - Gets all docs for that team
       - Calls Claude to create learning path
     - **Handoff mode:** Knowledge transfer from person A → B
       - Gets all docs owned by person leaving
       - Calls Claude to create handoff plan
   - Returns: Claude-generated plan

---

### **LLM Integration**

#### 8. **[api/anthropic_client.py](api/anthropic_client.py)** - Claude API Wrapper
**What it does:**
- Single function: `call_claude(prompt, max_tokens, model)`
- Uses **modern Messages API** (not deprecated completion endpoint)
- Model: `claude-3-5-sonnet-20241022` (latest as of Nov 2024)
- **Graceful degradation:** Returns mocked response if no API key

**Request format:**
```json
{
  "model": "claude-3-5-sonnet-20241022",
  "max_tokens": 1024,
  "temperature": 0.2,
  "messages": [
    {"role": "user", "content": "Your prompt here"}
  ]
}
```

**Response parsing:**
```python
# Extract text from: {"content": [{"type": "text", "text": "..."}]}
return data["content"][0]["text"]
```

---

### **Database Setup Scripts**

#### 9. **[api/init_db.py](api/init_db.py)** - Table Creation
**What it does:**
- Calls `Base.metadata.create_all(engine)` to create all 6 tables
- Idempotent: Safe to run multiple times (won't duplicate tables)

**When to run:**
```bash
python -m api.init_db
```

**Output:**
```
Creating database tables...
✓ Database tables created successfully!
```

#### 10. **[api/seed_data.py](api/seed_data.py)** - Insert Sample Data
**What it does:**
- Inserts 6 people (Alice, Megan, Jason, Bob, Priya, Carlos)
- Inserts 8 realistic documents:
  - Deployment Runbook (Alice, critical)
  - Rollback Procedure (Carlos, critical)
  - Payroll Onboarding Runbook (Megan)
  - Vendor Payout Engine Guide (Bob, critical)
  - Billing Incident Playbook (Priya, critical)
  - CI/CD Troubleshooting Guide (Alice)
  - Payment Reconciliation Notes (Bob)
  - Payroll Compliance Checklist (Jason)

**Duplicate prevention:**
- Checks for existing people by email
- Checks for existing documents by title

**When to run:**
```bash
python -m api.seed_data
```

#### 11. **[api/ingest_topics_and_systems.py](api/ingest_topics_and_systems.py)** - Extract Metadata
**What it does:**
- Reads all documents from database
- For each document:
  1. Calls `extract_topics_and_systems_with_claude(content)`
  2. Gets back: `{topics: [...], systems: [...], summary: "..."}`
  3. Upserts Topic and System rows (no duplicates)
  4. Creates DocumentTopic and DocumentSystem links
  5. Updates Document.summary field

**Current implementation (lines 13-44):**
- **Keyword-based stub** (works without API key!)
- Looks for keywords like "deploy", "payroll", "argocd", etc.
- Extracts first 400 chars as summary

**Future enhancement:**
- Replace with real `call_claude()` for better extraction
- Prompt: "Extract topics, systems, and a summary from this document"

**When to run:**
```bash
python -m api.ingest_topics_and_systems
```

**Output:**
```
Found 8 documents to process
Ingest complete.
```

#### 12. **[api/healthcheck.py](api/healthcheck.py)** - Health Check Script
**What it does:**
Verifies the entire backend setup:
- ✅ Environment variables configured
- ✅ Database connection works
- ✅ All 6 tables exist
- ✅ Seed data loaded
- ✅ Topics/systems ingested
- ✅ API server running (if started)

**When to run:**
```bash
python -m api.healthcheck
```

---

## 🔄 Data Flow

### **1. Startup Flow**
```
User runs: yarn dev
  ↓
main.py starts
  ↓
init_db() called
  ↓
Tables created (if not exist)
  ↓
Server ready at :8000
```

### **2. API Request Flow**
```
Frontend makes request
  ↓
routes.py receives HTTP request
  ↓
Pydantic validates request body (schemas.py)
  ↓
Route calls service function (services.py)
  ↓
Service queries database (models.py)
  ↓
Service may call Claude (anthropic_client.py)
  ↓
Response formatted & returned
```

### **3. Example: Simulate Departure**
```
POST /api/simulate-departure {"person_id": 1}
  ↓
routes.py: simulate_departure()
  ↓
services.py: simulate_departure(db, person_id=1)
  ↓
1. Query Person with id=1 → Alice
2. Query Documents where owner_id=1 → 2 docs
3. For each Topic:
     Count unique owners
     If Alice is sole owner → add to impacted_topics
4. For each System:
     Get all docs mentioning it
     If all owned by Alice → add to under_documented
5. Build prompt with orphaned docs
6. Call Claude → get handoff summary
  ↓
Return: {
  person: {...},
  orphaned_docs: [...],
  impacted_topics: [...],
  under_documented_systems: [...],
  claude_handoff: "..."
}
```

---

## 🗄️ Current Database State

**Your database is fully seeded with:**
- ✅ 6 People
- ✅ 8 Documents
- ✅ 6 Topics (CI/CD, Deployments, Rollback, Payroll, Reconciliation, Billing)
- ✅ 4 Systems (ArgoCD, GitHub Actions, Payout Engine, HRIS)
- ✅ 10 Document-Topic links
- ✅ 7 Document-System links

**View the data:**
```bash
# Connect to database
docker exec -it claudehackathon-db-1 psql -U continuum -d continuum

# Sample queries
SELECT * FROM people;
SELECT * FROM documents;
SELECT * FROM topics;
SELECT * FROM systems;
```

---

## 🚀 Key Algorithms

### **Risk Scoring (services.py:84-96)**
```python
def calculate_risk(doc):
    score = 0

    # Single point of failure
    if doc.owners_count <= 1:
        score += 40

    # Staleness (1 week = ~4 points)
    score += min(30, doc.staleness_days // 7)

    # Business criticality
    if doc.critical:
        score += 30

    return min(100, score)
```

### **Bus Factor Detection (services.py:44-48)**
```python
for topic in all_topics:
    owners = set(doc.owner_id for doc in topic.documents)

    if person_leaving_id in owners and len(owners) == 1:
        # This topic will have ZERO owners after departure!
        impacted_topics.append(topic)
```

### **Document Retrieval (services.py:107-116)**
```python
def select_docs(question, k=3):
    question_words = set(question.lower().split())

    candidates = []
    for doc in all_docs:
        doc_words = set((doc.title + doc.summary).lower().split())
        overlap = len(question_words & doc_words)
        candidates.append((overlap, doc))

    # Sort by relevance, return top k
    return sorted(candidates, reverse=True)[:k]
```

---

## 🔌 Environment Variables

**Required:**
```bash
DATABASE_URL=postgresql+psycopg2://continuum:continuum@localhost:5555/continuum
```

**Optional (for real Claude responses):**
```bash
ANTHROPIC_API_KEY=sk-ant-...
```

**Where they're used:**
- `db.py`: Reads `DATABASE_URL` (defaults to SQLite if not set)
- `anthropic_client.py`: Reads `ANTHROPIC_API_KEY` (returns mocked responses if not set)

---

## 📊 Performance Considerations

**Current implementation:**
- ✅ Simple keyword matching (fast, no embeddings needed)
- ✅ In-memory calculations (good for < 1000 docs)
- ⚠️ No caching (Claude called on every request)
- ⚠️ No pagination (returns all results)

**Future optimizations:**
- Add Redis caching for Claude responses
- Use vector embeddings for better document retrieval
- Add pagination for large result sets
- Batch Claude API calls
- Add database indexes on frequently queried fields

---

## 🧪 Testing

**Manual testing:**
```bash
# Test health
curl http://localhost:8000/health

# Test risk analysis
curl http://localhost:8000/api/documents/at-risk | jq

# Test departure simulation
curl -X POST http://localhost:8000/api/simulate-departure \
  -H "Content-Type: application/json" \
  -d '{"person_id": 1}' | jq

# Test RAG
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I deploy?"}' | jq
```

**Interactive testing:**
- Visit http://localhost:8000/docs
- Swagger UI with "Try it out" buttons

---

## 🔒 Security Notes

**Current state (development):**
- ⚠️ No authentication
- ⚠️ No rate limiting
- ⚠️ CORS allows all localhost ports

**For production:**
- Add API key authentication
- Implement rate limiting (prevent abuse of Claude API)
- Restrict CORS to specific frontend domain
- Add input validation for SQL injection prevention
- Use environment-based secrets (not .env files)

---

## 📚 Dependencies

**Core:**
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `sqlalchemy` - ORM for database
- `psycopg2-binary` - PostgreSQL driver
- `pydantic` - Data validation
- `httpx` - HTTP client for Claude API
- `python-dotenv` - Environment variables

**Installed in:** `api/.venv/`

---

## 🎯 Summary

**What the backend does:**
1. ✅ Manages organizational knowledge graph (People ↔ Documents ↔ Topics ↔ Systems)
2. ✅ Computes risk scores based on bus factor, staleness, criticality
3. ✅ Simulates departures to identify knowledge gaps
4. ✅ Provides RAG-based Q&A over internal docs
5. ✅ Generates onboarding plans using Claude

**How it works:**
- FastAPI handles HTTP requests
- SQLAlchemy queries PostgreSQL database
- Business logic computes risk scores and detects gaps
- Claude generates natural language summaries and plans
- Everything returns JSON for frontend consumption

**Current status:**
- ✅ Fully implemented and tested
- ✅ Database seeded with realistic data
- ✅ Works without API key (mocked responses)
- ✅ Ready for frontend integration
