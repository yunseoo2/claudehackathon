from typing import List, Optional
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
