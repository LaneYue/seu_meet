"""积分路由 — GET/POST /points/*"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas import ok
from routers.auth_deps import get_current_user
from services.points_service import daily_checkin

router = APIRouter()


@router.get("/balance")
async def get_balance(current_user: User = Depends(get_current_user)):
    return ok({"balance": current_user.points})


@router.get("/transactions")
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Demo 阶段简化，后续可建 point_logs 表
    return ok({
        "list": [],
        "total": 0,
        "page": 1,
        "pageSize": 20,
        "hasMore": False,
    })


@router.post("/checkin")
async def checkin(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = daily_checkin(db, current_user.id)
    if not result["ok"]:
        from schemas import error
        return error(10001, result.get("message", "签到失败"))

    return ok({
        "amount": result["amount"],
        "balance": result["balance"],
    })
