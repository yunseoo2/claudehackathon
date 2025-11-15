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
    role = Column(String, nullable=True)  # Keep for backward compatibility
    team = Column(String, nullable=True)  # Keep for backward compatibility
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # One-to-many: a person can own many documents
    documents = relationship("Document", back_populates="owner", cascade="all, delete-orphan")
    
    # New relationships
    role_obj = relationship("Role", back_populates="people")
    team_obj = relationship("Team", back_populates="people")
    contact_for = relationship("ContactInfo", back_populates="person")


class Document(Base):
    """Document containing content, summary and metadata."""

    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("people.id"), nullable=True)
    team = Column(String, nullable=True)  # Keep for backward compatibility
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    content = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    critical = Column(Boolean, default=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("Person", back_populates="documents")
    team_obj = relationship("Team", back_populates="documents")

    # Association objects (DocumentTopic / DocumentSystem / DocumentRole)
    document_topics = relationship(
        "DocumentTopic", back_populates="document", cascade="all, delete-orphan"
    )
    topics = association_proxy("document_topics", "topic")

    document_systems = relationship(
        "DocumentSystem", back_populates="document", cascade="all, delete-orphan"
    )
    systems = association_proxy("document_systems", "system")
    
    document_roles = relationship(
        "DocumentRole", back_populates="document", cascade="all, delete-orphan"
    )
    roles = association_proxy("document_roles", "role")
    
    contacts = relationship("ContactInfo", back_populates="document")


class Topic(Base):
    """A high-level topic that documents can be tagged with."""

    __tablename__ = "topics"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)

    document_topics = relationship(
        "DocumentTopic", back_populates="topic", cascade="all, delete-orphan"
    )
    documents = association_proxy("document_topics", "document")
    
    # New relationship for contacts
    contacts = relationship("ContactInfo", back_populates="topic")


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


class Team(Base):
    """Teams within the organization."""
    
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    people = relationship("Person", back_populates="team_obj")
    documents = relationship("Document", back_populates="team_obj")
    roles = relationship("Role", back_populates="team_obj")
    contacts = relationship("ContactInfo", back_populates="team")


class Role(Base):
    """Standard roles within the organization."""
    
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    team_obj = relationship("Team", back_populates="roles")
    people = relationship("Person", back_populates="role_obj")
    document_roles = relationship("DocumentRole", back_populates="role")
    documents = association_proxy("document_roles", "document")


class DocumentRole(Base):
    """Association object linking Document <-> Role."""
    
    __tablename__ = "document_roles"
    __table_args__ = (UniqueConstraint("document_id", "role_id", name="uq_document_role"),)
    
    document_id = Column(Integer, ForeignKey("documents.id"), primary_key=True)
    role_id = Column(Integer, ForeignKey("roles.id"), primary_key=True)
    relevance_score = Column(Integer, default=5)  # 1-10 relevance score
    added_at = Column(DateTime, default=datetime.utcnow)
    
    document = relationship("Document", back_populates="document_roles")
    role = relationship("Role", back_populates="document_roles")


class ContactInfo(Base):
    """Who to contact for specific topics or documents."""
    
    __tablename__ = "contact_info"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=True)
    person_id = Column(Integer, ForeignKey("people.id"), nullable=False)
    contact_reason = Column(String, nullable=True)
    priority = Column(Integer, default=1)  # 1=primary, 2=secondary, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    
    topic = relationship("Topic", back_populates="contacts")
    document = relationship("Document", back_populates="contacts")
    team = relationship("Team", back_populates="contacts")
    person = relationship("Person", back_populates="contact_for")
