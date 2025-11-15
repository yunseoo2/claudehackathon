# Continuum API Reference

Complete reference for all API endpoints with request/response formats and examples.

**Base URL:** `http://localhost:8000`

---

## Health & Info Endpoints

### GET `/health`

Health check endpoint.

**Request:** None

**Response:**
```json
{
  "status": "ok",
  "service": "continuum-api"
}
```

**Example:**
```bash
curl http://localhost:8000/health
```

---

### GET `/`

Root endpoint with API information.

**Request:** None

**Response:**
```json
{
  "service": "Continuum API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/health",
  "endpoints": {
    "simulate_departure": "POST /api/simulate-departure",
    "documents_at_risk": "GET /api/documents/at-risk",
    "rag_query": "POST /api/query",
    "recommend_onboarding": "POST /api/recommend-onboarding",
     "teams": "GET /api/teams",
     "roles": "GET /api/roles",
     "team_roles": "GET /api/teams/{team_name}/roles",
     "team_contacts": "GET /api/teams/{team_name}/contacts",
     "personalized_onboarding": "POST /api/onboarding/personalized",
     "team_documents": "GET /api/documents/by-team/{team_name}",
     "role_documents": "GET /api/documents/by-role/{role_name}"
  }
}
```

**Example:**
```bash
curl http://localhost:8000/
```

---

## Core API Endpoints

### 1. POST `/api/simulate-departure`

**Summary:** Simulate a person leaving the organization and analyze impact on knowledge continuity.

**What it does:**
- Identifies documents that become orphaned (no owner)
- Finds topics with degraded bus factor (sole expert leaving)
- Detects under-documented systems (only referenced in their docs)
- Generates Claude-powered handoff summary and cross-training suggestions

**Request Body:**
```json
{
  "person_id": 1
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| person_id | integer | Yes | ID of the person leaving |

**Response:**
```json
{
  "person": {
    "id": 1,
    "name": "Alice"
  },
  "orphaned_docs": [
    {
      "id": 1,
      "title": "Deployment Runbook"
    },
    {
      "id": 6,
      "title": "CI/CD Troubleshooting Guide"
    }
  ],
  "impacted_topics": [
    {
      "topic_id": 1,
      "name": "CI/CD",
      "reason": "sole owner leaving"
    },
    {
      "topic_id": 2,
      "name": "Deployments",
      "reason": "sole owner leaving"
    }
  ],
  "under_documented_systems": [
    {
      "system_id": 1,
      "name": "ArgoCD"
    },
    {
      "system_id": 4,
      "name": "GitHub Actions"
    }
  ],
  "claude_handoff": "Based on the analysis, here is a recommended handoff plan:\n\n1. **Immediate Actions:**\n   - Transfer ownership of Deployment Runbook to Carlos\n   - Schedule knowledge transfer sessions for CI/CD pipeline\n\n2. **Cross-Training Priorities:**\n   - High: Deployment procedures and rollback processes\n   - Medium: GitHub Actions workflow maintenance\n   - Medium: ArgoCD configuration and troubleshooting\n\n3. **Documentation Gaps:**\n   - Create video walkthrough of deployment process\n   - Document common ArgoCD failure scenarios\n\n4. **Timeline:**\n   - Week 1: Shadow deployments\n   - Week 2-3: Supervised handoff\n   - Week 4: Independent operation with support available"
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| person | object | Person who is leaving (id, name) |
| orphaned_docs | array | Documents with no remaining owners |
| impacted_topics | array | Topics losing their sole expert |
| under_documented_systems | array | Systems only referenced in their docs |
| claude_handoff | string | AI-generated handoff plan and cross-training suggestions |

**Error Response (404):**
```json
{
  "detail": "person not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/simulate-departure \
  -H "Content-Type: application/json" \
  -d '{"person_id": 1}' | jq
```

---

### 2. GET `/api/documents/at-risk`

**Summary:** Get risk analysis for all documents and topics, with team resilience score.

**What it does:**
- Calculates risk score (0-100) for each document based on:
  - Bus factor (fewer owners = higher risk)
  - Staleness (days since last update)
  - Criticality (critical docs score higher)
- Computes team resilience score (0-100, higher is better)
- Optionally generates Claude-powered improvement recommendations

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| recommend | boolean | No | false | Whether to include Claude recommendations |

**Response:**
```json
{
  "topic_stats": [
    {
      "topic_id": 1,
      "topic": "CI/CD",
      "docs_count": 2,
      "owners_count": 1,
      "staleness_days": 0
    },
    {
      "topic_id": 2,
      "topic": "Deployments",
      "docs_count": 2,
      "owners_count": 1,
      "staleness_days": 0
    },
    {
      "topic_id": 4,
      "topic": "Payroll",
      "docs_count": 2,
      "owners_count": 2,
      "staleness_days": 0
    }
  ],
  "documents": [
    {
      "id": 1,
      "title": "Deployment Runbook",
      "risk_score": 70,
      "owners_count": 1,
      "staleness_days": 0
    },
    {
      "id": 2,
      "title": "Rollback Procedure",
      "risk_score": 70,
      "owners_count": 1,
      "staleness_days": 0
    },
    {
      "id": 3,
      "title": "Payroll Onboarding Runbook",
      "risk_score": 40,
      "owners_count": 1,
      "staleness_days": 0
    }
  ],
  "team_resilience_score": 45.0,
  "recommendations": "Based on the risk analysis, here are key improvement areas:\n\n1. **High-Risk Documents (Score 70+):**\n   - Deployment Runbook: Assign secondary owner, create video walkthrough\n   - Rollback Procedure: Schedule cross-training with 2+ team members\n   - Vendor Payout Engine: Document tribal knowledge, add runbook examples\n\n2. **Bus Factor Concerns:**\n   - CI/CD topic: Only 1 owner across 2 docs - needs knowledge sharing\n   - Deployments: Critical dependency on single person\n\n3. **Quick Wins:**\n   - Review and update all docs to reduce staleness\n   - Assign co-owners to critical documents\n   - Schedule monthly doc review rotations"
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| topic_stats | array | Per-topic statistics (docs count, owners, staleness) |
| documents | array | All documents with risk scores |
| team_resilience_score | number | Overall team score (0-100, higher is better) |
| recommendations | string | Claude-generated recommendations (only if recommend=true) |

**Risk Score Calculation:**
```
risk_score = 0

# Single point of failure (40 points)
if owners_count <= 1:
    risk_score += 40

# Staleness (up to 30 points, ~4 per week)
risk_score += min(30, staleness_days / 7)

# Business criticality (30 points)
if critical == True:
    risk_score += 30

# Cap at 100
risk_score = min(100, risk_score)
```

**Team Resilience Score:**
```
average_risk = sum(doc_scores) / document_count
team_resilience_score = 100 - average_risk
```

**Examples:**
```bash
# Basic risk analysis
curl http://localhost:8000/api/documents/at-risk | jq

# With Claude recommendations
curl "http://localhost:8000/api/documents/at-risk?recommend=true" | jq
```

---

### 3. POST `/api/query`

**Summary:** RAG (Retrieval-Augmented Generation) Q&A over internal documentation.

**What it does:**
- Step 1: Retrieves relevant documents using keyword matching
- Step 2: Calls Claude with documents + question
- Returns: Answer, referenced docs, people to contact, resilience metadata

**Request Body:**
```json
{
  "question": "How do I deploy a new service?"
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | The question to answer |

**Response:**
```json
{
  "answer": "To deploy a new service, follow these steps:\n\n1. **Pre-deployment Checks:**\n   - Checkout the release branch\n   - Run health checks and verify migrations are ready\n   - Review the deployment runbook for any service-specific requirements\n\n2. **Execute Deployment:**\n   - Use ArgoCD to deploy the service\n   - The deployment runbook specifies: 'Execute deployment via ArgoCD'\n\n3. **Post-deployment Validation:**\n   - Run smoke tests immediately after deployment\n   - Monitor dashboards for 15 minutes\n   - Verify all health endpoints are responding\n\n4. **Rollback Procedure (if needed):**\n   - If issues are detected, refer to the Rollback Procedure\n   - Identify the failed release and tag\n   - Revert to the previous stable manifest\n\n**Key Contacts:**\n- Alice (Infra team) - Primary deployment expert\n- Carlos (Infra team) - Rollback procedures\n\n**Resilience Notes:**\n- The deployment documentation is critical and currently owned by a single person\n- Consider cross-training additional team members on this process",
  "referenced_docs": [
    {
      "id": 1,
      "title": "Deployment Runbook"
    },
    {
      "id": 2,
      "title": "Rollback Procedure"
    },
    {
      "id": 6,
      "title": "CI/CD Troubleshooting Guide"
    }
  ],
  "people_to_contact": [1, 6]
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| answer | string | Claude-generated answer based on relevant docs |
| referenced_docs | array | Documents used to answer the question |
| people_to_contact | array | IDs of document owners (experts on this topic) |

**Document Retrieval Algorithm:**
```python
# Simple keyword matching (can be upgraded to embeddings)
question_words = set(question.lower().split())

for doc in all_docs:
    doc_words = set((doc.title + doc.summary).lower().split())
    overlap = len(question_words & doc_words)

# Return top 3 by overlap score
# Fallback to most recent if no matches
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What should I do if a deployment fails?"
  }' | jq
```

---

### 4. POST `/api/recommend-onboarding`

**Summary:** Generate onboarding plans using Claude.

**What it does:**
- **Team mode:** Creates learning path for someone joining a team
- **Handoff mode:** Creates knowledge transfer plan from person A → person B

**Request Body (Team Mode):**
```json
{
  "mode": "team",
  "team": "Infra"
}
```

**Request Body (Handoff Mode):**
```json
{
  "mode": "handoff",
  "person_leaving": 1,
  "person_joining": 2
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| mode | string | Yes | Either "team" or "handoff" |
| team | string | Conditional | Required if mode="team". Team name to onboard to. |
| person_leaving | integer | Conditional | Required if mode="handoff". ID of person leaving. |
| person_joining | integer | Conditional | Required if mode="handoff". ID of person joining. |

**Response:**
```json
{
  "plan": "# Infra Team Onboarding Plan\n\n## Week 1: Foundation & Access\n**Objectives:** Get familiar with infrastructure basics and gain necessary access\n\n### Documents to Review:\n1. **Deployment Runbook** (Critical - Priority 1)\n   - Learn the end-to-end deployment process\n   - Understand pre-deploy checks and health monitoring\n   - Shadow 2-3 deployments before attempting independently\n\n2. **Rollback Procedure** (Critical - Priority 1)\n   - Study rollback scenarios and procedures\n   - Understand how to identify failed releases\n   - Practice in staging environment\n\n3. **CI/CD Troubleshooting Guide** (Priority 2)\n   - Common CI/CD failures and fixes\n   - Build log inspection techniques\n\n### Hands-on Activities:\n- Set up local development environment\n- Get access to ArgoCD, GitHub Actions\n- Review recent deployment logs\n- Attend daily standup and deployment planning\n\n### Mentorship:\n- Primary: Alice (alice@infra.example.com)\n- Secondary: Carlos (carlos@platform.example.com)\n- Schedule 3x weekly 1:1 check-ins\n\n---\n\n## Week 2-3: Supervised Practice\n**Objectives:** Perform deployments and rollbacks with supervision\n\n### Activities:\n- Shadow Alice during 5+ deployments\n- Perform 2-3 supervised deployments\n- Practice rollback in staging\n- Document any gaps or questions\n\n### Documents to Deep Dive:\n- Re-read deployment runbook with real-world context\n- Understand edge cases and common issues\n\n---\n\n## Week 4: Independent Operation\n**Objectives:** Own deployments independently with backup support\n\n### Milestones:\n- Perform first independent deployment\n- Handle a rollback scenario (staged or real)\n- Update documentation with learnings\n- Join on-call rotation (with shadow support)\n\n---\n\n## Knowledge Gaps to Address:\n- **High Risk:** Deployment and CI/CD docs have single owners - schedule cross-training\n- **Systems:** Ensure understanding of ArgoCD and GitHub Actions beyond docs\n\n## Success Metrics:\n- 5+ successful deployments\n- 1+ successful rollback\n- Contribution to documentation improvements\n- Comfort level: Ready for on-call rotation"
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| plan | string | Claude-generated onboarding or handoff plan in Markdown format |

**Example (Team Mode):**
```bash
curl -X POST http://localhost:8000/api/recommend-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "team",
    "team": "Payroll"
  }' | jq
```

**Example (Handoff Mode):**
```bash
curl -X POST http://localhost:8000/api/recommend-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "handoff",
    "person_leaving": 1,
    "person_joining": 6
  }' | jq
```

---

### 5. GET `/api/teams`

**Summary:** Get all teams in the organization.

**What it does:**
- Returns a list of all teams in the organization
- Includes team name, description, and ID

**Request:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "Infra",
    "description": "Infrastructure team responsible for deployments and CI/CD"
  },
  {
    "id": 2,
    "name": "Payroll",
    "description": "Handles employee payroll processing"
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Team ID |
| name | string | Team name |
| description | string | Team description |

**Example:**
```bash
curl http://localhost:8000/api/teams | jq
```

---

### 6. GET `/api/roles`

**Summary:** Get all roles in the organization.

**What it does:**
- Returns a list of all roles in the organization
- Includes role name, description, team association, and ID

**Request:** None

**Response:**
```json
[
  {
    "id": 1,
    "name": "SRE",
    "description": "Site Reliability Engineer",
    "team": "Infra"
  },
  {
    "id": 2,
    "name": "Platform Engineer",
    "description": "Platform infrastructure engineer",
    "team": "Infra"
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Role ID |
| name | string | Role name |
| description | string | Role description |
| team | string | Associated team name |

**Example:**
```bash
curl http://localhost:8000/api/roles | jq
```

---

### 7. GET `/api/teams/{team_name}/roles`

**Summary:** Get roles specific to a team.

**What it does:**
- Returns a list of roles for a specific team
- Filters roles by team association

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team_name | string | Yes | Name of the team to get roles for |

**Response:**
```json
[
  {
    "id": 1,
    "name": "SRE",
    "description": "Site Reliability Engineer",
    "team": "Infra"
  },
  {
    "id": 2,
    "name": "Platform Engineer",
    "description": "Platform infrastructure engineer",
    "team": "Infra"
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Role ID |
| name | string | Role name |
| description | string | Role description |
| team | string | Associated team name |

**Error Response (404):**
```json
{
  "detail": "team not found"
}
```

**Example:**
```bash
curl http://localhost:8000/api/teams/Infra/roles | jq
```

---

### 8. GET `/api/teams/{team_name}/contacts`

**Summary:** Get key contact persons for a specific team.

**What it does:**
- Returns a list of contact persons for a specific team
- Includes contact reason and priority

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team_name | string | Yes | Name of the team to get contacts for |

**Response:**
```json
[
  {
    "id": 1,
    "person_id": 1,
    "person_name": "Alice",
    "person_role": "SRE",
    "contact_reason": "Primary contact for deployments",
    "priority": 1
  },
  {
    "id": 2,
    "person_id": 6,
    "person_name": "Carlos",
    "person_role": "Platform Engineer",
    "contact_reason": "Contact for rollback procedures",
    "priority": 2
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Contact info ID |
| person_id | integer | ID of the contact person |
| person_name | string | Name of the contact person |
| person_role | string | Role of the contact person |
| contact_reason | string | Reason to contact this person |
| priority | integer | Priority (1=primary, 2=secondary, etc.) |

**Error Response (404):**
```json
{
  "detail": "team not found"
}
```

**Example:**
```bash
curl http://localhost:8000/api/teams/Infra/contacts | jq
```

---

### 9. POST `/api/onboarding/personalized`

**Summary:** Generate personalized onboarding materials based on team and role.

**What it does:**
- Combines team and role information to provide personalized onboarding materials
- Returns relevant documents, key contacts, and an AI-generated onboarding plan

**Request Body:**
```json
{
  "team": "Infra",
  "role": "SRE"
}
```

**Request Schema:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| team | string | Yes | Team name |
| role | string | No | Role name (optional) |

**Response:**
```json
{
  "team": "Infra",
  "role": "SRE",
  "plan": "# Personalized Onboarding Plan for SRE in Infra Team\n\n## Week 1: Foundation & Access\n**Objectives:** Get familiar with infrastructure basics and gain necessary access\n\n### Documents to Review:\n1. **Deployment Runbook** (Critical - Priority 1)\n   - Learn the end-to-end deployment process\n   - Understand pre-deploy checks and health monitoring\n   - Shadow 2-3 deployments before attempting independently\n\n2. **Rollback Procedure** (Critical - Priority 1)\n   - Study rollback scenarios and procedures\n   - Understand how to identify failed releases\n   - Practice in staging environment\n\n...",
  "relevant_docs": [
    {
      "id": 1,
      "title": "Deployment Runbook"
    },
    {
      "id": 2,
      "title": "Rollback Procedure"
    }
  ],
  "key_contacts": [
    {
      "id": 1,
      "person_id": 1,
      "person_name": "Alice",
      "person_role": "SRE",
      "contact_reason": "Primary contact for deployments",
      "priority": 1
    },
    {
      "id": 2,
      "person_id": 6,
      "person_name": "Carlos",
      "person_role": "Platform Engineer",
      "contact_reason": "Contact for rollback procedures",
      "priority": 2
    }
  ]
}
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| team | string | Team name |
| role | string | Role name (if provided) |
| plan | string | Claude-generated onboarding plan in Markdown format |
| relevant_docs | array | Documents relevant to the team and role |
| key_contacts | array | Key contacts for the team |

**Error Response (404):**
```json
{
  "detail": "team not found"
}
```

**Example:**
```bash
curl -X POST http://localhost:8000/api/onboarding/personalized \
  -H "Content-Type: application/json" \
  -d '{
    "team": "Infra",
    "role": "SRE"
  }' | jq
```

---

### 10. GET `/api/documents/by-team/{team_name}`

**Summary:** Get documents relevant to a specific team.

**What it does:**
- Returns a list of documents associated with a specific team

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| team_name | string | Yes | Name of the team to get documents for |

**Response:**
```json
[
  {
    "id": 1,
    "title": "Deployment Runbook",
    "summary": "Deployment procedures for production releases"
  },
  {
    "id": 2,
    "title": "Rollback Procedure",
    "summary": "How to roll back failed deployments"
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Document ID |
| title | string | Document title |
| summary | string | Document summary |

**Error Response (404):**
```json
{
  "detail": "team not found"
}
```

**Example:**
```bash
curl http://localhost:8000/api/documents/by-team/Infra | jq
```

---

### 11. GET `/api/documents/by-role/{role_name}`

**Summary:** Get documents relevant to a specific role.

**What it does:**
- Returns a list of documents associated with a specific role
- Optionally filters by team

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| role_name | string | Yes | Name of the role to get documents for |

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| team_name | string | No | null | Filter by team name |

**Response:**
```json
[
  {
    "id": 1,
    "title": "Deployment Runbook",
    "summary": "Deployment procedures for production releases"
  },
  {
    "id": 6,
    "title": "CI/CD Troubleshooting Guide",
    "summary": "Troubleshooting common CI/CD issues"
  }
]
```

**Response Schema:**
| Field | Type | Description |
|-------|------|-------------|
| id | integer | Document ID |
| title | string | Document title |
| summary | string | Document summary |

**Error Response (404):**
```json
{
  "detail": "role not found"
}
```

**Example:**
```bash
# Get documents for a role
curl http://localhost:8000/api/documents/by-role/SRE | jq

# Get documents for a role in a specific team
curl "http://localhost:8000/api/documents/by-role/SRE?team_name=Infra" | jq
```

---

## Common Response Patterns

### Success Response
All successful requests return HTTP 200 with a JSON body.

### Error Responses

**404 Not Found:**
```json
{
  "detail": "person not found"
}
```

**422 Validation Error:**
```json
{
  "detail": [
    {
      "loc": ["body", "person_id"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error"
}
```

---

## Data Types Reference

### Person Object
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@infra.example.com",
  "role": "SRE",
  "team": "Infra",
  "created_at": "2024-11-15T18:00:00Z"
}
```

### Document Object
```json
{
  "id": 1,
  "title": "Deployment Runbook",
  "owner_id": 1,
  "team": "Infra",
  "content": "Step-by-step deployment runbook...",
  "summary": "Deployment procedures for production releases",
  "critical": true,
  "last_updated": "2024-11-15T18:00:00Z",
  "created_at": "2024-11-15T18:00:00Z"
}
```

### Topic Object
```json
{
  "id": 1,
  "name": "Deployments"
}
```

### System Object
```json
{
  "id": 1,
  "name": "ArgoCD",
  "description": "GitOps continuous delivery tool"
}
```

---

## Rate Limits

**Current:** No rate limits (development mode)

**Production recommendations:**
- 100 requests/minute per IP
- 1000 requests/hour per API key
- Claude-powered endpoints: 10 requests/minute (due to LLM costs)

---

## Authentication

**Current:** No authentication required (local development)

**Production setup:**
- Add API key header: `X-API-Key: your-key-here`
- Or use Bearer token: `Authorization: Bearer your-token`

---

## Interactive API Docs

Visit **http://localhost:8000/docs** for:
- ✅ Swagger UI with "Try it out" buttons
- ✅ Auto-generated from code (always up-to-date)
- ✅ Request/response schemas
- ✅ Live testing without curl

---

## Testing Examples

### Full Workflow Example

```bash
# 1. Check system health
curl http://localhost:8000/health

# 2. Get risk analysis
RISK=$(curl -s http://localhost:8000/api/documents/at-risk)
echo $RISK | jq '.team_resilience_score'

# 3. Simulate Alice leaving
SIMULATION=$(curl -s -X POST http://localhost:8000/api/simulate-departure \
  -H "Content-Type: application/json" \
  -d '{"person_id": 1}')

echo $SIMULATION | jq '.orphaned_docs | length'
echo "Orphaned docs count"

# 4. Ask how to handle the transition
ANSWER=$(curl -s -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the deployment process?"}')

echo $ANSWER | jq -r '.answer'

# 5. Generate onboarding plan for replacement
PLAN=$(curl -s -X POST http://localhost:8000/api/recommend-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "handoff",
    "person_leaving": 1,
    "person_joining": 6
  }')

echo $PLAN | jq -r '.plan'
```

---

## Seeded Test Data

The database comes pre-seeded with:

**People (6):**
1. Alice (Infra, SRE)
2. Megan (Payroll, Payroll Lead)
3. Jason (Payroll, Payroll Eng)
4. Bob (Payments, Payments Eng)
5. Priya (Billing, Billing)
6. Carlos (Infra, Platform)

**Documents (8):**
- ID 1: Deployment Runbook (Alice, critical)
- ID 2: Rollback Procedure (Carlos, critical)
- ID 3: Payroll Onboarding Runbook (Megan)
- ID 4: Vendor Payout Engine Guide (Bob, critical)
- ID 5: Billing Incident Playbook (Priya, critical)
- ID 6: CI/CD Troubleshooting Guide (Alice)
- ID 7: Payment Reconciliation Notes (Bob)
- ID 8: Payroll Compliance Checklist (Jason)

**Topics (6):**
CI/CD, Deployments, Rollback, Payroll, Reconciliation, Billing

**Systems (4):**
ArgoCD, GitHub Actions, Payout Engine, HRIS

---

## SDK Examples (Future)

### Python
```python
import requests

BASE_URL = "http://localhost:8000"

# Simulate departure
response = requests.post(
    f"{BASE_URL}/api/simulate-departure",
    json={"person_id": 1}
)
simulation = response.json()
print(f"Orphaned docs: {len(simulation['orphaned_docs'])}")

# Get risk analysis
risk = requests.get(f"{BASE_URL}/api/documents/at-risk").json()
print(f"Team resilience: {risk['team_resilience_score']}")
```

### JavaScript/TypeScript
```typescript
const BASE_URL = 'http://localhost:8000';

// Simulate departure
const simulation = await fetch(`${BASE_URL}/api/simulate-departure`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ person_id: 1 })
}).then(r => r.json());

console.log(`Orphaned docs: ${simulation.orphaned_docs.length}`);

// Get risk analysis
const risk = await fetch(`${BASE_URL}/api/documents/at-risk`)
  .then(r => r.json());
console.log(`Team resilience: ${risk.team_resilience_score}`);
```

---

## Changelog

**v1.0.0 (2024-11-15)**
- Initial release
- 4 core endpoints: simulate-departure, documents-at-risk, query, recommend-onboarding
- Risk scoring algorithm
- Claude integration for natural language generation
- RAG-based Q&A system

**v1.1.0 (2025-11-15)**
- Added onboarding assistant feature
- 7 new endpoints for team/role selection and personalized onboarding
- Enhanced data models for teams, roles, and contacts
- Improved document organization by team and role