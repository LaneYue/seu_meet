"""聊天模型 — ChatSession / Message"""

from uuid import uuid4
from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (UniqueConstraint("user1Id", "user2Id"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False)
    user1Id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    user2Id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    stage = Column(String, default="ice_breaking")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    sessionId = Column(String, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    senderId = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, default="text")
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
    readAt = Column(DateTime, nullable=True)
