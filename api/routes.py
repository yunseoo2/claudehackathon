from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from . import db, services
from .schemas import SimulateRequest, QueryRequest, OnboardingRequest

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
    if recommend:
        prompt = "Give brief improvement recommendations based on the risks."
        rec = services.call_claude if hasattr(services, "call_claude") else None
        # use services' anthopic wrapper
        from .anthropic_client import call_claude

        rec_text = call_claude(prompt)
        res["recommendations"] = rec_text
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
