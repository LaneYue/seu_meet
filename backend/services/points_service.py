"""积分服务"""

from datetime import datetime, timezone
from sqlalchemy.orm import Session
from models.user import User


def daily_checkin(db: Session, user_id: str) -> dict:
    """每日签到 +5 积分"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"ok": False, "message": "用户不存在"}

    user.points += 5
    db.commit()

    return {
        "ok": True,
        "amount": 5,
        "balance": user.points,
    }


def deduct_points(db: Session, user_id: str, amount: int) -> bool:
    """扣除积分，余额不足返回 False"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.points < amount:
        return False
    user.points -= amount
    db.commit()
    return True


def add_points(db: Session, user_id: str, amount: int):
    """增加积分"""
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.points += amount
        db.commit()
