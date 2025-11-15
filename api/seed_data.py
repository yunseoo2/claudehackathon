from datetime import datetime, timedelta

try:
    # When running from project root: python -m api.seed_data
    from api.db import SessionLocal
    from api import models
except Exception:
    # When running from api/ directory directly: python seed_data.py
    from db import SessionLocal
    import models


PEOPLE = [
    {"name": "Alice Chen", "email": "alice@infra.example.com", "role": "SRE", "team": "Infra"},
    {"name": "Carlos Vega", "email": "carlos@platform.example.com", "role": "Platform Lead", "team": "Infra"},
    {"name": "Megan Ortiz", "email": "megan@payroll.example.com", "role": "Payroll Lead", "team": "Payroll"},
    {"name": "Jason Park", "email": "jason@payroll.example.com", "role": "Payroll Eng", "team": "Payroll"},
    {"name": "Bob Li", "email": "bob@payments.example.com", "role": "Payments Eng", "team": "Payments"},
    {"name": "Priya Singh", "email": "priya@billing.example.com", "role": "Billing", "team": "Billing"},
    {"name": "Carlos Ramos", "email": "carlos.r@platform.example.com", "role": "Platform", "team": "Infra"},
    {"name": "Nina Patel", "email": "nina@security.example.com", "role": "Security Engineer", "team": "Security"},
    {"name": "Sam Roberts", "email": "sam@support.example.com", "role": "Support Lead", "team": "Support"},
    {"name": "Liu Wei", "email": "liu@data.example.com", "role": "Data Engineer", "team": "Data"},
    {"name": "Anya Ivanova", "email": "anya@product.example.com", "role": "Product Manager", "team": "Product"},
    {"name": "Diego Morales", "email": "diego@payments.example.com", "role": "Payments Ops", "team": "Payments"},
]


DOCUMENTS = [
    # Infra
    {"title": "Production Deployment Runbook", "team": "Infra", "owner_name": "Alice Chen", "content": "Full deploy steps, health checks, ArgoCD sync steps.", "critical": True, "last_updated_days_ago": 3},
    {"title": "Emergency Rollback Procedure", "team": "Infra", "owner_name": "Carlos Vega", "content": "Steps to rollback a release and mitigate DB issues.", "critical": True, "last_updated_days_ago": 1},
    {"title": "CI/CD Pipeline Troubleshooting", "team": "Infra", "owner_name": "Alice Chen", "content": "Common GitHub Actions failures and how to fix them.", "critical": False, "last_updated_days_ago": 7},
    {"title": "Kubernetes Cluster Management", "team": "Infra", "owner_name": "Carlos Ramos", "content": "Cluster scaling, node maintenance, and upgrade notes.", "critical": False, "last_updated_days_ago": 45},

    # Payments/Billing
    {"title": "Vendor Payout Engine Guide", "team": "Payments", "owner_name": "Bob Li", "content": "Payout flow, retry logic, reconciliation, wire formats.", "critical": True, "last_updated_days_ago": 5},
    {"title": "Payment Reconciliation Process", "team": "Payments", "owner_name": "Diego Morales", "content": "Daily reconciliation steps and ledger mappings.", "critical": False, "last_updated_days_ago": 15},
    {"title": "Refund and Chargeback Handling", "team": "Payments", "owner_name": "Bob Li", "content": "How to process refunds and dispute chargebacks.", "critical": True, "last_updated_days_ago": 10},

    # Payroll
    {"title": "Payroll Processing Guide", "team": "Payroll", "owner_name": "Megan Ortiz", "content": "End-to-end payroll run including dry-runs and verifications.", "critical": True, "last_updated_days_ago": 8},
    {"title": "Payroll Onboarding Runbook", "team": "Payroll", "owner_name": "Megan Ortiz", "content": "Steps to onboard an employee into payroll and HRIS.", "critical": False, "last_updated_days_ago": 30},
    {"title": "Payroll Compliance Checklist", "team": "Payroll", "owner_name": "Jason Park", "content": "State tax rules, forms, and retention policies.", "critical": False, "last_updated_days_ago": 60},

    # Billing
    {"title": "Billing Incident Playbook", "team": "Billing", "owner_name": "Priya Singh", "content": "Identify impacted invoices, pause pipelines, and notify customers.", "critical": True, "last_updated_days_ago": 2},
    {"title": "Compliance Audit Checklist", "team": "Billing", "owner_name": "Priya Singh", "content": "Checklist for quarterly billing audits.", "critical": True, "last_updated_days_ago": 90},

    # Security / Support / Product / Data
    {"title": "Security Incident Response Plan", "team": "Security", "owner_name": "Nina Patel", "content": "Runbook for security incidents with escalation paths.", "critical": True, "last_updated_days_ago": 120},
    {"title": "Access Control and Permissions", "team": "Security", "owner_name": "Nina Patel", "content": "RBAC policy, onboarding, and offboarding steps.", "critical": True, "last_updated_days_ago": 180},
    {"title": "Customer Support Escalation Process", "team": "Support", "owner_name": "Sam Roberts", "content": "How to triage and escalate customer issues.", "critical": False, "last_updated_days_ago": 20},
    {"title": "Common Customer Issues FAQ", "team": "Support", "owner_name": "Sam Roberts", "content": "FAQ for the support team to speed up responses.", "critical": False, "last_updated_days_ago": 50},
    {"title": "API Architecture Overview", "team": "Product", "owner_name": "Anya Ivanova", "content": "High level architecture and service boundaries.", "critical": False, "last_updated_days_ago": 30},
    {"title": "Data Retention Policy", "team": "Data", "owner_name": "Liu Wei", "content": "Policy for retaining logs and analytics data.", "critical": False, "last_updated_days_ago": 200},
    {"title": "Database Migration Guide", "team": "Infra", "owner_name": "Carlos Vega", "content": "Best practices for writing and applying migrations.", "critical": True, "last_updated_days_ago": 2},

    # Unowned / cross-team docs
    {"title": "Third-Party Vendor Contacts", "team": "(none)", "owner_name": None, "content": "Contacts and SLAs for third-party vendors.", "critical": False, "last_updated_days_ago": 400},
    {"title": "Oncall Runbook Index", "team": "(none)", "owner_name": None, "content": "Index of runbooks and who owns them.", "critical": True, "last_updated_days_ago": 7},
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
            owner = people_map.get(d.get("owner_name")) if d.get("owner_name") else None
            doc = models.Document(
                title=d["title"],
                owner_id=owner.id if owner else None,
                team=d.get("team"),
                content=d.get("content"),
                summary=d.get("summary"),
                critical=d.get("critical", False),
            )
            # Set last_updated/created_at to simulate staleness when provided
            days = d.get("last_updated_days_ago")
            if isinstance(days, int):
                ts = datetime.utcnow() - timedelta(days=days)
                doc.last_updated = ts
                doc.created_at = ts - timedelta(days=1)
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
    import argparse

    parser = argparse.ArgumentParser(description="Seed the database with demo data")
    parser.add_argument("--force", action="store_true", help="Delete existing seeded data before inserting")
    args = parser.parse_args()

    if args.force:
        s = SessionLocal()
        try:
            # Clear association tables first
            s.query(models.DocumentTopic).delete()
            s.query(models.DocumentSystem).delete()
            # Clear main tables
            s.query(models.Topic).delete()
            s.query(models.System).delete()
            s.query(models.Document).delete()
            s.query(models.Person).delete()
            s.commit()
            print("Cleared existing seeded data (--force)")
        except Exception as e:
            s.rollback()
            print("Error clearing data:", e)
            raise
        finally:
            s.close()

    seed()
