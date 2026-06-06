"""广场路由 — GET/POST /plaza/*"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models.user import User
from models.plaza import PlazaPost, PlazaJoin
from schemas import ok, error
from routers.auth_deps import get_current_user
from services.points_service import add_points

router = APIRouter()

CATEGORY_TONE = {
    "study": "green",
    "sport": "purple",
    "life": "orange",
    "interest": "blue",
}

CATEGORY_STATUS = {
    "recruiting": "招募中",
    "active": "进行中",
    "closed": "已结束",
}


def _post_out(post: PlazaPost, author: User) -> dict:
    return {
        "id": post.id,
        "title": post.title,
        "category": post.category,
        "status": CATEGORY_STATUS.get(post.status, post.status),
        "time": post.time,
        "place": post.place,
        "joined": post.joinedCount,
        "total": post.capacity,
        "note": post.note,
        "tone": CATEGORY_TONE.get(post.category, "green"),
        "author": {
            "id": author.id if author else "",
            "nickname": author.nickname if author else "未知",
            "avatar": author.avatar if author else None,
        },
        "createdAt": post.createdAt.isoformat() if post.createdAt else None,
    }


@router.get("/posts")
async def list_posts(
    category: str = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(PlazaPost).filter(PlazaPost.status != "closed")

    if category:
        query = query.filter(PlazaPost.category == category)

    query = query.order_by(desc(PlazaPost.createdAt))
    total = query.count()
    posts = query.offset((page - 1) * pageSize).limit(pageSize).all()

    author_ids = list({p.authorId for p in posts})
    authors = {u.id: u for u in db.query(User).filter(User.id.in_(author_ids)).all()}

    return ok({
        "list": [_post_out(p, authors.get(p.authorId)) for p in posts],
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "hasMore": (page * pageSize) < total,
    })


@router.post("/posts")
async def create_post(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    title = body.get("title", "").strip()
    category = body.get("category", "")
    time = body.get("time", "").strip()
    place = body.get("place", "").strip()
    capacity = body.get("capacity", 0)
    note = body.get("note", "").strip()

    if not title or not time or not place:
        return error(10001, "标题、时间、地点均为必填项")

    if category not in ("study", "sport", "life", "interest"):
        return error(10001, "分类不合法")

    if not (2 <= capacity <= 20):
        return error(10001, "人数范围 2–20")

    post = PlazaPost(
        authorId=current_user.id,
        title=title,
        category=category,
        time=time,
        place=place,
        capacity=capacity,
        note=note,
        joinedCount=1,
    )
    db.add(post)
    db.flush()

    # 发帖 +1 积分
    add_points(db, current_user.id, 1, "发布广场帖子", "plaza", post.id)
    db.commit()
    db.refresh(post)

    return ok(_post_out(post, current_user))


@router.post("/posts/{post_id}/action")
async def post_action(
    post_id: str,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(PlazaPost).filter(PlazaPost.id == post_id).first()
    if not post:
        return error(10004, "帖子不存在")

    if post.authorId == current_user.id:
        return error(10001, "不能操作自己发布的帖子")

    if post.status == "closed":
        return error(10001, "帖子已关闭")

    action = body.get("action", "join")
    if action not in ("join", "request"):
        return error(10001, "操作类型不合法")

    # 检查是否已操作
    existing = db.query(PlazaJoin).filter(
        PlazaJoin.postId == post_id,
        PlazaJoin.userId == current_user.id,
    ).first()
    if existing:
        return error(10005, "你已加入或申请过此帖子")

    if action == "join" and post.joinedCount >= post.capacity:
        return error(10011, "已满员，无法加入")

    join = PlazaJoin(postId=post_id, userId=current_user.id, action=action)
    db.add(join)

    if action == "join":
        post.joinedCount += 1
        if post.joinedCount >= post.capacity:
            post.status = "active"

    db.commit()

    return ok({"postId": post_id, "action": action, "joined": post.joinedCount, "total": post.capacity})
