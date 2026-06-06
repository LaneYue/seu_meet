"""用户模型"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, JSON
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    studentId = Column(String, unique=True, nullable=False, index=True)
    realName = Column(String, nullable=False)
    idCardLast6 = Column(String, nullable=False)
    passwordHash = Column(String, nullable=False)
    nickname = Column(String, unique=True, nullable=False, index=True)
    avatar = Column(String, nullable=True, default=None)
    college = Column(String, nullable=False)
    major = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    campus = Column(String, nullable=False)
    gender = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    tags = Column(JSON, default=list)
    creditScore = Column(Integer, default=70)
    points = Column(Integer, default=0)
    status = Column(String, default="active")
    createdAt = Column(DateTime, server_default=func.now())
    updatedAt = Column(DateTime, server_default=func.now(), onupdate=func.now())
