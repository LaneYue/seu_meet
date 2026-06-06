"""成就路由 — GET/POST /achievements/*"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.achievement import Achievement, UserAchievement
from models.ledger import RedeemOrder
from schemas import ok, error
from routers.auth_deps import get_current_user
from services.points_service import deduct_points, add_points

router = APIRouter()

REDEEM_COST = 50


def _achievement_out(a: Achievement, unlocked: bool, unlocked_at=None) -> dict:
    return {
        "code": a.code,
        "name": a.name,
        "campus": a.campus,
        "category": a.category,
        "conditionDesc": a.conditionDesc,
        "humorDesc": a.humorDesc,
        "imagePath": a.imagePath,
        "unlocked": unlocked,
        "unlockedAt": unlocked_at.isoformat() if unlocked_at else None,
    }


@router.get("")
async def list_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    achievements = db.query(Achievement).filter(Achievement.isHidden == False).order_by(Achievement.sortOrder).all()

    unlocked_map = {
        ua.achievementCode: ua.unlockedAt
        for ua in db.query(UserAchievement).filter(UserAchievement.userId == current_user.id).all()
    }

    list_data = [_achievement_out(a, a.code in unlocked_map, unlocked_map.get(a.code)) for a in achievements]

    return ok({
        "list": list_data,
        "unlockedCount": len(unlocked_map),
        "totalCount": len(list_data),
    })


@router.get("/me")
async def my_achievements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    unlocked = db.query(UserAchievement).filter(UserAchievement.userId == current_user.id).all()
    codes = {ua.achievementCode: ua.unlockedAt for ua in unlocked}

    achievements = db.query(Achievement).filter(Achievement.code.in_(list(codes.keys()))).all()
    list_data = [_achievement_out(a, True, codes[a.code]) for a in achievements]

    return ok({"list": list_data, "count": len(list_data)})


@router.post("/{code}/unlock")
async def unlock_achievement(
    code: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    achievement = db.query(Achievement).filter(Achievement.code == code).first()
    if not achievement:
        return error(10004, "成就不存在")

    existing = db.query(UserAchievement).filter(
        UserAchievement.userId == current_user.id,
        UserAchievement.achievementCode == code,
    ).first()

    if existing:
        return ok({
            "code": code,
            "name": achievement.name,
            "alreadyUnlocked": True,
            "unlockedAt": existing.unlockedAt.isoformat() if existing.unlockedAt else None,
            "pointsAwarded": 0,
        })

    # CH01 东南精神继承者：需解锁所有 SH+JH+DH 成就
    if code == "CH01":
        culture_codes = ["SH01", "SH02", "SH03", "JH01", "JH02", "JH03", "DH01", "DH02"]
        unlocked_count = db.query(UserAchievement).filter(
            UserAchievement.userId == current_user.id,
            UserAchievement.achievementCode.in_(culture_codes),
        ).count()
        if unlocked_count < len(culture_codes):
            return error(10003, f"需先解锁所有文化类成就，当前已解锁 {unlocked_count}/{len(culture_codes)}")

    ua = UserAchievement(userId=current_user.id, achievementCode=code)
    db.add(ua)
    db.flush()

    add_points(db, current_user.id, 5, f"解锁成就：{achievement.name}", "achievement", code)
    db.commit()
    db.refresh(ua)

    return ok({
        "code": code,
        "name": achievement.name,
        "alreadyUnlocked": False,
        "unlockedAt": ua.unlockedAt.isoformat() if ua.unlockedAt else None,
        "pointsAwarded": 5,
    })


@router.post("/check")
async def check_achievements(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """根据事件自动检查并解锁成就"""
    event = body.get("event", "")
    context = body.get("context", {})

    EVENT_MAP = {
        "register": ["JH03"],
        "checkin_7days": ["SL01"],
        "route_complete_jiulonghu": ["JM01"],
        "route_complete_all": ["JM01", "JM02"],
        "match_on_bus": ["CI02"],
        "partner_count_20": ["CI03"],
    }

    codes_to_check = EVENT_MAP.get(event, [])
    new_unlocked = []

    for code in codes_to_check:
        achievement = db.query(Achievement).filter(Achievement.code == code).first()
        if not achievement:
            continue
        existing = db.query(UserAchievement).filter(
            UserAchievement.userId == current_user.id,
            UserAchievement.achievementCode == code,
        ).first()
        if existing:
            continue
        ua = UserAchievement(userId=current_user.id, achievementCode=code)
        db.add(ua)
        db.flush()
        add_points(db, current_user.id, 5, f"解锁成就：{achievement.name}", "achievement", code)
        new_unlocked.append({"code": code, "name": achievement.name})

    if new_unlocked:
        db.commit()

    return ok({"newUnlocked": new_unlocked})


@router.post("/{code}/redeem")
async def redeem_achievement(
    code: str,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 检查成就已解锁
    ua = db.query(UserAchievement).filter(
        UserAchievement.userId == current_user.id,
        UserAchievement.achievementCode == code,
    ).first()
    if not ua:
        return error(10003, "该成就尚未解锁，无法兑换")

    # 检查是否已兑换过
    existing_order = db.query(RedeemOrder).filter(
        RedeemOrder.userId == current_user.id,
        RedeemOrder.achievementCode == code,
    ).first()
    if existing_order:
        return error(10005, "该成就吧唧已申请兑换，请勿重复提交")

    dorm_building = body.get("dormBuilding", "").strip()
    dorm_room = body.get("dormRoom", "").strip()
    if not dorm_building or not dorm_room:
        return error(10001, "请填写完整的宿舍信息")

    # 扣积分
    ok_flag = deduct_points(db, current_user.id, REDEEM_COST, f"兑换吧唧：{code}", "redeem", code)
    if not ok_flag:
        return error(10011, f"积分不足，兑换需要 {REDEEM_COST} 积分")

    order = RedeemOrder(
        userId=current_user.id,
        achievementCode=code,
        cost=REDEEM_COST,
        dormBuilding=dorm_building,
        dormRoom=dorm_room,
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    from models.user import User as UserModel
    user = db.query(UserModel).filter(UserModel.id == current_user.id).first()

    return ok({
        "orderId": order.id,
        "achievementCode": code,
        "cost": REDEEM_COST,
        "balanceAfter": user.points if user else 0,
        "status": order.status,
    })


@router.get("/redeem/orders")
async def redeem_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    orders = db.query(RedeemOrder).filter(
        RedeemOrder.userId == current_user.id
    ).order_by(RedeemOrder.createdAt.desc()).all()

    achievements = {
        a.code: a.name
        for a in db.query(Achievement).all()
    }

    return ok({
        "list": [
            {
                "orderId": o.id,
                "achievementCode": o.achievementCode,
                "achievementName": achievements.get(o.achievementCode, o.achievementCode),
                "status": o.status,
                "createdAt": o.createdAt.isoformat() if o.createdAt else None,
            }
            for o in orders
        ]
    })
