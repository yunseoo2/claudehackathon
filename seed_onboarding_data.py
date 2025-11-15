#!/usr/bin/env python
"""
Seed script for generating sample data for the onboarding assistant feature.

This script:
1. Creates teams if they don't exist
2. Creates roles for each team
3. Creates documents specific to roles
4. Creates contact information for each team

Usage:
    python seed_onboarding_data.py
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Read database URL from environment; fallback to local sqlite for convenience
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./continuum.db")

# For SQLite only: disable same-thread check
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

# Create engine and session factory
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def create_teams(db):
    """Create sample teams if they don't exist."""
    teams_data = [
        {"name": "Engineering", "description": "Software engineering team responsible for product development"},
        {"name": "Product", "description": "Product management team responsible for product strategy"},
        {"name": "Design", "description": "Design team responsible for user experience and interface design"},
        {"name": "Marketing", "description": "Marketing team responsible for product promotion"},
        {"name": "Sales", "description": "Sales team responsible for customer acquisition"},
        {"name": "Customer Success", "description": "Customer success team responsible for customer retention"},
    ]
    
    team_ids = {}
    
    for team_data in teams_data:
        # Check if team already exists
        result = db.execute(
            text("SELECT id FROM teams WHERE name = :name"),
            {"name": team_data["name"]}
        ).fetchone()
        
        if result:
            team_id = result[0]
            print(f"Team already exists: {team_data['name']} (ID: {team_id})")
        else:
            result = db.execute(
                text("INSERT INTO teams (name, description, created_at) VALUES (:name, :description, :created_at) RETURNING id"),
                {"name": team_data["name"], "description": team_data["description"], "created_at": datetime.utcnow()}
            )
            team_id = result.scalar_one()
            print(f"Created team: {team_data['name']} (ID: {team_id})")
        
        team_ids[team_data["name"]] = team_id
    
    return team_ids


def create_roles(db, team_ids):
    """Create sample roles for each team."""
    roles_data = {
        "Engineering": [
            {"name": "Software Engineer", "description": "Develops and maintains software applications"},
            {"name": "DevOps Engineer", "description": "Manages infrastructure and deployment pipelines"},
            {"name": "QA Engineer", "description": "Ensures software quality through testing"},
            {"name": "Engineering Manager", "description": "Manages engineering team and projects"}
        ],
        "Product": [
            {"name": "Product Manager", "description": "Defines product strategy and roadmap"},
            {"name": "Product Owner", "description": "Manages product backlog and prioritizes features"},
            {"name": "Business Analyst", "description": "Analyzes market trends and user needs"}
        ],
        "Design": [
            {"name": "UX Designer", "description": "Designs user experience flows and interactions"},
            {"name": "UI Designer", "description": "Creates visual designs and interfaces"},
            {"name": "Design Manager", "description": "Manages design team and ensures design consistency"}
        ],
        "Marketing": [
            {"name": "Marketing Manager", "description": "Manages marketing campaigns and strategy"},
            {"name": "Content Writer", "description": "Creates marketing content"},
            {"name": "SEO Specialist", "description": "Optimizes content for search engines"}
        ],
        "Sales": [
            {"name": "Sales Representative", "description": "Sells products to customers"},
            {"name": "Account Executive", "description": "Manages customer accounts"},
            {"name": "Sales Manager", "description": "Manages sales team and strategy"}
        ],
        "Customer Success": [
            {"name": "Customer Success Manager", "description": "Ensures customer satisfaction and retention"},
            {"name": "Support Engineer", "description": "Provides technical support to customers"},
            {"name": "Onboarding Specialist", "description": "Helps new customers get started with the product"}
        ]
    }
    
    role_ids = {}
    
    for team_name, roles in roles_data.items():
        team_id = team_ids.get(team_name)
        if not team_id:
            print(f"Team not found: {team_name}")
            continue
        
        for role_data in roles:
            # Check if role already exists for this team
            result = db.execute(
                text("SELECT id FROM roles WHERE name = :name AND team_id = :team_id"),
                {"name": role_data["name"], "team_id": team_id}
            ).fetchone()
            
            if result:
                role_id = result[0]
                print(f"Role already exists: {role_data['name']} for team {team_name} (ID: {role_id})")
            else:
                result = db.execute(
                    text("INSERT INTO roles (name, description, team_id, created_at) VALUES (:name, :description, :team_id, :created_at) RETURNING id"),
                    {
                        "name": role_data["name"], 
                        "description": role_data["description"], 
                        "team_id": team_id, 
                        "created_at": datetime.utcnow()
                    }
                )
                role_id = result.scalar_one()
                print(f"Created role: {role_data['name']} for team {team_name} (ID: {role_id})")
            
            role_ids[(team_name, role_data["name"])] = role_id
    
    return role_ids


def create_documents(db, team_ids, role_ids):
    """Create sample documents for each team and role."""
    # General documents for each team
    team_docs = {
        "Engineering": [
            {"title": "Engineering Onboarding Guide", "summary": "Guide for new engineers joining the team", "critical": True},
            {"title": "Coding Standards", "summary": "Coding standards and best practices", "critical": True},
            {"title": "Architecture Overview", "summary": "Overview of the system architecture", "critical": True},
            {"title": "Development Workflow", "summary": "How to develop and ship code", "critical": False},
        ],
        "Product": [
            {"title": "Product Roadmap", "summary": "Product roadmap for the next 12 months", "critical": True},
            {"title": "Product Requirements Document Template", "summary": "Template for writing PRDs", "critical": False},
            {"title": "User Personas", "summary": "Descriptions of our user personas", "critical": True},
        ],
        "Design": [
            {"title": "Design System", "summary": "Our design system and component library", "critical": True},
            {"title": "Design Process", "summary": "Our design process from ideation to implementation", "critical": True},
            {"title": "User Research Guidelines", "summary": "How to conduct user research", "critical": False},
        ],
        "Marketing": [
            {"title": "Brand Guidelines", "summary": "Our brand guidelines and assets", "critical": True},
            {"title": "Marketing Calendar", "summary": "Marketing campaigns and events calendar", "critical": True},
            {"title": "Content Strategy", "summary": "Our content strategy and guidelines", "critical": False},
        ],
        "Sales": [
            {"title": "Sales Playbook", "summary": "Sales strategies and tactics", "critical": True},
            {"title": "Pricing Guide", "summary": "Product pricing and discount guidelines", "critical": True},
            {"title": "Competitor Analysis", "summary": "Analysis of our competitors", "critical": False},
        ],
        "Customer Success": [
            {"title": "Customer Onboarding Process", "summary": "Process for onboarding new customers", "critical": True},
            {"title": "Support Escalation Process", "summary": "How to escalate support issues", "critical": True},
            {"title": "Customer Health Metrics", "summary": "Metrics for measuring customer health", "critical": False},
        ]
    }
    
    # Role-specific documents
    role_docs = {
        ("Engineering", "Software Engineer"): [
            {"title": "Backend Development Guide", "summary": "Guide for backend development", "critical": True},
            {"title": "Frontend Development Guide", "summary": "Guide for frontend development", "critical": True},
            {"title": "Testing Best Practices", "summary": "Best practices for writing tests", "critical": False},
        ],
        ("Engineering", "DevOps Engineer"): [
            {"title": "Infrastructure Setup Guide", "summary": "Guide for setting up infrastructure", "critical": True},
            {"title": "CI/CD Pipeline Documentation", "summary": "Documentation for our CI/CD pipelines", "critical": True},
            {"title": "Monitoring and Alerting Setup", "summary": "How to set up monitoring and alerting", "critical": False},
        ],
        ("Product", "Product Manager"): [
            {"title": "Product Strategy Framework", "summary": "Framework for defining product strategy", "critical": True},
            {"title": "Feature Prioritization Guide", "summary": "How to prioritize features", "critical": True},
            {"title": "Product Metrics Dashboard", "summary": "Dashboard for tracking product metrics", "critical": False},
        ],
        ("Design", "UX Designer"): [
            {"title": "UX Research Methods", "summary": "Methods for conducting UX research", "critical": True},
            {"title": "Usability Testing Guide", "summary": "Guide for conducting usability tests", "critical": True},
            {"title": "Information Architecture Principles", "summary": "Principles for information architecture", "critical": False},
        ]
    }
    
    doc_ids = {}
    
    # Create team documents
    for team_name, docs in team_docs.items():
        team_id = team_ids.get(team_name)
        if not team_id:
            print(f"Team not found: {team_name}")
            continue
        
        # Find a person in this team to be the owner
        owner_id = db.execute(
            text("SELECT id FROM people WHERE team_id = :team_id LIMIT 1"),
            {"team_id": team_id}
        ).fetchone()
        
        if owner_id:
            owner_id = owner_id[0]
        else:
            # If no person in this team, create one
            result = db.execute(
                text("INSERT INTO people (name, email, team_id, created_at) VALUES (:name, :email, :team_id, :created_at) RETURNING id"),
                {
                    "name": f"{team_name} Lead", 
                    "email": f"lead@{team_name.lower()}.example.com", 
                    "team_id": team_id, 
                    "created_at": datetime.utcnow()
                }
            )
            owner_id = result.scalar_one()
            print(f"Created person: {team_name} Lead (ID: {owner_id})")
        
        for doc_data in docs:
            # Check if document already exists
            result = db.execute(
                text("SELECT id FROM documents WHERE title = :title AND team_id = :team_id"),
                {"title": doc_data["title"], "team_id": team_id}
            ).fetchone()
            
            if result:
                doc_id = result[0]
                print(f"Document already exists: {doc_data['title']} for team {team_name} (ID: {doc_id})")
            else:
                result = db.execute(
                    text("""
                    INSERT INTO documents 
                    (title, summary, team_id, team, owner_id, critical, last_updated, created_at) 
                    VALUES (:title, :summary, :team_id, :team, :owner_id, :critical, :last_updated, :created_at) 
                    RETURNING id
                    """),
                    {
                        "title": doc_data["title"], 
                        "summary": doc_data["summary"], 
                        "team_id": team_id,
                        "team": team_name,  # Keep team name for backward compatibility
                        "owner_id": owner_id, 
                        "critical": doc_data["critical"], 
                        "last_updated": datetime.utcnow(), 
                        "created_at": datetime.utcnow()
                    }
                )
                doc_id = result.scalar_one()
                print(f"Created document: {doc_data['title']} for team {team_name} (ID: {doc_id})")
            
            doc_ids[(team_name, doc_data["title"])] = doc_id
    
    # Create role-specific documents
    for (team_name, role_name), docs in role_docs.items():
        team_id = team_ids.get(team_name)
        role_id = role_ids.get((team_name, role_name))
        
        if not team_id or not role_id:
            print(f"Team or role not found: {team_name}, {role_name}")
            continue
        
        # Find a person with this role to be the owner
        owner_id = db.execute(
            text("SELECT id FROM people WHERE role_id = :role_id LIMIT 1"),
            {"role_id": role_id}
        ).fetchone()
        
        if owner_id:
            owner_id = owner_id[0]
        else:
            # If no person with this role, create one
            result = db.execute(
                text("INSERT INTO people (name, email, team_id, role_id, created_at) VALUES (:name, :email, :team_id, :role_id, :created_at) RETURNING id"),
                {
                    "name": f"{role_name}", 
                    "email": f"{role_name.lower().replace(' ', '.')}@{team_name.lower()}.example.com", 
                    "team_id": team_id, 
                    "role_id": role_id, 
                    "created_at": datetime.utcnow()
                }
            )
            owner_id = result.scalar_one()
            print(f"Created person: {role_name} (ID: {owner_id})")
        
        for doc_data in docs:
            # Check if document already exists
            result = db.execute(
                text("SELECT id FROM documents WHERE title = :title AND team_id = :team_id"),
                {"title": doc_data["title"], "team_id": team_id}
            ).fetchone()
            
            if result:
                doc_id = result[0]
                print(f"Document already exists: {doc_data['title']} for role {role_name} (ID: {doc_id})")
            else:
                result = db.execute(
                    text("""
                    INSERT INTO documents 
                    (title, summary, team_id, team, owner_id, critical, last_updated, created_at) 
                    VALUES (:title, :summary, :team_id, :team, :owner_id, :critical, :last_updated, :created_at) 
                    RETURNING id
                    """),
                    {
                        "title": doc_data["title"], 
                        "summary": doc_data["summary"], 
                        "team_id": team_id,
                        "team": team_name,  # Keep team name for backward compatibility
                        "owner_id": owner_id, 
                        "critical": doc_data["critical"], 
                        "last_updated": datetime.utcnow(), 
                        "created_at": datetime.utcnow()
                    }
                )
                doc_id = result.scalar_one()
                print(f"Created document: {doc_data['title']} for role {role_name} (ID: {doc_id})")
            
            # Associate document with role
            db.execute(
                text("INSERT INTO document_roles (document_id, role_id, added_at) VALUES (:document_id, :role_id, :added_at)"),
                {"document_id": doc_id, "role_id": role_id, "added_at": datetime.utcnow()}
            )
            print(f"Associated document {doc_data['title']} with role {role_name}")
            
            doc_ids[(team_name, role_name, doc_data["title"])] = doc_id
    
    return doc_ids


def create_contacts(db, team_ids):
    """Create sample contact information for each team."""
    for team_name, team_id in team_ids.items():
        # Find people in this team
        people = db.execute(
            text("SELECT id, name, role_id FROM people WHERE team_id = :team_id"),
            {"team_id": team_id}
        ).fetchall()
        
        if not people:
            print(f"No people found for team: {team_name}")
            continue
        
        # For each person, create a contact entry
        for person_id, person_name, role_id in people:
            # Get role name if available
            role_name = None
            if role_id:
                role = db.execute(
                    text("SELECT name FROM roles WHERE id = :role_id"),
                    {"role_id": role_id}
                ).fetchone()
                if role:
                    role_name = role[0]
            
            # Create contact reason based on role
            contact_reason = f"Contact for {role_name} related questions" if role_name else f"General contact for {team_name} team"
            
            # Check if contact already exists
            result = db.execute(
                text("SELECT id FROM contact_info WHERE team_id = :team_id AND person_id = :person_id"),
                {"team_id": team_id, "person_id": person_id}
            ).fetchone()
            
            if result:
                contact_id = result[0]
                print(f"Contact already exists: {person_name} for team {team_name} (ID: {contact_id})")
            else:
                result = db.execute(
                    text("""
                    INSERT INTO contact_info 
                    (team_id, person_id, contact_reason, priority, created_at) 
                    VALUES (:team_id, :person_id, :contact_reason, :priority, :created_at) 
                    RETURNING id
                    """),
                    {
                        "team_id": team_id, 
                        "person_id": person_id, 
                        "contact_reason": contact_reason, 
                        "priority": 1, 
                        "created_at": datetime.utcnow()
                    }
                )
                contact_id = result.scalar_one()
                print(f"Created contact: {person_name} for team {team_name} (ID: {contact_id})")


def main():
    """Run the seed script."""
    print("Starting seed script for onboarding assistant feature...")
    
    db = SessionLocal()
    
    try:
        # Create teams
        team_ids = create_teams(db)
        
        # Create roles
        role_ids = create_roles(db, team_ids)
        
        # Create documents
        doc_ids = create_documents(db, team_ids, role_ids)
        
        # Create contacts
        create_contacts(db, team_ids)
        
        # Commit all changes
        db.commit()
        print("Seed script completed successfully!")
        return 0
    except Exception as e:
        db.rollback()
        print(f"Seed script failed: {e}")
        return 1
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
