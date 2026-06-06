"""FastAPI 认证依赖 — Demo 模式：无 token 时自动使用演示用户"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from services.auth_service import verify_token

security = HTTPBearer(auto_error=False)

# 演示用户学号 — seed.py 中预置
DEMO_STUDENT_ID = "213200000"


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """从 Bearer token 中解析当前用户。无 token 时自动使用演示用户。"""
    if credentials:
        try:
            payload = verify_token(credentials.credentials)
            user = db.query(User).filter(User.id == payload["sub"]).first()
            if user:
                return user
        except Exception:
            pass  # token 无效 → fall through to demo

    # 演示模式：无 token 或 token 无效 → 使用演示用户
    demo = db.query(User).filter(User.studentId == DEMO_STUDENT_ID).first()
    if demo:
        return demo

    # 极端情况：演示用户也不存在（未 seed）
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail={"code": 10002, "message": "请先运行 python seed.py 初始化数据"},
    )


async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User | None:
    """可选认证：有 token 则解析用户，无 token 则不报错"""
    if not credentials:
        return None
    try:
        payload = verify_token(credentials.credentials)
        return db.query(User).filter(User.id == payload["sub"]).first()
    except Exception:
        return None
