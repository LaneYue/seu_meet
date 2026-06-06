"""匹配路由 — GET /match/discover, POST /match/:targetId/action"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.match import Match
from schemas import ok, error
from schemas.match import MatchActionRequest
from routers.auth_deps import get_current_user
from services.match_service import get_discover_cards, process_match_action

router = APIRouter()


@router.get("/discover")
async def discover(
    count: int = Query(20, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cards = get_discover_cards(db, current_user.id, count)
    return ok({"cards": cards, "remaining": len(cards)})


@router.post("/{target_id}/action")
async def match_action(
    target_id: str,
    body: MatchActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if target_id == current_user.id:
        return error(10001, "不能对自己操作")

    # 检查目标用户是否存在
    target = db.query(User).filter(User.id == target_id).first()
    if not target:
        return error(10004, "用户不存在")

    # 检查是否已操作过
    existing = db.query(Match).filter(
        Match.userId == current_user.id,
        Match.targetId == target_id,
    ).first()
    if existing:
        return error(10005, "您已对该用户操作过")

    # 超级喜欢扣积分
    if body.action == "super" and current_user.points < 5:
        return error(10011, "积分不足，超级喜欢需要 5 积分")

    result = process_match_action(db, current_user.id, target_id, body.action)

    # super 扣积分
    if body.action == "super":
        current_user.points -= 5
        db.commit()

    return ok(result)


@router.get("/list")
async def my_matches(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    matches = db.query(Match).filter(
        Match.userId == current_user.id,
        Match.status.in_(["matched", "pending"]),
    ).all()

    list_data = []
    for m in matches:
        target = db.query(User).filter(User.id == m.targetId).first()
        list_data.append({
            "matchId": m.id,
            "status": m.status,
            "targetUser": {
                "id": target.id, "nickname": target.nickname, "avatar": target.avatar,
            } if target else None,
            "matchedAt": m.updatedAt.isoformat() if m.updatedAt else None,
        })

    return ok({"list": list_data})
