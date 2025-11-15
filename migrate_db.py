#!/usr/bin/env python
"""
Database migration script for the onboarding assistant feature.

This script:
1. Creates new tables for Team, Role, ContactInfo, and DocumentRole
2. Adds new columns to existing tables
3. Migrates data from string fields to foreign keys

Usage:
    python migrate_db.py
"""

import os
import sys
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Table, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from datetime import datetime
from collections import defaultdict

# Read database URL from environment; fallback to local sqlite for convenience
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./continuum.db")

# For SQLite only: disable same-thread check
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine and session factory
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
metadata = MetaData()


def backup_database():
    """Create a backup of the database before migration."""
    if DATABASE_URL.startswith("sqlite"):
        import shutil
        from pathlib import Path
        
        db_path = Path("./continuum.db")
        if db_path.exists():
            backup_path = f"./continuum_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
            shutil.copy2(db_path, backup_path)
            print(f"Database backed up to {backup_path}")
    else:
        print("WARNING: Database backup only supported for SQLite. Please backup your database manually.")


def create_new_tables():
    """Create the new tables required for the onboarding assistant feature."""
    # Define new tables
    teams_table = Table(
        "teams",
        metadata,
        Column("id", Integer, primary_key=True),
        Column("name", String, unique=True, nullable=False),
        Column("description", Text, nullable=True),
        Column("created_at", DateTime, default=datetime.utcnow),
    )
    
    roles_table = Table(
        "roles",
        metadata,
        Column("id", Integer, primary_key=True),
        Column("name", String, nullable=False),
        Column("team_id", Integer, ForeignKey("teams.id"), nullable=True),
        Column("description", Text, nullable=True),
        Column("created_at", DateTime, default=datetime.utcnow),
    )
    
    document_roles_table = Table(
        "document_roles",
        metadata,
        Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
        Column("role_id", Integer, ForeignKey("roles.id"), primary_key=True),
        Column("relevance_score", Integer, default=5),
        Column("added_at", DateTime, default=datetime.utcnow),
    )
    
    contact_info_table = Table(
        "contact_info",
        metadata,
        Column("id", Integer, primary_key=True),
        Column("topic_id", Integer, ForeignKey("topics.id"), nullable=True),
        Column("document_id", Integer, ForeignKey("documents.id"), nullable=True),
        Column("team_id", Integer, ForeignKey("teams.id"), nullable=True),
        Column("person_id", Integer, ForeignKey("people.id"), nullable=False),
        Column("contact_reason", String, nullable=True),
        Column("priority", Integer, default=1),
        Column("created_at", DateTime, default=datetime.utcnow),
    )
    
    # Create the new tables
    metadata.create_all(engine, tables=[teams_table, roles_table, document_roles_table, contact_info_table])
    print("Created new tables: teams, roles, document_roles, contact_info")


def add_columns_to_existing_tables():
    """Add new columns to existing tables."""
    connection = engine.connect()
    
    # Check if columns already exist before adding them
    from sqlalchemy import inspect, text
    inspector = inspect(engine)
    
    # Add team_id to documents table
    documents_columns = [col["name"] for col in inspector.get_columns("documents")]
    if "team_id" not in documents_columns:
        connection.execute(text("ALTER TABLE documents ADD COLUMN team_id INTEGER REFERENCES teams(id)"))
        connection.commit()
        print("Added team_id column to documents table")
    
    # Add team_id and role_id to people table
    people_columns = [col["name"] for col in inspector.get_columns("people")]
    if "team_id" not in people_columns:
        connection.execute(text("ALTER TABLE people ADD COLUMN team_id INTEGER REFERENCES teams(id)"))
        connection.commit()
        print("Added team_id column to people table")
    if "role_id" not in people_columns:
        connection.execute(text("ALTER TABLE people ADD COLUMN role_id INTEGER REFERENCES roles(id)"))
        connection.commit()
        print("Added role_id column to people table")
    
    connection.close()


def migrate_data():
    """Migrate data from string fields to foreign keys."""
    db = SessionLocal()
    
    try:
        from sqlalchemy import text
        
        # Get all teams from the people table
        teams_query = db.execute(text("SELECT DISTINCT team FROM people WHERE team IS NOT NULL AND team != ''"))
        teams = [row[0] for row in teams_query]
        
        # Add teams from documents table
        docs_teams_query = db.execute(text("SELECT DISTINCT team FROM documents WHERE team IS NOT NULL AND team != ''"))
        teams.extend([row[0] for row in docs_teams_query])
        
        # Remove duplicates
        teams = list(set(teams))
        
        # Insert teams into the teams table
        team_id_map = {}
        for team_name in teams:
            result = db.execute(
                text("INSERT INTO teams (name, created_at) VALUES (:name, :created_at) RETURNING id"),
                {"name": team_name, "created_at": datetime.utcnow()}
            )
            team_id = result.scalar_one()
            team_id_map[team_name] = team_id
            print(f"Created team: {team_name} (ID: {team_id})")
        
        # Get all roles from the people table
        roles_query = db.execute(text("SELECT DISTINCT role, team FROM people WHERE role IS NOT NULL AND role != ''"))
        roles_data = [(role, team) for role, team in roles_query]
        
        # Create a map of roles to teams
        role_team_map = defaultdict(list)
        for role, team in roles_data:
            role_team_map[role].append(team)
        
        # Insert roles into the roles table
        role_id_map = {}
        for role, teams_list in role_team_map.items():
            # For each role, create an entry for each team it belongs to
            for team in teams_list:
                team_id = team_id_map.get(team)
                result = db.execute(
                    text("INSERT INTO roles (name, team_id, created_at) VALUES (:name, :team_id, :created_at) RETURNING id"),
                    {"name": role, "team_id": team_id, "created_at": datetime.utcnow()}
                )
                role_id = result.scalar_one()
                role_id_map[(role, team)] = role_id
                print(f"Created role: {role} for team: {team} (ID: {role_id})")
        
        # Update people table with team_id and role_id
        people_query = db.execute(text("SELECT id, role, team FROM people WHERE (role IS NOT NULL AND role != '') OR (team IS NOT NULL AND team != '')"))
        for person_id, role, team in people_query:
            team_id = team_id_map.get(team)
            role_id = role_id_map.get((role, team))
            
            if team_id:
                db.execute(
                    text("UPDATE people SET team_id = :team_id WHERE id = :person_id"),
                    {"team_id": team_id, "person_id": person_id}
                )
            
            if role_id:
                db.execute(
                    text("UPDATE people SET role_id = :role_id WHERE id = :person_id"),
                    {"role_id": role_id, "person_id": person_id}
                )
        
        # Update documents table with team_id
        docs_query = db.execute(text("SELECT id, team FROM documents WHERE team IS NOT NULL AND team != ''"))
        for doc_id, team in docs_query:
            team_id = team_id_map.get(team)
            if team_id:
                db.execute(
                    text("UPDATE documents SET team_id = :team_id WHERE id = :doc_id"),
                    {"team_id": team_id, "doc_id": doc_id}
                )
        
        # Create some sample contact info entries
        # Get team owners (people in a team)
        team_owners_query = db.execute(text("""
            SELECT p.id, p.name, p.role, t.id, t.name 
            FROM people p
            JOIN teams t ON p.team_id = t.id
            ORDER BY t.name, p.name
        """))
        
        for person_id, person_name, role, team_id, team_name in team_owners_query:
            # Create a contact entry for this person as a team contact
            db.execute(
                text("""
                INSERT INTO contact_info (team_id, person_id, contact_reason, priority, created_at)
                VALUES (:team_id, :person_id, :contact_reason, :priority, :created_at)
                """),
                {
                    "team_id": team_id,
                    "person_id": person_id,
                    "contact_reason": f"Primary contact for {team_name} team",
                    "priority": 1,
                    "created_at": datetime.utcnow()
                }
            )
            print(f"Created contact info: {person_name} as contact for team {team_name}")
        
        # Commit all changes
        db.commit()
        print("Data migration completed successfully")
        
    except Exception as e:
        db.rollback()
        print(f"Error during data migration: {e}")
        raise
    finally:
        db.close()


def main():
    """Run the migration script."""
    print("Starting database migration for onboarding assistant feature...")
    
    # Backup the database
    backup_database()
    
    # Bind metadata to engine
    metadata.bind = engine
    
    try:
        # Create new tables
        create_new_tables()
        
        # Add columns to existing tables
        add_columns_to_existing_tables()
        
        # Migrate data
        migrate_data()
        
        print("Migration completed successfully!")
        return 0
    except Exception as e:
        print(f"Migration failed: {e}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
