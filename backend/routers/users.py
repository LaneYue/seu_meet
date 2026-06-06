"""用户路由 — GET/PUT /users/*"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.chat import ChatSession
from schemas import ok, error
from schemas.user import UpdateUserRequest, UpdateTagsRequest
from routers.auth_deps import get_current_user

router = APIRouter()


def _user_public(user: User) -> dict:
    return {
        "id": user.id,
        "nickname": user.nickname,
        "avatar": user.avatar,
        "college": user.college,
        "major": user.major,
        "grade": user.grade,
        "campus": user.campus,
        "gender": user.gender,
        "bio": user.bio,
        "tags": user.tags or [],
        "creditScore": user.creditScore,
        "points": user.points,
        "status": user.status,
        "createdAt": user.createdAt.isoformat() if user.createdAt else None,
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return ok(_user_public(current_user))


@router.put("/me")
async def update_me(
    body: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if body.nickname and body.nickname != current_user.nickname:
        if db.query(User).filter(User.nickname == body.nickname).first():
            return error(10005, "昵称已被占用")
        current_user.nickname = body.nickname

    if body.avatar is not None:
        current_user.avatar = body.avatar
    if body.bio is not None:
        current_user.bio = body.bio
    if body.gender is not None:
        current_user.gender = body.gender

    db.commit()
    db.refresh(current_user)
    return ok(_user_public(current_user))


@router.get("/me/profile")
async def get_my_profile(current_user: User = Depends(get_current_user)):
    # 目前 profile 数据存储在 User 表内，后续可扩展 profile 表
    return ok({
        "id": current_user.id,
        "userId": current_user.id,
        "photos": [],
        "height": None,
        "mbti": None,
        "hometown": None,
        "interests": [],
    })


@router.put("/me/profile")
async def update_my_profile(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 简化更新，后续可扩展
    return ok({"updated": True})


@router.put("/me/tags")
async def update_tags(
    body: UpdateTagsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.tags = body.tags
    db.commit()
    return ok({"tags": current_user.tags})


@router.get("/{user_id}/card")
async def get_user_card(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """发现页卡片信息"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return error(10004, "用户不存在")

    current_tags = set(current_user.tags or [])
    target_tags = set(user.tags or [])

    return ok({
        "id": user.id,
        "nickname": user.nickname,
        "avatar": user.avatar,
        "college": user.college,
        "major": user.major,
        "grade": user.grade,
        "campus": user.campus,
        "bio": user.bio,
        "tags": user.tags or [],
        "commonTags": list(current_tags & target_tags),
        "commonTagsCount": len(current_tags & target_tags),
        "creditScore": user.creditScore,
    })


@router.get("/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """查看他人完整资料（需已解锁聊天）"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return error(10004, "用户不存在")

    # 检查是否已解锁聊天
    has_chat = db.query(ChatSession).filter(
        (
            (ChatSession.user1Id == current_user.id) & (ChatSession.user2Id == user_id)
        ) | (
            (ChatSession.user1Id == user_id) & (ChatSession.user2Id == current_user.id)
        )
    ).first()

    if not has_chat:
        return error(10003, "请先与对方解锁聊天后再查看完整资料")

    return ok(_user_public(user))
