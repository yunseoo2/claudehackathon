from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from .db import Base


# Association tables
document_topics = Table(
    "document_topics",
    Base.metadata,
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
    Column("topic_id", Integer, ForeignKey("topics.id"), primary_key=True),
)

document_systems = Table(
    "document_systems",
    Base.metadata,
    Column("document_id", Integer, ForeignKey("documents.id"), primary_key=True),
    Column("system_id", Integer, ForeignKey("systems.id"), primary_key=True),
)


class Person(Base):
    __tablename__ = "people"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    role = Column(String, nullable=True)
    team = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    documents = relationship("Document", back_populates="owner")


class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    team = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    critical = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Person", back_populates="documents")
    topics = relationship("Topic", secondary=document_topics, back_populates="documents")
    systems = relationship("System", secondary=document_systems, back_populates="documents")


class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    documents = relationship("Document", secondary=document_topics, back_populates="topics")


class System(Base):
    __tablename__ = "systems"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    documents = relationship("Document", secondary=document_systems, back_populates="systems")
