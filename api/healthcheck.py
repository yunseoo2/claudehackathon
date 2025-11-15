#!/usr/bin/env python3
"""Health check script to verify the Continuum backend setup.

This script checks:
1. Database connection
2. Tables exist
3. Seed data is present
4. Topics/systems have been ingested
5. API server is accessible (if running)

Usage:
    python -m api.healthcheck
"""

import sys
from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError

try:
    from api.db import engine, SessionLocal
    from api import models
except ImportError:
    print("❌ Error: Unable to import API modules. Run from project root.")
    sys.exit(1)


def check_database_connection():
    """Check if we can connect to the database."""
    try:
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        return True, "✅ Database connection successful"
    except OperationalError as e:
        return False, f"❌ Database connection failed: {e}"


def check_tables_exist():
    """Check if all required tables exist."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    required_tables = [
        "people",
        "documents",
        "topics",
        "systems",
        "document_topics",
        "document_systems",
    ]

    missing = [t for t in required_tables if t not in tables]

    if missing:
        return False, f"❌ Missing tables: {', '.join(missing)}\n   Run: python -m api.init_db"

    return True, f"✅ All {len(required_tables)} tables exist"


def check_seed_data():
    """Check if seed data has been loaded."""
    session = SessionLocal()
    try:
        people_count = session.query(models.Person).count()
        docs_count = session.query(models.Document).count()

        if people_count == 0 or docs_count == 0:
            return False, f"❌ No seed data found (people: {people_count}, docs: {docs_count})\n   Run: python -m api.seed_data"

        return True, f"✅ Seed data loaded ({people_count} people, {docs_count} documents)"
    finally:
        session.close()


def check_ingestion():
    """Check if topics/systems have been ingested."""
    session = SessionLocal()
    try:
        topics_count = session.query(models.Topic).count()
        systems_count = session.query(models.System).count()
        doc_topics_count = session.query(models.DocumentTopic).count()
        doc_systems_count = session.query(models.DocumentSystem).count()

        if topics_count == 0 or systems_count == 0:
            return False, f"❌ No topics/systems found (topics: {topics_count}, systems: {systems_count})\n   Run: python -m api.ingest_topics_and_systems"

        if doc_topics_count == 0 or doc_systems_count == 0:
            return False, f"⚠️  Topics/systems exist but not linked to documents\n   Run: python -m api.ingest_topics_and_systems"

        return True, f"✅ Ingestion complete ({topics_count} topics, {systems_count} systems, {doc_topics_count} links)"
    finally:
        session.close()


def check_api_server():
    """Check if the API server is running."""
    try:
        import httpx
        response = httpx.get("http://localhost:8000/health", timeout=2)
        if response.status_code == 200:
            return True, "✅ API server is running at http://localhost:8000"
        else:
            return False, f"⚠️  API server returned status {response.status_code}"
    except ImportError:
        return None, "⚠️  httpx not installed, skipping API check"
    except Exception:
        return False, "❌ API server not running\n   Run: python -m uvicorn api.index:app --reload"


def check_environment():
    """Check environment variables."""
    import os

    db_url = os.getenv("DATABASE_URL")
    api_key = os.getenv("ANTHROPIC_API_KEY")

    messages = []

    if not db_url:
        messages.append("⚠️  DATABASE_URL not set (using SQLite fallback)")
    else:
        messages.append(f"✅ DATABASE_URL configured")

    if not api_key:
        messages.append("⚠️  ANTHROPIC_API_KEY not set (will use mocked responses)")
    else:
        messages.append(f"✅ ANTHROPIC_API_KEY configured ({api_key[:10]}...)")

    return True, "\n   ".join(messages)


def main():
    print("🔍 Continuum Backend Health Check\n")
    print("=" * 60)

    checks = [
        ("Environment Variables", check_environment),
        ("Database Connection", check_database_connection),
        ("Database Tables", check_tables_exist),
        ("Seed Data", check_seed_data),
        ("Topic/System Ingestion", check_ingestion),
        ("API Server", check_api_server),
    ]

    all_passed = True

    for name, check_func in checks:
        print(f"\n{name}:")
        try:
            success, message = check_func()
            print(f"   {message}")

            if success is False:
                all_passed = False
        except Exception as e:
            print(f"   ❌ Check failed with error: {e}")
            all_passed = False

    print("\n" + "=" * 60)

    if all_passed:
        print("\n🎉 All checks passed! Your Continuum backend is ready.\n")
        print("Next steps:")
        print("   - Visit http://localhost:8000/docs for interactive API docs")
        print("   - Test endpoints with curl or Postman")
        print("   - Connect your Next.js frontend")
        return 0
    else:
        print("\n⚠️  Some checks failed. Follow the suggestions above to fix.\n")
        return 1


if __name__ == "__main__":
    sys.exit(main())
