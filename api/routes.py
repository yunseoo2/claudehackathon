from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from . import db, services
from .schemas import (
    SimulateRequest, 
    QueryRequest, 
    OnboardingRequest, 
    TeamResponse, 
    RoleResponse, 
    ContactResponse, 
    PersonalizedOnboardingRequest,
    DocumentBrief
)

router = APIRouter()


def get_db():
    db_session = db.SessionLocal()
    try:
        yield db_session
    finally:
        db_session.close()


@router.post("/simulate-departure")
def simulate_departure(req: SimulateRequest, dbs: Session = Depends(get_db)):
    res = services.simulate_departure(dbs, req.person_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


@router.get("/documents/at-risk")
def documents_at_risk(recommend: bool = Query(False), dbs: Session = Depends(get_db)):
    res = services.compute_documents_at_risk(dbs)
    # Always return empty recommendations (AI recommendations removed per user request)
    res["recommendations"] = ""
    return res


@router.post("/query")
def rag_query(req: QueryRequest, dbs: Session = Depends(get_db)):
    res = services.rag_answer(dbs, req.question)
    return res


@router.post("/recommend-onboarding")
def recommend_onboarding(req: OnboardingRequest, dbs: Session = Depends(get_db)):
    out = services.recommend_onboarding(dbs, req.mode, team=req.team, person_leaving=req.person_leaving, person_joining=req.person_joining)
    return {"plan": out}


@router.get("/topics")
def list_topics(dbs: Session = Depends(get_db)):
    """List all topics with summary stats."""
    return {"topics": services.list_topics(dbs)}


@router.get("/topics/{topic_id}")
def get_topic(topic_id: int, dbs: Session = Depends(get_db)):
    """Get a topic and its documents (used by topic modal)."""
    t = services.get_topic_detail(dbs, topic_id)
    if t is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return t


@router.get("/documents/risky")
def documents_risky(threshold: int = Query(60), limit: int = Query(0), dbs: Session = Depends(get_db)):
    """Return documents whose computed risk_score >= threshold."""
    return services.documents_risky(dbs, threshold=threshold, limit=limit)


@router.get("/dashboard/stats")
def dashboard_stats(dbs: Session = Depends(get_db)):
    """Return counters and aggregated risk metrics for dashboard."""
    return services.dashboard_stats(dbs)
# New endpoints for onboarding assistant
@router.get("/teams", response_model=List[TeamResponse])
def get_teams(dbs: Session = Depends(get_db)):
    """Get all teams in the organization."""
    teams = services.get_all_teams(dbs)
    return teams


@router.get("/roles", response_model=List[RoleResponse])
def get_roles(dbs: Session = Depends(get_db)):
    """Get all roles in the organization."""
    roles = services.get_all_roles(dbs)
    return roles


@router.get("/teams/{team_name}/roles", response_model=List[RoleResponse])
def get_team_roles(team_name: str, dbs: Session = Depends(get_db)):
    """Get roles specific to a team."""
    roles = services.get_team_roles(dbs, team_name)
    if isinstance(roles, dict) and "error" in roles:
        raise HTTPException(status_code=404, detail=roles["error"])
    return roles


@router.get("/teams/{team_name}/contacts", response_model=List[ContactResponse])
def get_team_contacts(team_name: str, dbs: Session = Depends(get_db)):
    """Get key contact persons for a specific team."""
    contacts = services.get_team_contacts(dbs, team_name)
    if isinstance(contacts, dict) and "error" in contacts:
        raise HTTPException(status_code=404, detail=contacts["error"])
    return contacts


@router.post("/onboarding/personalized")
def personalized_onboarding(req: PersonalizedOnboardingRequest, dbs: Session = Depends(get_db)):
    """Generate personalized onboarding materials based on team and role."""
    result = services.personalized_onboarding(dbs, req.team, req.role)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result


@router.get("/documents/by-team/{team_name}", response_model=List[DocumentBrief])
def get_team_documents(team_name: str, dbs: Session = Depends(get_db)):
    """Get documents relevant to a specific team."""
    docs = services.get_team_documents(dbs, team_name)
    if isinstance(docs, dict) and "error" in docs:
        raise HTTPException(status_code=404, detail=docs["error"])
    return docs


@router.get("/documents/by-role/{role_name}", response_model=List[DocumentBrief])
def get_role_documents(role_name: str, team_name: Optional[str] = None, dbs: Session = Depends(get_db)):
    """Get documents relevant to a specific role."""
    docs = services.get_role_documents(dbs, role_name, team_name)
    if isinstance(docs, dict) and "error" in docs:
        raise HTTPException(status_code=404, detail=docs["error"])
    return docs
