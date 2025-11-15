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

### 3. Environment Configuration (Optional)

```bash
# Copy the example env file (optional - only needed if using Anthropic API)
cp .env.example .env

# Optional: Add your Anthropic API key for real Claude responses
# Edit .env and add:
# ANTHROPIC_API_KEY=sk-ant-...
```

**Note:** The backend uses SQLite by default (`continuum.db`). To use PostgreSQL instead, set `DATABASE_URL` in your `.env` file.

### 4. Initialize & Seed Database

```bash
# Make sure venv is activated
source api/.venv/bin/activate

# Create tables
python -m api.init_db

# Insert rich, realistic sample data (recommended for demos)
python -m api.seed_data_rich

# Extract topics & systems from documents
python -m api.ingest_topics_and_systems

# Verify everything is set up
python -m api.healthcheck
```

**What gets seeded:**
- ✅ **15 people** across 6 diverse teams (Infrastructure, Backend, Payments, Finance, Support, Security)
- ✅ **16 detailed documents** with realistic content (deployment guides, security policies, payment flows, etc.)
- ✅ **Multiple risk profiles**: Critical + stale (90-180 days), critical + fresh, well-maintained
- ✅ **Single points of failure**: Security team has only 1 person (great for demos!)
- ✅ **6 topics** extracted from documents
- ✅ **Varied staleness**: 0-180 days (perfect for risk visualizations)
- ✅ Topics, systems, and interconnected relationships

**For simpler data** (optional):
```bash
# Use basic seed data instead (6 people, 8 documents)
python -m api.seed_data
```

### 5. Start Development Servers

```bash
# Start both frontend and backend together
yarn dev
# OR: npm run dev
```

**What runs:**
- ✅ Backend API: http://localhost:8000
- ✅ Frontend: http://localhost:3000
- ✅ API Docs: http://localhost:8000/docs

**To stop:** Press `Ctrl+C` (both servers will stop automatically)

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

```bash
# Check health
curl http://localhost:8000/health

# Get at-risk documents
curl http://localhost:8000/api/documents/at-risk | jq

# Simulate Alice leaving
curl -X POST http://localhost:8000/api/simulate-departure \
  -H "Content-Type: application/json" \
  -d '{"person_id": 1}' | jq

# Ask a question
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I deploy a new service?"}' | jq

# Get team onboarding plan
curl -X POST http://localhost:8000/api/recommend-onboarding \
  -H "Content-Type: application/json" \
  -d '{"mode": "team", "team": "Infra"}' | jq
```

---

## Core Features

1. **Continuity Simulator** (`POST /api/simulate-departure`)
   - Compute bus factors, flag degraded topics
   - List orphaned docs and under-documented systems
   - Generate cross-training suggestions with Claude

2. **Resilience Radar** (`GET /api/documents/at-risk`)
   - Risk scoring per document and topic
   - Team resilience score (0-100)
   - Claude-powered improvement recommendations

3. **RAG Q&A** (`POST /api/query`)
   - Answer questions using relevant documents
   - List people to contact and resilience metadata

4. **Onboarding Assistant** (`POST /api/recommend-onboarding`)
   - Team onboarding plans
   - Person-to-person handoff guides

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