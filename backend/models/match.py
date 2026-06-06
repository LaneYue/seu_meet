"""匹配记录模型 — 核心状态机"""

from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("userId", "targetId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    targetId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    action = Column(String, nullable=False)
    status = Column(String, default="pending")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
