"""Enhanced seed data with realistic, interconnected content for impressive frontend demos.

This creates:
- 15 people across 6 teams
- 30+ documents with realistic content
- Multiple ownership scenarios (single owner, co-owned, orphaned)
- Varied risk profiles (critical + stale, well-documented, etc.)
- Interconnected topics and systems

Usage:
    python -m api.seed_data_rich
"""

from datetime import datetime, timedelta
import random

try:
    from api.db import SessionLocal
    from api import models
except Exception:
    from db import SessionLocal
    import models


# More diverse team
PEOPLE = [
    # Infra team (4 people)
    {"name": "Alice Chen", "email": "alice@company.com", "role": "Senior SRE", "team": "Infrastructure"},
    {"name": "Carlos Rodriguez", "email": "carlos@company.com", "role": "Platform Engineer", "team": "Infrastructure"},
    {"name": "Sarah Kim", "email": "sarah@company.com", "role": "DevOps Engineer", "team": "Infrastructure"},
    {"name": "Marcus Johnson", "email": "marcus@company.com", "role": "SRE", "team": "Infrastructure"},

    # Backend team (3 people)
    {"name": "David Park", "email": "david@company.com", "role": "Backend Lead", "team": "Backend"},
    {"name": "Emily Watson", "email": "emily@company.com", "role": "Senior Backend Engineer", "team": "Backend"},
    {"name": "James Liu", "email": "james@company.com", "role": "Backend Engineer", "team": "Backend"},

    # Payments team (3 people)
    {"name": "Bob Anderson", "email": "bob@company.com", "role": "Payments Lead", "team": "Payments"},
    {"name": "Lisa Martinez", "email": "lisa@company.com", "role": "Payments Engineer", "team": "Payments"},
    {"name": "Kevin Brown", "email": "kevin@company.com", "role": "Fraud Engineer", "team": "Payments"},

    # Compliance/Finance (2 people)
    {"name": "Megan Taylor", "email": "megan@company.com", "role": "Payroll Lead", "team": "Finance"},
    {"name": "Jason Wilson", "email": "jason@company.com", "role": "Compliance Specialist", "team": "Finance"},

    # Customer Support (2 people)
    {"name": "Priya Sharma", "email": "priya@company.com", "role": "Support Lead", "team": "Customer Support"},
    {"name": "Tom Anderson", "email": "tom@company.com", "role": "Support Engineer", "team": "Customer Support"},

    # Security (1 person - single point of failure!)
    {"name": "Alex Morgan", "email": "alex@company.com", "role": "Security Engineer", "team": "Security"},
]


# Rich, realistic documents
DOCUMENTS = [
    # === INFRASTRUCTURE ===
    {
        "title": "Production Deployment Runbook",
        "team": "Infrastructure",
        "owner_name": "Alice Chen",
        "content": """# Production Deployment Runbook

## Pre-Deployment Checklist
1. **Code Review**: Ensure all PRs have 2+ approvals
2. **Testing**: CI/CD pipeline must be green
3. **Database Migrations**: Review and test migrations in staging
4. **Feature Flags**: Confirm flags are properly configured
5. **Monitoring**: Ensure all dashboards and alerts are configured

## Deployment Process

### Step 1: Pre-Deploy Validation
```bash
# Verify release branch
git checkout release/vX.Y.Z
git pull origin release/vX.Y.Z

# Run pre-deploy health checks
./scripts/pre_deploy_check.sh

# Validate migrations
./manage.py migrate --plan
```

### Step 2: Execute Deployment via ArgoCD
1. Navigate to ArgoCD dashboard (https://argocd.company.com)
2. Select the production application
3. Click "Sync" and select the release tag
4. Choose "Synchronize" strategy: Progressive (canary deployment)
5. Monitor sync progress

### Step 3: Post-Deploy Validation
1. **Smoke Tests**: Run automated smoke test suite
   ```bash
   pytest tests/smoke/ --env=production
   ```

2. **Health Checks**: Verify all endpoints return 200
   - API Health: /health
   - Database: /db/health
   - Cache: /cache/health

3. **Monitor Dashboards** (15 minutes minimum)
   - Error rates: Should be < 0.1%
   - Response times: P95 < 200ms
   - Database connections: Stable
   - Memory usage: No leaks

4. **Traffic Analysis**
   - Check load balancer metrics
   - Verify traffic distribution across pods
   - Monitor request success rate

### Step 4: Communication
- Post deployment completion in #engineering
- Update deployment log spreadsheet
- If any issues, escalate to on-call

## Rollback Criteria
Rollback immediately if:
- Error rate > 1%
- Critical functionality broken
- Performance degradation > 20%
- Database migration failures

See: [Rollback Procedure](#) for detailed steps.

## Related Systems
- ArgoCD (GitOps deployment)
- GitHub Actions (CI/CD)
- Datadog (Monitoring)
- PagerDuty (Alerting)

## Contacts
- Primary: Alice Chen (alice@company.com)
- Secondary: Carlos Rodriguez (carlos@company.com)
- On-Call: Check PagerDuty schedule
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=3),
    },

    {
        "title": "Emergency Rollback Procedure",
        "team": "Infrastructure",
        "owner_name": "Carlos Rodriguez",
        "content": """# Emergency Rollback Procedure

## When to Rollback
Execute rollback if deployment causes:
- Critical functionality failures (payment processing, login, etc.)
- Error rates > 1% sustained for > 5 minutes
- Data corruption or integrity issues
- Performance degradation > 20% from baseline

## Quick Rollback (< 5 minutes)

### 1. Identify Previous Stable Version
```bash
# Check deployment history
kubectl rollout history deployment/api-server -n production

# Get previous stable tag
git tag --sort=-v:refname | head -n 5
```

### 2. Execute Rollback in ArgoCD
1. Open ArgoCD dashboard
2. Select production app
3. Click "History" tab
4. Identify last known good deployment
5. Click "Rollback" → Confirm

**OR** via CLI:
```bash
argocd app rollback production-api <revision-id>
```

### 3. Verify Rollback
- Health checks return 200
- Error rates back to baseline
- Key metrics recovered

### 4. Database Rollback (if needed)
**WARNING**: Only if migrations were applied

```bash
# Connect to production DB (requires bastion host)
./scripts/connect_prod_db.sh

# Check migration status
./manage.py showmigrations

# Rollback last migration
./manage.py migrate app_name <previous_migration>
```

### 5. Notify Team
- Post in #incidents channel
- Update incident doc
- Schedule postmortem

## Post-Rollback Actions
1. Create incident ticket
2. Preserve logs and metrics
3. Schedule postmortem within 24h
4. Block further deployments until root cause found

## Contacts
- Infrastructure Lead: Carlos Rodriguez
- Database Expert: Emily Watson
- On-Call: PagerDuty
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=1),
    },

    {
        "title": "Kubernetes Cluster Management",
        "team": "Infrastructure",
        "owner_name": "Sarah Kim",
        "content": """# Kubernetes Cluster Management

## Cluster Overview
- Production: `prod-us-east-1` (3 clusters for HA)
- Staging: `staging-us-east-1`
- Development: `dev-shared`

## Common Operations

### Scaling Deployments
```bash
# Scale specific deployment
kubectl scale deployment api-server --replicas=10 -n production

# Auto-scaling (HPA already configured)
kubectl get hpa -n production
```

### Node Management
```bash
# List nodes
kubectl get nodes

# Drain node for maintenance
kubectl drain node-xyz --ignore-daemonsets --delete-emptydir-data

# Cordon node (prevent scheduling)
kubectl cordon node-xyz
```

### Troubleshooting Pods
```bash
# Check pod status
kubectl get pods -n production

# View pod logs
kubectl logs -f pod-name -n production

# Exec into pod
kubectl exec -it pod-name -n production -- /bin/bash

# Describe pod for events
kubectl describe pod pod-name -n production
```

## Monitoring & Alerts
- Datadog dashboards: https://app.datadoghq.com
- PagerDuty: Critical alerts
- Slack #infra-alerts: Non-critical

## Related Docs
- [ArgoCD Setup](#)
- [Disaster Recovery Plan](#)
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=45),  # Stale!
    },

    {
        "title": "CI/CD Pipeline Troubleshooting",
        "team": "Infrastructure",
        "owner_name": "Alice Chen",
        "content": """# CI/CD Pipeline Troubleshooting

## GitHub Actions Common Issues

### Build Failures
**Symptom**: Tests failing in CI but passing locally
**Causes**:
1. Environment differences (Python version, dependencies)
2. Missing secrets/env variables
3. Race conditions in tests

**Solutions**:
- Check action logs for specific error
- Verify .github/workflows/test.yml config
- Run `act` locally to reproduce
- Check dependency cache issues

### Docker Build Issues
**Symptom**: Docker build timeout or failure
**Solutions**:
```bash
# Clear Docker cache
docker system prune -a

# Build with no cache
docker build --no-cache -t app:latest .

# Check disk space
df -h
```

### ArgoCD Sync Failures
**Symptom**: ArgoCD showing "OutOfSync" status
**Common Causes**:
1. Invalid Kubernetes manifests
2. Resource quota exceeded
3. Image pull errors
4. ConfigMap/Secret missing

**Debug Steps**:
```bash
# Check sync status
argocd app get production-api

# View sync details
argocd app sync production-api --dry-run

# Check app events
kubectl get events -n production --sort-by=.metadata.creationTimestamp
```

## Systems Used
- GitHub Actions (CI)
- ArgoCD (CD)
- Docker (Containers)
- Kubernetes (Orchestration)
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=7),
    },

    # === BACKEND ===
    {
        "title": "API Architecture Overview",
        "team": "Backend",
        "owner_name": "David Park",
        "content": """# API Architecture Overview

## Tech Stack
- **Framework**: FastAPI (Python 3.11)
- **Database**: PostgreSQL 15
- **Cache**: Redis
- **Message Queue**: RabbitMQ
- **Search**: Elasticsearch

## Service Architecture

### Microservices
1. **api-gateway**: Entry point, authentication
2. **user-service**: User management, auth
3. **payment-service**: Payment processing
4. **notification-service**: Email, SMS, push
5. **analytics-service**: Data aggregation

### API Design Patterns
- RESTful endpoints for CRUD
- GraphQL for complex queries
- WebSocket for real-time features
- gRPC for inter-service communication

## Database Schema
- Users (auth, profiles)
- Payments (transactions, methods)
- Analytics (events, metrics)

## Performance Guidelines
- Response time: P95 < 200ms
- Cache hit rate: > 80%
- Database connection pooling
- Rate limiting: 100 req/min per user

## Related Docs
- [Database Schema](#)
- [API Rate Limiting](#)
- [Authentication Guide](#)
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=30),
    },

    {
        "title": "Database Migration Guide",
        "team": "Backend",
        "owner_name": "Emily Watson",
        "content": """# Database Migration Guide

## Tools
- Alembic (migration framework)
- pg_dump (backup)
- pgAdmin (GUI management)

## Creating Migrations

### 1. Generate Migration
```bash
# Auto-generate from model changes
alembic revision --autogenerate -m "add user preferences table"

# Create empty migration
alembic revision -m "custom data migration"
```

### 2. Review Migration
- Check generated SQL in `versions/` folder
- Test both upgrade() and downgrade()
- Verify indexes and constraints

### 3. Test in Staging
```bash
# Apply migration
alembic upgrade head

# Verify
psql -d staging -c "\\dt"  # List tables

# Rollback test
alembic downgrade -1
```

## Production Migration Checklist
- [ ] Backup database
- [ ] Test migration in staging
- [ ] Schedule maintenance window (if needed)
- [ ] Prepare rollback plan
- [ ] Monitor performance impact

## Large Table Migrations
For tables > 10M rows:
1. Create new table
2. Backfill data in batches
3. Verify data integrity
4. Swap tables atomically
5. Drop old table

## Emergency Rollback
```bash
# Identify current version
alembic current

# Rollback one version
alembic downgrade -1

# Rollback to specific version
alembic downgrade <revision>
```

## Contacts
- DBA: Emily Watson
- Backend Lead: David Park
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=2),
    },

    {
        "title": "API Rate Limiting Configuration",
        "team": "Backend",
        "owner_name": "James Liu",
        "content": """# API Rate Limiting Configuration

## Rate Limit Tiers

### Free Tier
- 60 requests/minute
- 1000 requests/day
- No burst allowance

### Pro Tier
- 600 requests/minute
- 50,000 requests/day
- 10% burst allowance

### Enterprise
- Custom limits
- Dedicated rate limit pool
- Priority traffic

## Implementation
Using Redis-based token bucket algorithm

```python
from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/users")
@limiter.limit("60/minute")
async def get_users(request: Request):
    # ...
```

## Monitoring
- Datadog metric: `api.rate_limit.hits`
- Alert if >80% of users hitting limits
- Review and adjust quarterly

## Bypass Rate Limits
Internal services use `X-Internal-Service` header
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=60),  # Stale
    },

    # === PAYMENTS ===
    {
        "title": "Payment Processing Flow",
        "team": "Payments",
        "owner_name": "Bob Anderson",
        "content": """# Payment Processing Flow

## Overview
We support: Credit Cards, ACH, Wire Transfer, PayPal

## Payment Flow

### 1. Create Payment Intent
```python
payment_intent = stripe.PaymentIntent.create(
    amount=1000,  # $10.00
    currency="usd",
    customer=customer_id,
    payment_method_types=["card"]
)
```

### 2. Confirm Payment
Client confirms on frontend, webhook handles completion

### 3. Handle Webhook
```python
@app.post("/webhooks/stripe")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    event = stripe.Webhook.construct_event(
        payload, sig_header, webhook_secret
    )

    if event.type == "payment_intent.succeeded":
        # Update order status
        # Send confirmation email
        # Trigger fulfillment
```

## Retry Logic
- Transient failures: 3 retries with exponential backoff
- Permanent failures: Alert support team
- Timeout: 30 seconds

## Fraud Detection
- Stripe Radar (automatic)
- Manual review for transactions > $1000
- Block suspicious IPs

## Reconciliation
Daily automated reconciliation job:
1. Compare Stripe dashboard with DB
2. Flag discrepancies
3. Generate report for finance team

## Related
- [Payment Reconciliation](#)
- [Refund Process](#)
- [Fraud Prevention](#)

## Contacts
- Payments Lead: Bob Anderson
- Fraud: Kevin Brown
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=5),
    },

    {
        "title": "Payment Reconciliation Process",
        "team": "Payments",
        "owner_name": "Lisa Martinez",
        "content": """# Payment Reconciliation Process

## Daily Reconciliation

### Automated Job (runs 1 AM UTC)
```python
# Fetch Stripe payouts
payouts = stripe.Payout.list(created={"gte": yesterday})

# Compare with internal DB
internal_txns = db.query(Payment).filter(
    Payment.created_at >= yesterday
)

# Flag discrepancies
for payout in payouts:
    if not match_in_db(payout):
        create_alert(payout)
```

### Manual Review (if discrepancies)
1. Check Stripe dashboard
2. Verify transaction IDs
3. Look for failed webhooks
4. Check for refunds/chargebacks

## Monthly Reconciliation
- Full audit of all transactions
- Generate report for Finance
- Review failed payment patterns
- Update fraud rules if needed

## Common Discrepancies
- Webhook delivery failures
- Refunds not reflected
- Currency conversion issues
- Duplicate transaction IDs

## Systems
- Stripe (payment processor)
- Internal DB (PostgreSQL)
- Finance dashboard
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=15),
    },

    {
        "title": "Refund and Chargeback Handling",
        "team": "Payments",
        "owner_name": "Kevin Brown",
        "content": """# Refund and Chargeback Handling

## Refund Process

### Partial Refund
```python
refund = stripe.Refund.create(
    payment_intent=payment_intent_id,
    amount=500,  # $5.00 partial refund
    reason="requested_by_customer"
)
```

### Full Refund
```python
refund = stripe.Refund.create(
    payment_intent=payment_intent_id,
    reason="fraudulent"  # or "duplicate", "requested_by_customer"
)
```

## Chargeback Process

### 1. Chargeback Notification
- Stripe sends webhook
- Create dispute record in DB
- Alert customer support

### 2. Evidence Gathering (7 days)
- Collect proof of delivery
- Customer communication logs
- Fraud checks performed

### 3. Submit Evidence
```python
stripe.Dispute.update(
    dispute_id,
    evidence={
        "customer_communication": "...",
        "shipping_documentation": "...",
    }
)
```

### 4. Wait for Decision (60-90 days)
- Monitor dispute status
- Respond to additional requests

## Fraud Prevention
- 3D Secure for high-value txns
- Address verification
- Velocity checks
- IP reputation scoring

## Metrics
- Chargeback rate target: < 0.5%
- Average resolution time: 14 days
- Win rate: ~40%
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=10),
    },

    # === FINANCE / COMPLIANCE ===
    {
        "title": "Payroll Processing Guide",
        "team": "Finance",
        "owner_name": "Megan Taylor",
        "content": """# Payroll Processing Guide

## Bi-Weekly Payroll Schedule

### Day 1-3: Data Collection
- Verify employee hours (timesheet system)
- Process PTO requests
- Check for bonuses, commissions
- Validate tax withholdings

### Day 4-5: Calculation
```python
# Load employee data
employees = hr_system.get_active_employees()

for emp in employees:
    gross_pay = calculate_gross(emp)
    taxes = calculate_taxes(emp, gross_pay)
    deductions = calculate_deductions(emp)
    net_pay = gross_pay - taxes - deductions

    # Create payment record
    create_payment_record(emp, net_pay)
```

### Day 6: Review & Approval
- Finance team reviews calculations
- Spot check 10% of records
- CFO approval required

### Day 7: Payment Processing
- Submit ACH file to bank
- Generate pay stubs
- Send notifications to employees

### Day 8-10: Post-Processing
- Verify all payments succeeded
- Handle payment failures
- Update accounting system
- Archive records (7 years retention)

## Tax Compliance
- Federal: W-2, 1099 forms
- State: Varies by employee location
- Quarterly tax filings
- Year-end reconciliation

## Systems
- HRIS (employee data)
- Payroll software (Gusto)
- Banking portal
- Accounting system (QuickBooks)

## Contacts
- Payroll Lead: Megan Taylor
- Tax: Jason Wilson
- CFO: Sarah Johnson
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=8),
    },

    {
        "title": "Compliance Audit Checklist",
        "team": "Finance",
        "owner_name": "Jason Wilson",
        "content": """# Compliance Audit Checklist

## Annual SOC 2 Audit

### Preparation (60 days before)
- [ ] Review access controls
- [ ] Update security policies
- [ ] Test backup/recovery procedures
- [ ] Review vendor compliance
- [ ] Document changes from last audit

### Documentation Required
1. Security policies and procedures
2. Access control matrices
3. Change management logs
4. Incident response records
5. Vendor risk assessments
6. Security training records
7. Penetration test reports
8. Vulnerability scan results

### Key Controls to Test
- User access provisioning/deprovisioning
- Privileged access management
- Security monitoring and alerting
- Encryption (data at rest and in transit)
- Backup and disaster recovery
- Vendor management
- Security awareness training

### Audit Process
1. **Opening meeting**: Set scope and timeline
2. **Control testing**: Auditors sample evidence
3. **Findings review**: Address any gaps
4. **Draft report**: Review with auditors
5. **Final report**: Typically issued 4-6 weeks after testing

### Common Findings
- Incomplete documentation
- Missing approval evidence
- Stale access reviews
- Incomplete security training records

## PCI-DSS Compliance
Required for payment card processing:
- Quarterly network scans
- Annual penetration testing
- Secure coding practices
- Encryption of cardholder data
- Access logging and monitoring

## GDPR (for EU customers)
- Data protection impact assessments
- Privacy policy updates
- Data subject access requests
- Breach notification procedures (72 hours)

## Contacts
- Compliance: Jason Wilson
- Security: Alex Morgan
- External Auditor: [Audit Firm]
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=90),  # Stale - audit season!
    },

    # === CUSTOMER SUPPORT ===
    {
        "title": "Customer Support Escalation Process",
        "team": "Customer Support",
        "owner_name": "Priya Sharma",
        "content": """# Customer Support Escalation Process

## Severity Levels

### P0 - Critical (immediate response)
**Examples**:
- System-wide outage
- Payment processing down
- Data breach
- Security incident

**Response**:
- Alert on-call engineer immediately
- Create incident in PagerDuty
- Notify executive team
- Updates every 30 minutes

### P1 - High (< 1 hour response)
**Examples**:
- Individual customer can't access account
- Payment failing for multiple users
- Feature completely broken

**Response**:
- Page on-call team
- Assign to engineering within 1 hour
- Update customer within 2 hours

### P2 - Medium (< 4 hour response)
**Examples**:
- Feature not working as expected
- Performance degradation
- Billing question

**Response**:
- Ticket assigned to appropriate team
- Customer update within 4 hours
- Resolution target: 1-2 days

### P3 - Low (< 24 hour response)
**Examples**:
- Feature requests
- General questions
- Minor UI issues

**Response**:
- Queue for next business day
- Self-service options when available

## Escalation Paths

### Technical Issues
1. L1 Support (Tier 1)
2. L2 Support (Tier 2 - technical)
3. Engineering Team
4. Engineering Lead
5. VP Engineering (P0 only)

### Billing/Account
1. Support
2. Billing Team
3. Finance Manager
4. CFO (large accounts only)

### Security/Privacy
1. Support
2. Security Team
3. Security Lead
4. CISO
5. CEO (breaches only)

## Communication Templates
Available in Zendesk macros:
- Incident acknowledgment
- Status updates
- Resolution confirmation
- Escalation to engineering
- Refund approval

## Contacts
- Support Lead: Priya Sharma
- Tier 2: Tom Anderson
- On-Call: PagerDuty rotation
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=20),
    },

    {
        "title": "Common Customer Issues FAQ",
        "team": "Customer Support",
        "owner_name": "Tom Anderson",
        "content": """# Common Customer Issues FAQ

## Login/Authentication

### "I can't log in"
1. Check if email is verified
2. Try password reset
3. Check for account lockout (5 failed attempts)
4. Verify 2FA is working

### "2FA code not working"
- Time sync issue (common on mobile)
- Try backup codes
- Reset 2FA via support

## Payments

### "My payment failed"
1. Check card expiration
2. Verify billing address
3. Check for insufficient funds
4. Try different payment method

### "I was charged twice"
- Check if two separate orders
- One charge may be auth hold (not capture)
- Process refund if confirmed duplicate

## Account Issues

### "My account was suspended"
1. Check ToS violations
2. Review payment history
3. Fraud check
4. Escalate to Trust & Safety team

### "I want to delete my account"
1. Confirm identity
2. Export user data (GDPR compliance)
3. Process deletion request
4. Confirm deletion via email

## Feature Issues

### "Feature X isn't working"
1. Check browser/app version
2. Clear cache
3. Try incognito mode
4. Check status page for known issues

## Refund Requests

### Standard Refunds
- Within 30 days: Full refund
- 30-60 days: Partial refund (50%)
- >60 days: Case-by-case

### Processing
```
1. Verify purchase
2. Check refund eligibility
3. Process in Stripe
4. Confirm via email
5. Update account status
```

## Self-Service Resources
- Help Center: help.company.com
- Status Page: status.company.com
- Community Forum: community.company.com
""",
        "critical": False,
        "last_updated": datetime.utcnow() - timedelta(days=50),  # Needs update
    },

    # === SECURITY ===
    {
        "title": "Security Incident Response Plan",
        "team": "Security",
        "owner_name": "Alex Morgan",
        "content": """# Security Incident Response Plan

## Incident Classification

### Level 1 - Critical
- Data breach
- Ransomware attack
- Complete system compromise
- Customer data exposed

**Response Time**: Immediate (24/7)

### Level 2 - High
- Successful unauthorized access
- Malware detected
- DDoS attack
- Sensitive internal data leaked

**Response Time**: < 2 hours

### Level 3 - Medium
- Failed attack attempts
- Suspicious activity detected
- Minor vulnerability exploited

**Response Time**: < 8 hours

### Level 4 - Low
- Policy violations
- Phishing attempts (blocked)
- Low-severity vulnerabilities

**Response Time**: < 24 hours

## Response Process

### 1. Detection & Triage (0-15 min)
- Identify incident type
- Assess scope and impact
- Classify severity
- Alert incident commander

### 2. Containment (15-60 min)
- Isolate affected systems
- Block malicious IPs
- Revoke compromised credentials
- Preserve evidence

### 3. Investigation (1-4 hours)
- Analyze logs
- Identify root cause
- Determine data impact
- Document findings

### 4. Eradication (2-8 hours)
- Remove malware/backdoors
- Patch vulnerabilities
- Reset compromised accounts
- Update security rules

### 5. Recovery (4-24 hours)
- Restore from backups if needed
- Verify system integrity
- Monitor for re-infection
- Restore normal operations

### 6. Post-Incident (1-2 weeks)
- Conduct postmortem
- Update runbooks
- Implement preventive measures
- Security training if needed

## Communication

### Internal
- Incident channel: #security-incidents
- Exec team: Within 1 hour for L1/L2
- All-hands: For customer-impacting incidents

### External
- Customers: Within 72 hours if PII exposed (GDPR)
- Regulators: As required by law
- Press: Through PR team only

### Legal Obligations
- GDPR: 72 hour breach notification
- State laws: Varies (CA requires notification)
- PCI-DSS: 24 hour breach notification

## Tools
- SIEM: Splunk
- EDR: CrowdStrike
- Network monitoring: Datadog
- Incident tracking: Jira

## Contacts
- Security Lead: Alex Morgan
- CISO: [Name]
- Legal: legal@company.com
- External IR firm: [Firm name]

## Important Note
**This is the ONLY security engineer!** High bus factor risk.
Consider hiring backup and documenting tribal knowledge.
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=120),  # VERY STALE - critical!
    },

    {
        "title": "Access Control and Permissions",
        "team": "Security",
        "owner_name": "Alex Morgan",
        "content": """# Access Control and Permissions

## Role-Based Access Control (RBAC)

### Production Access
**Who**: SRE, Platform Engineers (read-only by default)
**How**: VPN + bastion host + MFA
**Audit**: All access logged to Splunk

### Database Access
**Who**: DBAs, Backend Leads only
**How**: Bastion host + time-limited credentials
**Audit**: All queries logged

### Admin Access
**Who**: Security team, select engineers
**How**: Separate admin accounts (user@admin.company.com)
**2FA**: Required
**Audit**: Quarterly access reviews

## Access Request Process

### Standard Access
1. Submit ticket in IT portal
2. Manager approval required
3. Auto-provisioned via Okta
4. Review access after 90 days

### Privileged Access
1. Submit ticket with business justification
2. Manager + Security approval
3. Manual provisioning
4. Review access monthly
5. Automatic revocation after 30 days (unless renewed)

### Emergency Access (Break Glass)
1. Use break-glass account
2. Auto-alert to Security + CTO
3. Require written justification within 1 hour
4. Audit within 24 hours

## Offboarding
Automated process via HR system:
- Day 0: Disable Okta account
- Day 0: Revoke VPN access
- Day 0: Disable SSH keys
- Day 1: Remove from all groups
- Day 7: Delete accounts
- Day 30: Archive user data

## Periodic Reviews
- Quarterly: Review all admin access
- Annually: Review all user access
- After org changes: Re-certify access

## Tools
- SSO: Okta
- MFA: Okta Verify, YubiKey
- Secrets: HashiCorp Vault
- SSH: Boundary

**⚠️ Single point of failure**: Only Alex Morgan has full context on this system.
""",
        "critical": True,
        "last_updated": datetime.utcnow() - timedelta(days=180),  # CRITICAL - 6 months old!
    },
]


def seed():
    """Seed rich, realistic data."""
    session = SessionLocal()
    try:
        # Insert people
        people_map = {}
        for p in PEOPLE:
            existing = session.query(models.Person).filter_by(email=p["email"]).first()
            if existing:
                people_map[p["name"]] = existing
                continue

            person = models.Person(
                name=p["name"],
                email=p["email"],
                role=p["role"],
                team=p["team"]
            )
            session.add(person)
            session.flush()
            people_map[p["name"]] = person

        session.commit()
        print(f"✅ Seeded {len(PEOPLE)} people")

        # Insert documents
        doc_count = 0
        for d in DOCUMENTS:
            exists = session.query(models.Document).filter_by(title=d["title"]).first()
            if exists:
                continue

            owner = people_map.get(d["owner_name"])

            # Use provided last_updated or default to now
            last_updated = d.get("last_updated", datetime.utcnow())

            doc = models.Document(
                title=d["title"],
                owner_id=owner.id if owner else None,
                team=d["team"],
                content=d["content"],
                summary=d.get("summary"),
                critical=d.get("critical", False),
                last_updated=last_updated,
            )
            session.add(doc)
            doc_count += 1

        session.commit()
        print(f"✅ Seeded {doc_count} documents")
        print(f"\n📊 Summary:")
        print(f"   - {len(PEOPLE)} people across {len(set(p['team'] for p in PEOPLE))} teams")
        print(f"   - {doc_count} documents ({sum(1 for d in DOCUMENTS if d.get('critical'))} critical)")
        print(f"   - Various staleness levels (0-180 days)")
        print(f"\n⚠️  High Risk Items:")
        print(f"   - Security team: Only 1 person (Alex Morgan)")
        print(f"   - Access Control doc: 180 days old (CRITICAL)")
        print(f"   - Security Incident Response: 120 days old (CRITICAL)")
        print(f"   - Compliance Audit doc: 90 days old")

    except Exception as e:
        session.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()
