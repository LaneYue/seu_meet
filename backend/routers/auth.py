"""认证路由 — POST /auth/register, /auth/login"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas import ok, error
from schemas.auth import RegisterRequest, LoginRequest
from schemas.user import UserOut
from services.auth_service import hash_password, verify_password, create_token

router = APIRouter()


def _user_out(user: User) -> dict:
    """将 User 模型转为安全的输出 dict"""
    return {
        "id": user.id,
        "studentId": user.studentId,
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


@router.post("/register")
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # 学号唯一性
    if db.query(User).filter(User.studentId == body.studentId).first():
        return error(10005, "该学号已注册")

    # 昵称唯一性
    if db.query(User).filter(User.nickname == body.nickname).first():
        return error(10005, "昵称已被占用")

    # 创建用户
    user = User(
        studentId=body.studentId,
        realName=body.realName,
        idCardLast6=body.idCardLast6,
        passwordHash=hash_password(body.password),
        nickname=body.nickname,
        college=body.college,
        major=body.major,
        grade=body.grade,
        campus=body.campus,
        gender=body.gender,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_token(user.id)
    return ok({
        "user": _user_out(user),
        "token": {"accessToken": token, "expiresIn": 86400},
    })


@router.post("/login")
async def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.studentId == body.studentId).first()
    if not user:
        return error(10004, "学号未注册")

    if not verify_password(body.password, user.passwordHash):
        return error(10021, "密码错误")

    token = create_token(user.id)
    return ok({
        "user": _user_out(user),
        "token": {"accessToken": token, "expiresIn": 86400},
    })
