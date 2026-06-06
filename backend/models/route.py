"""路线模型 — 校园打卡路线"""

from uuid import uuid4
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from database import Base


class CampusRoute(Base):
    __tablename__ = "campus_routes"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    title = Column(String, nullable=False)
    badge = Column(String, default="用户路线")      # "官方路线" / "用户路线"
    campus = Column(String, nullable=False)         # "九龙湖" / "四牌楼" / "丁家桥"
    duration = Column(String, nullable=False)        # "约 1 天"
    difficulty = Column(String, nullable=False)      # "轻松" / "中等" / "挑战"
    participantCount = Column(Integer, default=0)
    nodeCount = Column(Integer, default=0)
    coverImage = Column(String, nullable=True)
    intro = Column(String, nullable=False)
    tags = Column(JSON, default=list)
    status = Column(String, default="published")     # published / draft
    createdAt = Column(DateTime, server_default=func.now())


class RouteStep(Base):
    __tablename__ = "route_steps"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    routeId = Column(String, ForeignKey("campus_routes.id"), nullable=False, index=True)
    title = Column(String, nullable=False)
    desc = Column(String, nullable=False)
    method = Column(String, default="扫码打卡")      # "扫码打卡" / "计时打卡" / "拍照打卡"
    sortOrder = Column(Integer, default=0)
    createdAt = Column(DateTime, server_default=func.now())


class RouteCheckin(Base):
    __tablename__ = "route_checkins"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    routeId = Column(String, ForeignKey("campus_routes.id"), nullable=False)
    stepId = Column(String, ForeignKey("route_steps.id"), nullable=False)
    createdAt = Column(DateTime, server_default=func.now())


class Badge(Base):
    __tablename__ = "badges"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=False)             # Lucide 图标名 "BookOpen" / "Compass"
    level = Column(String, nullable=False)             # "已获得" / "1/3" 等
    unlockedAt = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, server_default=func.now())
