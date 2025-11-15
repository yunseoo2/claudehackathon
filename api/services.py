from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models
from .anthropic_client import call_claude


def compute_topic_stats(db: Session) -> List[Dict[str, Any]]:
    """Return basic stats per topic used by risk computations."""
    topics = db.query(models.Topic).all()
    results = []
    for t in topics:
        docs = t.documents
        owners = set(d.owner_id for d in docs if d.owner_id)
        last_updated = max((d.last_updated for d in docs if d.last_updated), default=None)
        age_days = (datetime.utcnow() - last_updated).days if last_updated else None
        results.append(
            {
                "topic_id": t.id,
                "topic": t.name,
                "docs_count": len(docs),
                "owners_count": len(owners),
                "staleness_days": age_days,
            }
        )
    return results


def simulate_departure(db: Session, person_id: int) -> Dict[str, Any]:
    """Simulate a person leaving and return affected topics/docs/systems.

    This is a simplified version suitable for a hackathon prototype.
    """
    person = db.query(models.Person).filter(models.Person.id == person_id).first()
    if not person:
        return {"error": "person not found"}

    # Orphaned docs: documents owned only by that person (owner_id == person_id)
    orphaned = db.query(models.Document).filter(models.Document.owner_id == person_id).all()

    # Topics impacted: where this person's documents are the only owners for that topic
    impacted_topics = []
    for topic in db.query(models.Topic).all():
        docs = topic.documents
        owners = set(d.owner_id for d in docs if d.owner_id)
        if person_id in owners and len(owners) == 1:
            impacted_topics.append({"topic_id": topic.id, "name": topic.name, "reason": "sole owner leaving"})

    # Under-documented systems: systems that are referenced only inside docs owned by this person
    under_documented = []
    for system in db.query(models.System).all():
        docs = system.documents
        owners = set(d.owner_id for d in docs if d.owner_id)
        if owners and owners == {person_id}:
            under_documented.append({"system_id": system.id, "name": system.name})

    # Generate a Claude-assisted handoff summary and cross-training suggestions
    doc_summaries = "\n".join([f"- {d.title}: {d.summary or (d.content or '')[:200]}" for d in orphaned[:10]])
    prompt = (
        f"Person leaving: {person.name} ({person.email})\n"
        f"Orphaned docs:\n{doc_summaries}\n\n"
        "Please produce:\n1) a short handoff summary for the team\n2) cross-training suggestions listing roles/topics to train\n"
    )
    claude_out = call_claude(prompt)

    return {
        "person": {"id": person.id, "name": person.name},
        "orphaned_docs": [{"id": d.id, "title": d.title} for d in orphaned],
        "impacted_topics": impacted_topics,
        "under_documented_systems": under_documented,
        "claude_handoff": claude_out,
    }


def compute_documents_at_risk(db: Session) -> Dict[str, Any]:
    """Compute a simple risk score per document and per topic.

    Scores are heuristic: higher when owners_count low, staleness high, and critical==True.
    """
    topic_stats = compute_topic_stats(db)
    docs = db.query(models.Document).all()
    doc_scores = []
    for d in docs:
        owners_count = 1 if d.owner_id else 0
        staleness_days = (datetime.utcnow() - d.last_updated).days if d.last_updated else 999
        score = 0
        # owner influence
        if owners_count <= 1:
            score += 40
        # staleness
        score += min(30, staleness_days // 7)
        # critical
        if d.critical:
            score += 30
        score = min(100, score)
        doc_scores.append({"id": d.id, "title": d.title, "risk_score": score, "owners_count": owners_count, "staleness_days": staleness_days})

    # team_resilience_score = inverse of avg risk (simple)
    avg_risk = sum(item["risk_score"] for item in doc_scores) / (len(doc_scores) or 1)
    team_resilience_score = max(0, 100 - avg_risk)

    return {"topic_stats": topic_stats, "documents": doc_scores, "team_resilience_score": team_resilience_score}


def select_relevant_docs(db: Session, question: str, k: int = 3):
    """Very simple retrieval: score by keyword overlap with title/summary."""
    words = set(question.lower().split())
    candidates = []
    for d in db.query(models.Document).all():
        text = (d.title or "") + " " + (d.summary or "")
        tokens = set(text.lower().split())
        overlap = len(words.intersection(tokens))
        candidates.append((overlap, d))
    candidates.sort(key=lambda x: x[0], reverse=True)
    selected = [d for score, d in candidates if score > 0][:k]
    # fallback to most recent docs
    if not selected:
        selected = db.query(models.Document).order_by(models.Document.last_updated.desc()).limit(k).all()
    return selected


def rag_answer(db: Session, question: str) -> Dict[str, Any]:
    docs = select_relevant_docs(db, question, k=3)
    docs_text = "\n\n".join([f"Title: {d.title}\nSummary: {d.summary}\nContent: {d.content[:1000] if d.content else ''}" for d in docs])
    prompt = f"Answer the question using the documents below. Also list people to contact and a short resilience summary.\n\nDocs:\n{docs_text}\n\nQuestion: {question}\n"
    claude_out = call_claude(prompt)

    owners = set()
    for d in docs:
        if d.owner_id:
            owners.add(d.owner_id)

    return {
        "answer": claude_out,
        "referenced_docs": [{"id": d.id, "title": d.title} for d in docs],
        "people_to_contact": list(owners),
    }


def recommend_onboarding(db: Session, mode: str, team: str = None, person_leaving: int = None, person_joining: int = None) -> str:
    if mode == "team":
        docs = db.query(models.Document).filter(models.Document.team == team).all() if team else db.query(models.Document).all()
        doc_list = "\n".join([f"- {d.title}: {d.summary or ''}" for d in docs[:20]])
        prompt = f"Create a short onboarding plan for team {team}. Use these docs:\n{doc_list}\n"
        return call_claude(prompt)

    if mode == "handoff":
        leaving = db.query(models.Person).filter(models.Person.id == person_leaving).first()
        joining = db.query(models.Person).filter(models.Person.id == person_joining).first()
        docs = db.query(models.Document).filter(models.Document.owner_id == person_leaving).all()
        doc_list = "\n".join([f"- {d.title}: {d.summary or ''}" for d in docs[:20]])
        prompt = (
            f"Create a handoff plan from {leaving.name if leaving else 'UNKNOWN'} to {joining.name if joining else 'NEW'} using these docs:\n{doc_list}\n"
        )
        return call_claude(prompt)

    return "invalid mode"


### New read-only helpers for API endpoints


def list_topics(db: Session):
    """Return a lightweight list of topics and simple stats."""
    out = []
    for t in db.query(models.Topic).order_by(models.Topic.name).all():
        docs = t.documents
        owners = set(d.owner_id for d in docs if d.owner_id)
        out.append({
            "id": t.id,
            "name": t.name,
            "docs_count": len(docs),
            "owners_count": len(owners),
        })
    return out


def get_topic_detail(db: Session, topic_id: int):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        return None
    docs = []
    for d in topic.documents:
        owners_count = 1 if d.owner_id else 0
        staleness_days = (datetime.utcnow() - d.last_updated).days if d.last_updated else 999
        score = 0
        if owners_count <= 1:
            score += 40
        score += min(30, staleness_days // 7)
        if d.critical:
            score += 30
        score = min(100, score)
        docs.append({
            "id": d.id,
            "title": d.title,
            "owner_id": d.owner_id,
            "team": d.team,
            "risk_score": score,
            "staleness_days": staleness_days,
        })

    return {
        "id": topic.id,
        "name": topic.name,
        "docs": docs,
    }


def documents_risky(db: Session, threshold: int = 60, limit: int = 0):
    """Return documents whose computed risk_score >= threshold. If limit>0, return top-N by score."""
    all_docs = compute_documents_at_risk(db)["documents"]
    filtered = [d for d in all_docs if d["risk_score"] >= threshold]
    filtered.sort(key=lambda x: x["risk_score"], reverse=True)
    if limit and limit > 0:
        filtered = filtered[:limit]
    return {"threshold": threshold, "count": len(filtered), "documents": filtered}


def dashboard_stats(db: Session):
    """Return simple dashboard counters and aggregated risk metrics."""
    people_count = db.query(models.Person).count()
    docs_count = db.query(models.Document).count()
    topics_count = db.query(models.Topic).count()
    systems_count = db.query(models.System).count()
    critical_count = db.query(models.Document).filter(models.Document.critical == True).count()
    docs_info = compute_documents_at_risk(db)["documents"]
    at_risk_count = sum(1 for d in docs_info if d["risk_score"] >= 60)
    avg_risk = sum(d["risk_score"] for d in docs_info) / (len(docs_info) or 1)

    return {
        "people": people_count,
        "documents": docs_count,
        "topics": topics_count,
        "systems": systems_count,
        "critical_documents": critical_count,
        "at_risk_documents": at_risk_count,
        "avg_document_risk": round(avg_risk, 1),
    }
