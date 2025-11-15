from typing import Dict, Any

try:
    # When running from project root: python -m api.ingest_topics_and_systems
    from api.db import SessionLocal
    from api import models
except Exception:
    # When running from api/ directory directly: python ingest_topics_and_systems.py
    from db import SessionLocal
    import models


def extract_topics_and_systems_with_claude(content: str) -> Dict[str, Any]:
    """Stub function for Claude extraction. Replace this with real Claude call.

    Returns dict with keys: topics (list[str]), systems (list[str]), summary (str)
    """
    text = (content or "").lower()
    topics = set()
    systems = set()

    if "deploy" in text or "deployment" in text or "argo" in text:
        topics.update(["Deployments", "CI/CD"])
    if "rollback" in text:
        topics.add("Rollback")
    if "payroll" in text or "tax" in text:
        topics.add("Payroll")
    if "billing" in text or "billing" in text or "refund" in text:
        topics.add("Billing")
    if "reconciliation" in text or "payout" in text:
        topics.add("Reconciliation")

    if "argocd" in text:
        systems.add("ArgoCD")
    if "github actions" in text or "github" in text:
        systems.add("GitHub Actions")
    if "payment" in text or "payout" in text:
        systems.add("Payout Engine")
    if "hris" in text or "payroll" in text:
        systems.add("HRIS")

    summary = (content or "").strip()[:400]

    return {"topics": list(topics), "systems": list(systems), "summary": summary}


def upsert_topic(session, name: str):
    t = session.query(models.Topic).filter_by(name=name).first()
    if not t:
        t = models.Topic(name=name)
        session.add(t)
        session.flush()
    return t


def upsert_system(session, name: str):
    s = session.query(models.System).filter_by(name=name).first()
    if not s:
        s = models.System(name=name)
        session.add(s)
        session.flush()
    return s


def ingest():
    session = SessionLocal()
    try:
        documents = session.query(models.Document).all()
        print(f"Found {len(documents)} documents to process")

        for doc in documents:
            result = extract_topics_and_systems_with_claude(doc.content or "")
            topic_names = result.get("topics", [])
            system_names = result.get("systems", [])
            summary = result.get("summary")

            # Upsert topics and create DocumentTopic links
            for tn in topic_names:
                topic = upsert_topic(session, tn)
                exists = (
                    session.query(models.DocumentTopic)
                    .filter_by(document_id=doc.id, topic_id=topic.id)
                    .first()
                )
                if not exists:
                    link = models.DocumentTopic(document=doc, topic=topic)
                    session.add(link)

            # Upsert systems and create DocumentSystem links
            for sn in system_names:
                system = upsert_system(session, sn)
                exists = (
                    session.query(models.DocumentSystem)
                    .filter_by(document_id=doc.id, system_id=system.id)
                    .first()
                )
                if not exists:
                    link = models.DocumentSystem(document=doc, system=system)
                    session.add(link)

            # Update summary if present
            if summary:
                doc.summary = summary

        session.commit()
        print("Ingest complete.")
    except Exception as e:
        session.rollback()
        print("Error during ingest:", e)
        raise
    finally:
        session.close()


if __name__ == "__main__":
    ingest()
