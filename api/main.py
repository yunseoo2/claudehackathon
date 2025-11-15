"""Standalone FastAPI app for Continuum backend (without Vercel dependencies).

Use this file to run the API server locally without Vercel-specific code.

Usage:
    python -m uvicorn api.main:app --reload
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# IMPORTANT: Load .env FIRST, before any imports that use DATABASE_URL
load_dotenv(".env", override=False)
load_dotenv(".env.local", override=False)

# Force SQLite by unsetting DATABASE_URL if it's not explicitly set in .env
# This handles cases where DATABASE_URL might be in shell environment
from pathlib import Path
env_file = Path(".env")
if env_file.exists():
    env_content = env_file.read_text()
    # Only keep DATABASE_URL if it's uncommented in .env
    if not any(line.strip().startswith("DATABASE_URL=") and not line.strip().startswith("#")
               for line in env_content.splitlines()):
        os.environ.pop('DATABASE_URL', None)

from . import db as _db
from .routes import router as api_router

# Create FastAPI app
app = FastAPI(
    title="Continuum API",
    description="Organizational knowledge graph for resilience, risk analysis, and smart onboarding",
    version="1.0.0"
)

# CORS middleware - allow requests from Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database (creates tables if they don't exist)
_db.init_db()

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "service": "continuum-api"}


@app.get("/")
def root():
    """Root endpoint with API information."""
    return {
        "service": "Continuum API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "endpoints": {
            "simulate_departure": "POST /api/simulate-departure",
            "documents_at_risk": "GET /api/documents/at-risk",
            "rag_query": "POST /api/query",
            "recommend_onboarding": "POST /api/recommend-onboarding",
        }
    }
