"""成就系统模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from database import Base


class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    code = Column(String, unique=True, nullable=False, index=True)  # SL01
    name = Column(String, nullable=False)
    campus = Column(String, nullable=False)   # S/J/D/C
    category = Column(String, nullable=False) # L/I/M/F/H
    conditionDesc = Column(String, nullable=False)
    humorDesc = Column(String, nullable=False)
    imagePath = Column(String, nullable=False)
    isHidden = Column(Boolean, default=False)
    sortOrder = Column(Integer, nullable=False, default=0)


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    __table_args__ = (UniqueConstraint("userId", "achievementCode"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    achievementCode = Column(String, ForeignKey("achievements.code"), nullable=False)
    unlockedAt = Column(DateTime, server_default=func.now())
