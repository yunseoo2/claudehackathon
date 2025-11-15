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

    Scores are heuristic: higher when bus_factor low, staleness high, and critical==True.
    Bus factor is calculated per topic (number of unique owners for that topic's documents).
    """
    topic_stats = compute_topic_stats(db)

    # Calculate bus factor per topic (unique owners count)
    topic_bus_factors = {}
    topics = db.query(models.Topic).all()
    for topic in topics:
        unique_owners = set()
        for doc in topic.documents:
            if doc.owner_id:
                unique_owners.add(doc.owner_id)
        topic_bus_factors[topic.name] = len(unique_owners) if unique_owners else 0

    docs = db.query(models.Document).all()
    doc_scores = []
    for d in docs:
        staleness_days = (datetime.utcnow() - d.last_updated).days if d.last_updated else 999

        # Get topic names and bus factor
        topic_names = [t.name for t in d.topics] if d.topics else []
        topic_str = topic_names[0] if topic_names else None
        bus_factor = topic_bus_factors.get(topic_str, 1) if topic_str else 1

        score = 0
        # bus factor influence - lower bus factor = higher risk
        if bus_factor <= 1:
            score += 40
        elif bus_factor == 2:
            score += 20
        # staleness
        score += min(30, staleness_days // 7)
        # critical
        if d.critical:
            score += 30
        score = min(100, score)

        # Get owner info
        owner_names = []
        if d.owner:
            owner_names.append(d.owner.name)

        doc_scores.append({
            "id": d.id,
            "title": d.title,
            "risk_score": score,
            "owners_count": bus_factor,  # This is actually bus factor now
            "staleness_days": staleness_days,
            "critical": d.critical or False,
            "topic": topic_str,
            "owners": owner_names,
            "bus_factor": bus_factor
        })

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
        # Try to use team_id if available, otherwise fall back to string matching
        team_obj = db.query(models.Team).filter(models.Team.name == team).first()
        if team_obj:
            docs = db.query(models.Document).filter(models.Document.team_id == team_obj.id).all()
        else:
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


<<<<<<< HEAD
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
=======
# New functions for onboarding assistant
def get_all_teams(db: Session) -> List[Dict[str, Any]]:
    """Get all teams in the organization."""
    teams = db.query(models.Team).all()
    return teams


def get_all_roles(db: Session) -> List[Dict[str, Any]]:
    """Get all roles in the organization."""
    roles_with_teams = db.query(models.Role, models.Team.name).join(
        models.Team, models.Role.team_id == models.Team.id, isouter=True
    ).all()
    
    result = []
    for role, team_name in roles_with_teams:
        role_dict = {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "team": team_name
        }
        result.append(role_dict)
    
    return result


def get_team_roles(db: Session, team_name: str) -> List[Dict[str, Any]]:
    """Get roles specific to a team."""
    team = db.query(models.Team).filter(models.Team.name == team_name).first()
    if not team:
        return {"error": "team not found"}
    
    roles = db.query(models.Role).filter(models.Role.team_id == team.id).all()
    
    result = []
    for role in roles:
        role_dict = {
            "id": role.id,
            "name": role.name,
            "description": role.description,
            "team": team_name
        }
        result.append(role_dict)
    
    return result


def get_team_contacts(db: Session, team_name: str) -> List[Dict[str, Any]]:
    """Get key contact persons for a specific team."""
    team = db.query(models.Team).filter(models.Team.name == team_name).first()
    if not team:
        return {"error": "team not found"}
    
    contacts = db.query(models.ContactInfo).filter(models.ContactInfo.team_id == team.id).all()
    result = []
    
    for contact in contacts:
        person = db.query(models.Person).filter(models.Person.id == contact.person_id).first()
        if person:
            result.append({
                "id": contact.id,
                "person_id": person.id,
                "person_name": person.name,
                "person_role": person.role,
                "contact_reason": contact.contact_reason,
                "priority": contact.priority
            })
    
    return result


def get_team_documents(db: Session, team_name: str) -> List[Dict[str, Any]]:
    """Get documents relevant to a specific team."""
    team = db.query(models.Team).filter(models.Team.name == team_name).first()
    if not team:
        return {"error": "team not found"}
    
    # Try both team_id and legacy team field
    docs_by_id = db.query(models.Document).filter(models.Document.team_id == team.id).all()
    docs_by_name = db.query(models.Document).filter(models.Document.team == team.name).all()
    
    # Combine and deduplicate
    docs = list({doc.id: doc for doc in docs_by_id + docs_by_name}.values())
    
    return [{
        "id": d.id,
        "title": d.title,
        "summary": d.summary
    } for d in docs]


def get_role_documents(db: Session, role_name: str, team_name: str = None) -> List[Dict[str, Any]]:
    """Get documents relevant to a specific role."""
    query = db.query(models.Role).filter(models.Role.name == role_name)
    
    if team_name:
        team = db.query(models.Team).filter(models.Team.name == team_name).first()
        if not team:
            return {"error": "team not found"}
        query = query.filter(models.Role.team_id == team.id)
    
    role = query.first()
    if not role:
        return {"error": "role not found"}
    
    docs = db.query(models.Document).join(
        models.DocumentRole,
        models.Document.id == models.DocumentRole.document_id
    ).filter(models.DocumentRole.role_id == role.id).all()
    
    return [{
        "id": d.id,
        "title": d.title,
        "summary": d.summary
    } for d in docs]


def personalized_onboarding(db: Session, team_name: str, role_name: str = None) -> Dict[str, Any]:
    """Generate personalized onboarding materials based on team and role."""
    team = db.query(models.Team).filter(models.Team.name == team_name).first()
    if not team:
        return {"error": "team not found"}
    
    role = None
    if role_name:
        role = db.query(models.Role).filter(
            models.Role.name == role_name,
            models.Role.team_id == team.id
        ).first()
        if not role:
            return {"error": "role not found for this team"}
    
    # Get relevant documents for this team and role
    query = db.query(models.Document)
    team_docs = []
    
    # Try both team_id and legacy team field
    team_docs_by_id = query.filter(models.Document.team_id == team.id).all()
    team_docs_by_name = query.filter(models.Document.team == team.name).all()
    team_docs = list({doc.id: doc for doc in team_docs_by_id + team_docs_by_name}.values())
    
    role_docs = []
    if role:
        # Get documents specifically relevant to this role
        role_docs = db.query(models.Document).join(
            models.DocumentRole,
            models.Document.id == models.DocumentRole.document_id
        ).filter(models.DocumentRole.role_id == role.id).all()
    
    # Combine and deduplicate
    docs = list({doc.id: doc for doc in team_docs + role_docs}.values())
    
    # Get specific people to contact based on team and role
    team_members = db.query(models.Person).filter(
        models.Person.team_id == team.id
    ).all()
    
    # Get specific people with the same role
    role_experts = []
    if role:
        role_experts = db.query(models.Person).filter(
            models.Person.role_id == role.id,
            models.Person.team_id == team.id
        ).all()
    
    # Get team lead (assuming the first person added to the team is the lead)
    team_lead = db.query(models.Person).filter(
        models.Person.team_id == team.id
    ).order_by(models.Person.id).first()
    
    # Get document owners
    doc_owners = set()
    for doc in docs:
        if doc.owner_id:
            owner = db.query(models.Person).filter(models.Person.id == doc.owner_id).first()
            if owner:
                doc_owners.add(owner)
    
    # Prepare contacts list
    contacts = []
    
    # Add team lead
    if team_lead:
        contacts.append({
            "id": len(contacts) + 1,
            "person_id": team_lead.id,
            "person_name": team_lead.name,
            "person_role": team_lead.role or "Team Lead",
            "contact_reason": f"Team lead for {team_name}",
            "priority": 1
        })
    
    # Add role experts
    for expert in role_experts:
        if expert.id != team_lead.id:  # Avoid duplicates
            contacts.append({
                "id": len(contacts) + 1,
                "person_id": expert.id,
                "person_name": expert.name,
                "person_role": expert.role or role_name,
                "contact_reason": f"Expert in {role_name} role",
                "priority": 2
            })
    
    # Add document owners
    for owner in doc_owners:
        if owner.id != team_lead.id and owner.id not in [e.id for e in role_experts]:  # Avoid duplicates
            contacts.append({
                "id": len(contacts) + 1,
                "person_id": owner.id,
                "person_name": owner.name,
                "person_role": owner.role,
                "contact_reason": "Document owner and subject matter expert",
                "priority": 3
            })
    
    # Add other team members
    for member in team_members:
        if member.id != team_lead.id and member.id not in [e.id for e in role_experts] and member.id not in [o.id for o in doc_owners]:
            contacts.append({
                "id": len(contacts) + 1,
                "person_id": member.id,
                "person_name": member.name,
                "person_role": member.role,
                "contact_reason": f"Team member in {team_name}",
                "priority": 4
            })
    
    # Also get contacts from the contact_info table
    db_contacts = db.query(models.ContactInfo).filter(models.ContactInfo.team_id == team.id).all()
    for contact in db_contacts:
        person = db.query(models.Person).filter(models.Person.id == contact.person_id).first()
        if person:
            # Check if this person is already in our contacts list
            if person.id not in [c["person_id"] for c in contacts]:
                contacts.append({
                    "id": len(contacts) + 1,
                    "person_id": person.id,
                    "person_name": person.name,
                    "person_role": person.role,
                    "contact_reason": contact.contact_reason or f"Contact for {team_name}",
                    "priority": contact.priority
                })
    
    # Sort contacts by priority
    contacts = sorted(contacts, key=lambda x: x["priority"])
    
    # Generate onboarding plan using Claude
    doc_list = "\n".join([f"- {d.title}: {d.summary or ''}" for d in docs[:20]])
    contacts_list = "\n".join([f"- {c['person_name']} ({c['person_role'] or 'N/A'}): {c['contact_reason'] or 'General contact'}" for c in contacts])
    
    prompt = (
        f"Create a personalized onboarding plan for someone joining the {team_name} team"
        f"{f' as a {role_name}' if role_name else ''}.\n\n"
        f"Key documents:\n{doc_list}\n\n"
        f"Key contacts:\n{contacts_list or 'No specific contacts defined.'}\n\n"
        f"Please include:\n"
        f"1. A prioritized reading list with rationale\n"
        f"2. Who to contact for specific questions (use the specific people listed above)\n"
        f"3. First week, first month, and first quarter milestones\n"
    )
    
    claude_out = call_claude(prompt)
    
    return {
        "team": team_name,
        "role": role_name,
        "plan": claude_out,
        "relevant_docs": [{
            "id": d.id,
            "title": d.title
        } for d in docs],
        "key_contacts": contacts
>>>>>>> 59ff7c6 (integrated api)
    }
