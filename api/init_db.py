#!/usr/bin/env python3
"""Initialize the database by creating all tables.

Run this script once before running seed_data.py and ingest_topics_and_systems.py

Usage:
    python -m api.init_db
"""

from api.db import init_db

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("✓ Database tables created successfully!")
    print("\nNext steps:")
    print("  1. Run seed data: python -m api.seed_data")
    print("  2. Run ingestion: python -m api.ingest_topics_and_systems")
    print("  3. Start the API: python -m uvicorn api.index:app --reload")
