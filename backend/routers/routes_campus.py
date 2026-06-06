"""路线路由 — GET /routes, GET /routes/{id}, POST /routes/{id}/checkin, GET /routes/badges/me"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.route import CampusRoute, RouteStep, RouteCheckin, Badge
from schemas import ok, error
from schemas.route import CheckinRequest
from routers.auth_deps import get_current_user, get_optional_user

router = APIRouter()


@router.get("/routes")
async def list_routes(
    campus: str = Query(None),
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    query = db.query(CampusRoute).filter(CampusRoute.status == "published")

    if campus:
        query = query.filter(CampusRoute.campus == campus)

    routes = query.order_by(CampusRoute.participantCount.desc()).all()

    list_data = []
    for r in routes:
        user_progress = 0
        if current_user:
            user_progress = db.query(RouteCheckin).filter(
                RouteCheckin.userId == current_user.id,
                RouteCheckin.routeId == r.id,
            ).count()

        list_data.append({
            "id": r.id,
            "title": r.title,
            "badge": r.badge,
            "campus": r.campus,
            "duration": r.duration,
            "difficulty": r.difficulty,
            "participantCount": r.participantCount,
            "nodeCount": r.nodeCount,
            "userProgress": user_progress,
            "coverImage": r.coverImage,
            "intro": r.intro,
            "tags": r.tags or [],
        })

    return ok({"list": list_data})


@router.get("/routes/{route_id}")
async def get_route_detail(
    route_id: str,
    current_user: User = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    route = db.query(CampusRoute).filter(CampusRoute.id == route_id).first()
    if not route:
        return error(10004, "路线不存在")

    steps = db.query(RouteStep).filter(
        RouteStep.routeId == route_id,
    ).order_by(RouteStep.sortOrder).all()

    completed_step_ids: set[str] = set()
    user_progress = 0
    if current_user:
        checkins = db.query(RouteCheckin).filter(
            RouteCheckin.userId == current_user.id,
            RouteCheckin.routeId == route_id,
        ).all()
        completed_step_ids = {c.stepId for c in checkins}
        user_progress = len(completed_step_ids)

    step_list = []
    for i, s in enumerate(steps):
        if s.id in completed_step_ids:
            st = "done"
        elif len(completed_step_ids) > 0 and i == len(completed_step_ids):
            st = "in_progress"
        else:
            st = "pending"
        step_list.append({
            "id": s.id,
            "title": s.title,
            "desc": s.desc,
            "method": s.method,
            "status": st,
        })

    return ok({
        "id": route.id,
        "title": route.title,
        "badge": route.badge,
        "campus": route.campus,
        "duration": route.duration,
        "difficulty": route.difficulty,
        "participantCount": route.participantCount,
        "nodeCount": route.nodeCount,
        "userProgress": user_progress,
        "coverImage": route.coverImage,
        "intro": route.intro,
        "tags": route.tags or [],
        "steps": step_list,
    })


@router.post("/routes/{route_id}/checkin")
async def route_checkin(
    route_id: str,
    body: CheckinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    step_id = body.stepId

    route = db.query(CampusRoute).filter(CampusRoute.id == route_id).first()
    if not route:
        return error(10004, "路线不存在")

    step = db.query(RouteStep).filter(RouteStep.id == step_id, RouteStep.routeId == route_id).first()
    if not step:
        return error(10004, "节点不存在")

    existing = db.query(RouteCheckin).filter(
        RouteCheckin.userId == current_user.id,
        RouteCheckin.stepId == step_id,
    ).first()
    if existing:
        return error(10005, "已打卡此节点")

    db.add(RouteCheckin(userId=current_user.id, routeId=route_id, stepId=step_id))
    route.participantCount += 1

    # 积分 +2
    current_user.points += 2
    db.commit()

    progress = db.query(RouteCheckin).filter(
        RouteCheckin.userId == current_user.id,
        RouteCheckin.routeId == route_id,
    ).count()

    # 完成全部节点 +10 积分 + 徽章
    points = 2
    if progress >= route.nodeCount:
        current_user.points += 10
        points = 12
        db.add(Badge(
            userId=current_user.id,
            name=f"{route.title}探索者",
            icon="Compass",
            level="已获得",
            unlockedAt=db.func.now(),
        ))
        db.commit()

    return ok({
        "stepId": step_id,
        "userProgress": progress,
        "pointsAwarded": points,
        "balanceAfter": current_user.points,
    })


@router.get("/routes/badges/me")
async def my_badges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    badges = db.query(Badge).filter(Badge.userId == current_user.id).all()

    return ok({
        "list": [
            {
                "id": b.id,
                "name": b.name,
                "level": b.level,
                "icon": b.icon,
                "unlockedAt": b.unlockedAt.isoformat() if b.unlockedAt else None,
            }
            for b in badges
        ],
    })
