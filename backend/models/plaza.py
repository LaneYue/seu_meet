"""广场帖子模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class PlazaPost(Base):
    __tablename__ = "plaza_posts"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    authorId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    category = Column(String, nullable=False)  # study / sport / life / interest
    status = Column(String, default="recruiting")  # recruiting / in_progress / finished
    time = Column(String, nullable=False)          # "今天 19:00-22:00"
    place = Column(String, nullable=False)
    capacity = Column(Integer, default=2)           # 总人数限制
    joined = Column(Integer, default=1)             # 当前已加入人数
    note = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())


class PlazaParticipant(Base):
    __tablename__ = "plaza_participants"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    postId = Column(String, ForeignKey("plaza_posts.id"), nullable=False, index=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="joined")  # joined / requested
    createdAt = Column(DateTime, server_default=func.now())
