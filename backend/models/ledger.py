"""吧唧兑换 + 积分流水模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.sql import func
from database import Base


class RedeemOrder(Base):
    __tablename__ = "redeem_orders"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    achievementCode = Column(String, nullable=False)
    cost = Column(Integer, default=50)
    dormBuilding = Column(String, nullable=False)
    dormRoom = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending/shipped/delivered
    createdAt = Column(DateTime, server_default=func.now())


class PointLog(Base):
    __tablename__ = "point_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    amount = Column(Integer, nullable=False)   # 正数加分，负数扣分
    desc = Column(String, nullable=False)
    refType = Column(String, nullable=True)    # checkin / guide_purchase / achievement / plaza
    refId = Column(String, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
