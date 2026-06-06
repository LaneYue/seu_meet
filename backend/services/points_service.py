"""积分服务"""

from sqlalchemy.orm import Session
from models.user import User
from models.ledger import PointLog


def _log(db: Session, user_id: str, amount: int, desc: str, ref_type: str = None, ref_id: str = None):
    log = PointLog(userId=user_id, amount=amount, desc=desc, refType=ref_type, refId=ref_id)
    db.add(log)


def daily_checkin(db: Session, user_id: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"ok": False, "message": "用户不存在"}

    user.points += 5
    _log(db, user_id, 5, "每日签到", "checkin")
    db.commit()

    return {"ok": True, "amount": 5, "balance": user.points}


def deduct_points(db: Session, user_id: str, amount: int, desc: str = "积分消耗", ref_type: str = None, ref_id: str = None) -> bool:
    user = db.query(User).filter(User.id == user_id).first()
    if not user or user.points < amount:
        return False
    user.points -= amount
    _log(db, user_id, -amount, desc, ref_type, ref_id)
    db.commit()
    return True


def add_points(db: Session, user_id: str, amount: int, desc: str = "积分奖励", ref_type: str = None, ref_id: str = None):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.points += amount
        _log(db, user_id, amount, desc, ref_type, ref_id)
        db.commit()
