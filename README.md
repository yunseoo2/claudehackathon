# Continuum

**Organizational knowledge graph for resilience, risk analysis, and smart onboarding**

Continuum is a comprehensive platform designed to enhance organizational knowledge management and resilience. It creates a structured knowledge graph connecting people, topics, and systems to identify risks, facilitate onboarding, and preserve institutional knowledge.

## Core Features

- **Resilience Radar**: Visualize knowledge fragility with real-time bus factor analytics
- **Onboarding Assistant**: Generate personalized onboarding plans with key contacts and documents
- **Transition Documentation**: Create handoff documentation when team members leave
- **Knowledge Q&A**: Access organizational knowledge with context-aware search

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Python, FastAPI, SQLAlchemy
- **Database**: SQLite (default), PostgreSQL (optional)
- **AI**: Claude API integration for knowledge processing

---

## Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 16+ & yarn/npm

### Installation

```bash
# Clone and install dependencies
git clone <your-repo-url>
cd claudehackathon
yarn install

# Setup Python environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Configuration

Create a `.env` file in the project root:

```env
# Database (SQLite is used by default)
# DATABASE_URL=postgresql+psycopg2://continuum:continuum@localhost:5432/continuum

# Anthropic API Key (optional)
ANTHROPIC_API_KEY=sk-ant-...
```

### Database Setup

```bash
# Initialize and seed the database
python -m api.init_db
python -m api.seed_data
python -m api.ingest_topics_and_systems
python migrate_db.py
python seed_onboarding_data.py
```

### Running the Application

```bash
# Start both frontend and backend
yarn dev

# Or start backend only
uvicorn api.main:app --reload --port 8000
```

Access points:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

---

## API Testing

### Interactive API Documentation
Visit http://localhost:8000/docs for interactive API documentation

### Key API Endpoints

```bash
# Knowledge Risk Assessment
GET /api/documents/at-risk

# Simulate Employee Departure
POST /api/simulate-departure

# Knowledge Query
POST /api/query

# Onboarding
POST /api/onboarding/personalized
GET /api/teams
GET /api/teams/{team_name}/roles
```

---

## API Reference

### Knowledge Management
- `GET /api/documents/at-risk` - Retrieve documents with high knowledge risk
- `POST /api/simulate-departure` - Simulate impact of employee departure
- `POST /api/query` - Query organizational knowledge

### Onboarding
- `POST /api/onboarding/personalized` - Generate personalized onboarding plan
- `GET /api/teams` - List all teams
- `GET /api/roles` - List all roles
- `GET /api/teams/{team_name}/roles` - Get roles for specific team
- `GET /api/teams/{team_name}/contacts` - Get contacts for specific team
- `GET /api/documents/by-team/{team_name}` - Get documents for specific team
- `GET /api/documents/by-role/{role_name}` - Get documents for specific role

---

## Additional Documentation

| Document | Description |
|----------|-------------|
| **[API_REFERENCE.md](API_REFERENCE.md)** | Complete API documentation with all endpoints, request/response formats, and examples |
| **[BACKEND_ARCHITECTURE.md](BACKEND_ARCHITECTURE.md)** | Deep dive into backend architecture, algorithms, and data flow |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Detailed setup instructions, troubleshooting, and configuration |
| **[PROJECT_STATUS.md](PROJECT_STATUS.md)** | Overall project status and implementation checklist |