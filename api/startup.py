"""Startup script that ensures database is initialized and seeded before starting the server.

This script:
1. Checks if database exists and has data
2. If empty or missing, initializes and seeds it automatically
3. Then starts the FastAPI server

Usage:
    python -m api.startup
"""

import os
import sys
from pathlib import Path

# Ensure DATABASE_URL is not set (use SQLite)
os.environ.pop('DATABASE_URL', None)

# Import after unsetting DATABASE_URL
from api.db import SessionLocal, init_db
from api.models import Person, Document


def check_database_needs_seeding():
    """Check if database needs to be seeded."""
    db_file = Path("continuum.db")

    # If database file doesn't exist, definitely need to seed
    if not db_file.exists():
        print("📂 Database file not found")
        return True

    # Check if database has data
    try:
        session = SessionLocal()
        people_count = session.query(Person).count()
        docs_count = session.query(Document).count()
        session.close()

        if people_count == 0 or docs_count == 0:
            print(f"📊 Database exists but is empty (people: {people_count}, docs: {docs_count})")
            return True

        print(f"✅ Database has data (people: {people_count}, docs: {docs_count})")
        return False
    except Exception as e:
        print(f"⚠️  Database check failed: {e}")
        return True


def seed_database():
    """Initialize and seed the database."""
    print("\n🌱 Initializing database...")

    try:
        # Initialize database schema
        init_db()
        print("✅ Database schema created")

        # Run seed_data_rich
        from api.seed_data_rich import seed as seed_rich
        print("🌱 Seeding with rich data...")
        seed_rich()

        # Run ingest_topics_and_systems
        print("🔍 Extracting topics and systems...")
        import subprocess
        subprocess.run(["python", "-m", "api.ingest_topics_and_systems"], check=True)

        print("✅ Database seeded successfully!\n")
        return True

    except Exception as e:
        print(f"❌ Seeding failed: {e}")
        return False


def main():
    """Main startup routine."""
    print("\n" + "="*60)
    print("🚀 Continuum Backend Startup")
    print("="*60 + "\n")

    # Check if seeding is needed
    if check_database_needs_seeding():
        print("\n🔧 Database needs initialization...")
        if not seed_database():
            print("❌ Failed to seed database. Server may not work correctly.")
            sys.exit(1)

    print("="*60)
    print("🎯 Starting FastAPI server on http://localhost:8000")
    print("="*60 + "\n")

    # Start uvicorn
    import uvicorn
    uvicorn.run("api.main:app", host="0.0.0.0", port=8000, reload=True)


if __name__ == "__main__":
    main()
