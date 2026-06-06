"""积分路由 — GET/POST /points/*"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.ledger import PointLog
from schemas import ok, error
from routers.auth_deps import get_current_user
from services.points_service import daily_checkin

router = APIRouter()


@router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    return ok({"balance": current_user.points})


@router.get("/transactions")
async def get_transactions(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(PointLog).filter(PointLog.userId == current_user.id).order_by(PointLog.createdAt.desc())
    total = query.count()
    logs = query.offset((page - 1) * pageSize).limit(pageSize).all()

    return ok({
        "list": [
            {
                "id": log.id,
                "amount": log.amount,
                "desc": log.desc,
                "refType": log.refType,
                "createdAt": log.createdAt.isoformat() if log.createdAt else None,
            }
            for log in logs
        ],
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "hasMore": (page * pageSize) < total,
    })


@router.post("/checkin")
async def checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = daily_checkin(db, current_user.id)
    if not result["ok"]:
        return error(10001, result.get("message", "签到失败"))

    return ok({"amount": result["amount"], "balance": result["balance"]})

