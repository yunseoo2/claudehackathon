from datetime import datetime

try:
    # When running from project root: python -m api.seed_data
    from api.db import SessionLocal
    from api import models
except Exception:
    # When running from api/ directory directly: python seed_data.py
    from db import SessionLocal
    import models


PEOPLE = [
    {"name": "Alice", "email": "alice@infra.example.com", "role": "SRE", "team": "Infra"},
    {"name": "Megan", "email": "megan@payroll.example.com", "role": "Payroll Lead", "team": "Payroll"},
    {"name": "Jason", "email": "jason@payroll.example.com", "role": "Payroll Eng", "team": "Payroll"},
    {"name": "Bob", "email": "bob@payments.example.com", "role": "Payments Eng", "team": "Payments"},
    {"name": "Priya", "email": "priya@billing.example.com", "role": "Billing", "team": "Billing"},
    {"name": "Carlos", "email": "carlos@platform.example.com", "role": "Platform", "team": "Infra"},
]


DOCUMENTS = [
    {
        "title": "Deployment Runbook",
        "team": "Infra",
        "owner_name": "Alice",
        "content": (
            "Step-by-step deployment runbook:\n1. Checkout release branch.\n2. Run pre-deploy checks (health, migrations).\n"
            "3. Execute deployment via ArgoCD.\n4. Run smoke tests and monitor dashboards for 15 minutes."
        ),
        "critical": True,
    },
    {
        "title": "Rollback Procedure",
        "team": "Infra",
        "owner_name": "Carlos",
        "content": (
            "Rollback Procedure:\n1. Identify failed release and tag.\n2. Revert to previous stable manifest.\n"
            "3. Re-run migrations if necessary and validate.\n4. Notify on-call and postmortem owners."
        ),
        "critical": True,
    },
    {
        "title": "Payroll Onboarding Runbook",
        "team": "Payroll",
        "owner_name": "Megan",
        "content": (
            "Payroll Onboarding:\n- Add new employee to HRIS.\n- Verify tax forms.\n- Add to payroll system with proper pay code.\n"
            "- Trigger first payroll dry-run and verify outputs."
        ),
        "critical": False,
    },
    {
        "title": "Vendor Payout Engine Guide",
        "team": "Payments",
        "owner_name": "Bob",
        "content": (
            "Vendor Payout Engine:\nOverview of payout flow, retry logic, and reconciliation steps.\nIncludes wire/ACH formats and fraud checks."
        ),
        "critical": True,
    },
    {
        "title": "Billing Incident Playbook",
        "team": "Billing",
        "owner_name": "Priya",
        "content": (
            "Billing Incident Playbook:\n- Identify impacted accounts.\n- Stop billing pipelines.\n- Coordinate refunds and customer comms."
        ),
        "critical": True,
    },
    {
        "title": "CI/CD Troubleshooting Guide",
        "team": "Infra",
        "owner_name": "Alice",
        "content": (
            "CI/CD Troubleshooting:\nCommon failures, how to inspect build logs, and caching-related fixes.\nIncludes steps for GitHub Actions and ArgoCD."
        ),
        "critical": False,
    },
    {
        "title": "Payment Reconciliation Notes",
        "team": "Payments",
        "owner_name": "Bob",
        "content": (
            "Payment Reconciliation:\nDaily reconciliation process, mapping transaction IDs to ledger entries, and common discrepancies."
        ),
        "critical": False,
    },
    {
        "title": "Payroll Compliance Checklist",
        "team": "Payroll",
        "owner_name": "Jason",
        "content": (
            "Payroll Compliance Checklist:\nState and federal compliance items, audit log locations, and retention policies."
        ),
        "critical": False,
    },
]


def seed():
    session = SessionLocal()
    try:
        # Insert people (avoid duplicates by email)
        created = []
        for p in PEOPLE:
            existing = session.query(models.Person).filter_by(email=p["email"]).first()
            if existing:
                created.append(existing)
                continue
            person = models.Person(
                name=p["name"], email=p["email"], role=p.get("role"), team=p.get("team")
            )
            session.add(person)
            created.append(person)

        session.commit()

        # Map owner name -> instance
        people_map = {p.name: p for p in session.query(models.Person).all()}

        # Insert documents (avoid duplicates by title)
        for d in DOCUMENTS:
            exists = session.query(models.Document).filter_by(title=d["title"]).first()
            if exists:
                continue
            owner = people_map.get(d["owner_name"])
            doc = models.Document(
                title=d["title"],
                owner_id=owner.id if owner else None,
                team=d.get("team"),
                content=d.get("content"),
                summary=d.get("summary"),
                critical=d.get("critical", False),
            )
            session.add(doc)

        session.commit()
        print("Seeding complete.")
    except Exception as e:
        session.rollback()
        print("Error seeding data:", e)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed()
