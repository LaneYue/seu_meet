"""破冰问答模型 — Question / Answer / Rating"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    category = Column(String, nullable=False)
    content = Column(String, nullable=False)
    active = Column(Boolean, default=True)
    createdAt = Column(DateTime, server_default=func.now())


class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False, index=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    questionId = Column(String, ForeignKey("questions.id"), nullable=False)
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())


class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("matchId", "fromId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False, index=True)
    fromId = Column(String, ForeignKey("users.id"), nullable=False)
    toId = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
