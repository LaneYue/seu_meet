"""攻略模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base


class Guide(Base):
    __tablename__ = "guides"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    authorId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)
    coverImage = Column(String, nullable=True)
    images = Column(JSON, default=list)
    route = Column(JSON, default=dict)
    budget = Column(Integer, nullable=True)
    suitableFor = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    price = Column(Integer, default=0)
    sales = Column(Integer, default=0)
    avgRating = Column(Float, default=0.0)
    status = Column(String, default="published")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
