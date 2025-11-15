from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from sqlalchemy.ext.associationproxy import association_proxy

from .db import Base


class Person(Base):
    """People who own documents or are members of teams."""

    __tablename__ = "people"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=True)
    role = Column(String, nullable=True)
    team = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # One-to-many: a person can own many documents
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")


class Document(Base):
    """Document containing content, summary and metadata."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    team = Column(String, nullable=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    critical = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Person", back_populates="documents")

    # Association objects (DocumentTopic / DocumentSystem)
    document_topics = relationship(
        "DocumentTopic", back_populates="document", cascade="all, delete-orphan"
    )
    topics = association_proxy("document_topics", "topic")

    document_systems = relationship(
        "DocumentSystem", back_populates="document", cascade="all, delete-orphan"
    )
    systems = association_proxy("document_systems", "system")


class Topic(Base):
    """A high-level topic that documents can be tagged with."""

    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    document_topics = relationship(
        "DocumentTopic", back_populates="topic", cascade="all, delete-orphan"
    )
    documents = association_proxy("document_topics", "document")


class System(Base):
    """Systems referenced by documents (e.g. services, infra components)."""

    __tablename__ = "systems"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)

    document_systems = relationship(
        "DocumentSystem", back_populates="system", cascade="all, delete-orphan"
    )
    documents = association_proxy("document_systems", "document")


class DocumentTopic(Base):
    """Association object linking Document <-> Topic. Using an association object
    allows attaching metadata in the future (e.g. confidence, added_by).
    """

    __tablename__ = "document_topics"
    __table_args__ = (UniqueConstraint("document_id", "topic_id", name="uq_document_topic"),)

    document_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), primary_key=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    # relationships back to parent objects
    document = relationship("Document", back_populates="document_topics")
    topic = relationship("Topic", back_populates="document_topics")


class DocumentSystem(Base):
    """Association object linking Document <-> System."""

    __tablename__ = "document_systems"
    __table_args__ = (UniqueConstraint("document_id", "system_id", name="uq_document_system"),)

    document_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    system_id = Column(Integer, ForeignKey("systems.id"), primary_key=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="document_systems")
    system = relationship("System", back_populates="document_systems")

