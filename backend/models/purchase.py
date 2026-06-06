"""购买记录模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class Purchase(Base):
    __tablename__ = "purchases"
    __table_args__ = (UniqueConstraint("buyerId", "guideId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    buyerId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    guideId = Column(String, ForeignKey("guides.id"), nullable=False, index=True)
    price = Column(Integer, nullable=False)
    refunded = Column(Boolean, default=False)
    createdAt = Column(DateTime, server_default=func.now())
