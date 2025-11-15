from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class PersonBase(BaseModel):
    name: str
    email: Optional[str]
    role: Optional[str]
    team: Optional[str]


class Person(PersonBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class DocumentBase(BaseModel):
    title: str
    owner_id: Optional[int]
    team: Optional[str]
    content: Optional[str]
    summary: Optional[str]
    critical: Optional[bool] = False


class Document(DocumentBase):
    id: int
    last_updated: Optional[datetime]
    created_at: datetime

    class Config:
        orm_mode = True


class Topic(BaseModel):
    id: int
    name: str

    class Config:
        orm_mode = True


class System(BaseModel):
    id: int
    name: str
    description: Optional[str]

    class Config:
        orm_mode = True


class SimulateRequest(BaseModel):
    person_id: int


class QueryRequest(BaseModel):
    question: str


class OnboardingRequest(BaseModel):
    mode: str  # "team" or "handoff"
    team: Optional[str]
    person_leaving: Optional[int]
    person_joining: Optional[int]


# New schemas for onboarding assistant
class TeamBase(BaseModel):
    name: str
    description: Optional[str]


class Team(TeamBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class TeamResponse(TeamBase):
    id: int


class RoleBase(BaseModel):
    name: str
    description: Optional[str]
    team: Optional[str]


class Role(RoleBase):
    id: int
    team_id: Optional[int]
    created_at: datetime

    class Config:
        orm_mode = True


class RoleResponse(RoleBase):
    id: int


class ContactBase(BaseModel):
    contact_reason: Optional[str]
    priority: int = 1


class ContactInfo(ContactBase):
    id: int
    topic_id: Optional[int]
    document_id: Optional[int]
    team_id: Optional[int]
    person_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class ContactResponse(BaseModel):
    id: int
    person_id: int
    person_name: str
    person_role: Optional[str]
    contact_reason: Optional[str]
    priority: int


class PersonalizedOnboardingRequest(BaseModel):
    team: str
    role: Optional[str]


class DocumentBrief(BaseModel):
    id: int
    title: str
    summary: Optional[str]


class PersonalizedOnboardingResponse(BaseModel):
    team: str
    role: Optional[str]
    plan: str
    relevant_docs: List[Dict[str, Any]]
    key_contacts: List[Dict[str, Any]]
