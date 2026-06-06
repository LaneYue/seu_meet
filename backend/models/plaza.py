"""广场模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class PlazaPost(Base):
    __tablename__ = "plaza_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    authorId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # study/sport/life/interest
    status = Column(String, default="recruiting")  # recruiting/active/closed
    time = Column(String, nullable=False)
    place = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False)
    joinedCount = Column(Integer, default=1)  # 作者算一个
    note = Column(String, default="")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PlazaJoin(Base):
    __tablename__ = "plaza_joins"
    __table_args__ = (UniqueConstraint("postId", "userId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    postId = Column(String, ForeignKey("plaza_posts.id"), nullable=False, index=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String, default="join")  # join/request
    joinedAt = Column(DateTime, server_default=func.now())
