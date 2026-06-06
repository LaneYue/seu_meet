"""广场路由 — GET/POST /plaza/posts"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
from models.user import User
from models.plaza import PlazaPost, PlazaParticipant
from schemas import ok, error
from schemas.plaza import CreatePlazaPostRequest, PlazaActionRequest
from routers.auth_deps import get_current_user

router = APIRouter()


@router.get("/posts")
async def list_posts(
    category: str = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=50),
    db: Session = Depends(get_db),
):
    query = db.query(PlazaPost).order_by(desc(PlazaPost.createdAt))

    if category:
        query = query.filter(PlazaPost.category == category)

    total = query.count()
    posts = query.offset((page - 1) * pageSize).limit(pageSize).all()

    list_data = []
    for p in posts:
        author = db.query(User).filter(User.id == p.authorId).first()
        list_data.append({
            "id": p.id,
            "title": p.title,
            "category": p.category,
            "status": p.status,
            "time": p.time,
            "place": p.place,
            "joined": p.joined,
            "total": p.capacity,
            "note": p.note,
            "author": {
                "id": author.id if author else "",
                "nickname": author.nickname if author else "未知",
                "avatar": author.avatar,
            },
            "createdAt": p.createdAt.isoformat() if p.createdAt else None,
        })

    return ok({
        "list": list_data,
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "hasMore": (page * pageSize) < total,
    })


@router.post("/posts")
async def create_post(
    body: CreatePlazaPostRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = PlazaPost(
        authorId=current_user.id,
        title=body.title,
        category=body.category,
        time=body.time,
        place=body.place,
        capacity=body.capacity,
        note=body.note,
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    # 自动加入自己的帖子
    db.add(PlazaParticipant(postId=post.id, userId=current_user.id, status="joined"))
    db.commit()

    # 发帖 +1 积分
    current_user.points += 1
    db.commit()

    author = db.query(User).filter(User.id == post.authorId).first()
    return ok({
        "id": post.id,
        "title": post.title,
        "category": post.category,
        "status": post.status,
        "time": post.time,
        "place": post.place,
        "joined": post.joined,
        "total": post.capacity,
        "note": post.note,
        "author": {
            "id": author.id, "nickname": author.nickname, "avatar": author.avatar,
        },
        "createdAt": post.createdAt.isoformat() if post.createdAt else None,
    })


@router.post("/posts/{post_id}/action")
async def post_action(
    post_id: str,
    body: PlazaActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    post = db.query(PlazaPost).filter(PlazaPost.id == post_id).first()
    if not post:
        return error(10004, "帖子不存在")

    if post.authorId == current_user.id:
        return error(10005, "不能加入自己发布的帖子")

    # 检查是否已加入
    existing = db.query(PlazaParticipant).filter(
        PlazaParticipant.postId == post_id,
        PlazaParticipant.userId == current_user.id,
    ).first()
    if existing:
        return error(10005, "你已加入此帖子")

    # 检查是否满员
    if post.joined >= post.capacity:
        return error(10011, "帖子已满员")

    status = "joined" if body.action == "join" else "requested"
    db.add(PlazaParticipant(postId=post_id, userId=current_user.id, status=status))
    post.joined += 1
    db.commit()

    return ok({
        "postId": post_id,
        "action": body.action,
        "joined": post.joined,
        "total": post.capacity,
    })
