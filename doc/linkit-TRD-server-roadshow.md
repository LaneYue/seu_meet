# IFLand 服务端路演版 TRD（比赛快速开发）

> 目标：2 周内可 Demo。砍掉一切非必需，保留核心差异化。AI 友好。
>
> 🐍 Python 技术栈，轻量快速。

---

## 1. 技术栈（极简）

| 层 | 选型 | 理由 |
|----|------|------|
| 运行时 | **Python 3.12+** | 生态丰富，AI 代码生成质量高 |
| 框架 | **FastAPI** | 异步支持、自动 OpenAPI 文档、Pydantic 内置校验 |
| ASGI 服务器 | **uvicorn** | FastAPI 官方推荐，热重载开发 |
| 数据库 | **SQLite** (内置 sqlite3) | 零配置、单文件、无需 Docker |
| ORM | **SQLAlchemy 2.0** | Python 生态标准 ORM，异步支持 |
| 即时通讯 | **python-socketio** | 与前端 socket.io-client 完全兼容 |
| 校验 | **Pydantic v2** | FastAPI 原生集成，类型安全 |
| 跨域 | **FastAPI CORSMiddleware** | 内置，一行配置 |
| 密码哈希 | **passlib + bcrypt** | 标准安全实践 |

> **砍掉清单:** PostgreSQL → SQLite / Redis → 内存 dict / MinIO → 本地 static/ 目录 / 高德API → 纯坐标比较 / 定时任务 → asyncio.create_task / Docker → 直接 python main.py / Node.js/Express → FastAPI

---

## 2. 目录结构

```
server/
├── main.py                         # 入口：uvicorn 启动
├── app.py                          # FastAPI 应用创建 + 中间件配置
├── config.py                       # 环境变量、数据库 URL
├── database.py                     # SQLAlchemy engine + session
├── requirements.txt                # Python 依赖
├── models/
│   ├── __init__.py
│   ├── user.py                     # User 模型
│   ├── guide.py                    # Guide 模型
│   ├── purchase.py                 # Purchase 模型
│   ├── match.py                    # Match 模型
│   ├── question.py                 # Question / Answer / Rating 模型
│   └── chat.py                     # ChatSession / Message 模型
├── schemas/
│   ├── __init__.py
│   ├── auth.py                     # 注册/登录 请求响应 schema
│   ├── user.py                     # 用户资料 schema
│   ├── guide.py                    # 攻略 schema
│   ├── match.py                    # 匹配 schema
│   └── question.py                 # 破冰问答 schema
├── routers/
│   ├── __init__.py
│   ├── auth.py                     # POST /auth/register, /auth/login
│   ├── users.py                    # GET/PUT /users/*
│   ├── guides.py                   # GET/POST /guides/*
│   ├── match.py                    # GET/POST /match/*
│   ├── questions.py               # GET/POST /questions/icebreak/*
│   ├── chat.py                     # GET/POST /chat/* + WebSocket 事件
│   └── points.py                   # GET/POST /points/*
├── services/
│   ├── __init__.py
│   ├── auth_service.py             # 认证逻辑
│   ├── match_service.py            # 推荐算法 + 匹配状态机
│   ├── icebreak_service.py         # 破冰流程逻辑
│   └── points_service.py           # 积分逻辑
├── socketio/
│   ├── __init__.py
│   └── handlers.py                 # Socket.IO 事件处理 (chat:join/message/typing)
├── seed.py                         # 种子数据脚本
└── static/                         # 静态文件（图片、默认头像）
```

---

## 3. 核心代码骨架

### 3.0 应用入口 (app.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from config import settings
from database import engine, Base
from routers import auth, users, guides, match, questions, chat, points

# ── 创建数据库表 ──
Base.metadata.create_all(bind=engine)

# ── FastAPI 应用 ──
app = FastAPI(
    title="IFLand API",
    version="1.0.0",
    docs_url="/api/docs",          # Swagger UI
    redoc_url="/api/redoc",        # ReDoc
)

# ── CORS 配置 ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # Vite dev server
        "http://192.168.*.*:5173",        # 局域网手机测试
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 注册路由 ──
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(guides.router, prefix="/api/v1/guides", tags=["Guides"])
app.include_router(match.router, prefix="/api/v1/match", tags=["Match"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(points.router, prefix="/api/v1/points", tags=["Points"])

# ── Socket.IO ──
sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")
socket_app = socketio.ASGIApp(sio, app)
```

### 3.1 数据库配置 (database.py)

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

SQLALCHEMY_DATABASE_URL = "sqlite:///./ifland.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},  # SQLite 多线程兼容
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    """FastAPI 依赖注入：每个请求一个数据库会话"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### 3.2 统一响应格式 (schemas/__init__.py)

```python
from pydantic import BaseModel
from typing import Generic, TypeVar, Any

T = TypeVar("T")

class ApiResponse(BaseModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    data: T | None = None

class PaginatedData(BaseModel, Generic[T]):
    list: list[T]
    total: int
    page: int
    pageSize: int
    hasMore: bool

# 快速响应辅助函数
def ok(data: Any = None) -> dict:
    return {"code": 0, "message": "ok", "data": data}

def error(code: int, message: str) -> dict:
    return {"code": code, "message": message}
```

---

## 4. 数据模型（5 张核心表 — SQLAlchemy）

```python
# models/user.py
from sqlalchemy import Column, String, Integer, DateTime, JSON, func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    studentId = Column(String, unique=True, nullable=False, index=True)
    realName = Column(String, nullable=False)          # 后台可见，API 不返回
    idCardLast6 = Column(String, nullable=False)       # 后台可见，API 不返回
    passwordHash = Column(String, nullable=False)
    nickname = Column(String, unique=True, nullable=False)
    avatar = Column(String, nullable=True, default=None)
    college = Column(String, nullable=False)
    major = Column(String, nullable=False)
    grade = Column(String, nullable=False)
    campus = Column(String, nullable=False)  # jiulonghu / sipailou / dingjiaqiao
    gender = Column(String, nullable=False)  # male / female / other
    bio = Column(String, nullable=True)
    tags = Column(JSON, default=list)         # ["自习", "跑步", "王者"]
    creditScore = Column(Integer, default=70)
    points = Column(Integer, default=0)
    status = Column(String, default="active") # active / suspended / deleted
    createdAt = Column(DateTime, server_default=func.now())
```

```python
# models/guide.py
from sqlalchemy import Column, String, Integer, Float, JSON, DateTime, ForeignKey, func
from database import Base

class Guide(Base):
    __tablename__ = "guides"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    authorId = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    category = Column(String, nullable=False)  # date / food / study / outing / cross_campus / other
    coverImage = Column(String, nullable=True)
    images = Column(JSON, default=list)
    route = Column(JSON, default=dict)         # { points: [{lat, lng, name, desc, stayMin}] }
    budget = Column(Integer, nullable=True)
    suitableFor = Column(String, nullable=True) # solo / couple / group / any
    tags = Column(JSON, default=list)
    price = Column(Integer, default=0)         # 积分定价
    sales = Column(Integer, default=0)         # 销量
    avgRating = Column(Float, default=0.0)
    status = Column(String, default="published") # published / removed
    createdAt = Column(DateTime, server_default=func.now())
```

```python
# models/purchase.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from database import Base

class Purchase(Base):
    __tablename__ = "purchases"
    __table_args__ = (UniqueConstraint("buyerId", "guideId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    buyerId = Column(String, ForeignKey("users.id"), nullable=False)
    guideId = Column(String, ForeignKey("guides.id"), nullable=False)
    price = Column(Integer, nullable=False)
    refunded = Column(Boolean, default=False)
    createdAt = Column(DateTime, server_default=func.now())
```

```python
# models/match.py
from sqlalchemy import Column, String, DateTime, ForeignKey, func, UniqueConstraint
from database import Base

class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (UniqueConstraint("userId", "targetId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    targetId = Column(String, ForeignKey("users.id"), nullable=False)
    action = Column(String, nullable=False)   # left / right / super
    status = Column(String, default="pending") # pending / matched / rejected / expired
    createdAt = Column(DateTime, server_default=func.now())
```

```python
# models/question.py
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from database import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    category = Column(String, nullable=False)  # values / lifestyle / interest / fun / seu / expectation
    content = Column(String, nullable=False)
    active = Column(Boolean, default=True)

class Answer(Base):
    __tablename__ = "answers"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False, index=True)
    userId = Column(String, ForeignKey("users.id"), nullable=False)
    questionId = Column(String, ForeignKey("questions.id"), nullable=False)
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())

class Rating(Base):
    __tablename__ = "ratings"
    __table_args__ = (UniqueConstraint("matchId", "fromId"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False)
    fromId = Column(String, ForeignKey("users.id"), nullable=False)
    toId = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)    # 1-5
    createdAt = Column(DateTime, server_default=func.now())
```

```python
# models/chat.py
from sqlalchemy import Column, String, DateTime, ForeignKey, func, UniqueConstraint
from database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    __table_args__ = (UniqueConstraint("user1Id", "user2Id"),)

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    matchId = Column(String, nullable=False)
    user1Id = Column(String, ForeignKey("users.id"), nullable=False)
    user2Id = Column(String, ForeignKey("users.id"), nullable=False)
    stage = Column(String, default="ice_breaking")  # ice_breaking / normal / intimate
    createdAt = Column(DateTime, server_default=func.now())

class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    sessionId = Column(String, ForeignKey("chat_sessions.id"), nullable=False, index=True)
    senderId = Column(String, ForeignKey("users.id"), nullable=False)
    type = Column(String, default="text")      # text / image / voice / location / system
    content = Column(String, nullable=False)
    createdAt = Column(DateTime, server_default=func.now())
```

---

## 5. API 接口（只保留核心闭环）

### 5.0 统一规范

```
Base URL: /api/v1
Auth: Bearer <token>
Response: { code: 0, message: "ok", data: { } }
Error:   { code: 非0, message: "错误描述" }

Swagger 文档: http://localhost:8000/api/docs  （FastAPI 自动生成）
```

### 5.1 认证 (auth)

| 方法 | 路径 | 说明 | Router 文件 |
|------|------|------|------------|
| POST | `/auth/register` | 注册（学号+身份证+昵称+密码） | routers/auth.py |
| POST | `/auth/login` | 登录 → 返回 token | routers/auth.py |

> 砍掉: refresh/logout/verify-student — Demo 阶段不需要

**认证依赖注入（JWT 验证中间件）：**

```python
# 在 routers 层使用 FastAPI Depends
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_token(token)  # JWT 解码
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(status_code=401, detail={"code": 10002, "message": "请重新登录"})
    return user

# 路由中使用
@router.get("/users/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return ok(user_to_schema(current_user))
```

**JWT 工具函数（services/auth_service.py）：**

```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = "dev-secret-change-in-prod"
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 2

def create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": user_id, "exp": expire}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def hash_password(password: str) -> str:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.verify(plain, hashed)
```

**注册接口示例 (routers/auth.py)：**

```python
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.auth import RegisterRequest, LoginRequest
from schemas.user import UserOut, TokenOut
from services.auth_service import create_token, hash_password, verify_password
from models.user import User
from database import get_db
from schemas import ok, error

router = APIRouter()

@router.post("/register")
async def register(body: RegisterRequest, db: Session = Depends(get_db)):
    # 1. 校验学号唯一
    if db.query(User).filter(User.studentId == body.studentId).first():
        return error(10005, "该学号已注册")
    # 2. 校验昵称唯一
    if db.query(User).filter(User.nickname == body.nickname).first():
        return error(10005, "昵称已被占用")
    # 3. 创建用户
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
    # 4. 签发 token
    token = create_token(user.id)
    return ok({
        "user": user_to_schema(user),
        "token": {"accessToken": token, "expiresIn": 7200},
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
        "user": user_to_schema(user),
        "token": {"accessToken": token, "expiresIn": 7200},
    })
```

---

### 5.2 攻略市场 (guides)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/guides?category=&campus=&sort=&page=&pageSize=` | 列表（分页+筛选+排序） |
| GET | `/guides/{id}` | 详情（已购买返回全部，未购买返回截断） |
| POST | `/guides` | 发布 |
| POST | `/guides/{id}/purchase` | 购买（扣积分） |
| POST | `/guides/{id}/refund` | 退款（24h内） |

**发布 Request（Pydantic Schema）：**

```python
# schemas/guide.py
from pydantic import BaseModel, Field
from typing import Optional

class RoutePoint(BaseModel):
    lat: float = Field(..., ge=31.0, le=32.5)
    lng: float = Field(..., ge=118.0, le=119.5)
    name: str = Field(..., min_length=2, max_length=30)
    desc: Optional[str] = None
    stayMin: Optional[int] = None

class Route(BaseModel):
    points: list[RoutePoint] = Field(..., min_length=2, max_length=20)

class CreateGuideRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=40)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str  # date / food / study / outing / cross_campus / other
    coverImage: Optional[str] = None
    images: list[str] = []
    route: Route
    budget: Optional[int] = Field(None, ge=0, le=10000)
    suitableFor: Optional[str] = "any"  # solo / couple / group / any
    tags: list[str] = Field(default=[], max_length=5)
    price: int = Field(0, ge=0, le=50)
```

---

### 5.3 匹配发现 (match) ⭐核心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/match/discover?count=20` | **推荐算法** → 返回卡片列表 |
| POST | `/match/{targetId}/action` | 左滑/右滑/超喜 → 检测双向匹配 |

**推荐算法（纯规则，放在 services/match_service.py）：**

```python
# services/match_service.py
from sqlalchemy.orm import Session
from models.user import User
from models.match import Match
from datetime import datetime, timedelta
import random

def get_discover_cards(db: Session, current_user_id: str, count: int = 20) -> list[dict]:
    """纯规则推荐引擎"""

    # ── 第1步：构建排除池 ──
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)

    # 30天内操作过的用户 ID
    operated_ids = set(
        db.query(Match.targetId)
        .filter(Match.userId == current_user_id, Match.createdAt >= thirty_days_ago)
        .all()
    ) | {current_user_id}  # 排除自己

    # 已匹配的用户
    matched_ids = set(
        db.query(Match.targetId)
        .filter(Match.userId == current_user_id, Match.status == "matched")
        .all()
    )

    exclude_ids = operated_ids | matched_ids

    # ── 第2步：拉取候选 ──
    current_user = db.query(User).filter(User.id == current_user_id).first()
    candidates = (
        db.query(User)
        .filter(
            User.id.notin_(exclude_ids),
            User.gender != current_user.gender,  # 排除同性
            User.creditScore >= 70,
            User.status == "active",
        )
        .limit(count * 3)  # 多拉一些做排序
        .all()
    )

    # ── 第3步：计算推荐分 ──
    current_tags = set(current_user.tags or [])
    scored = []
    for c in candidates:
        common = current_tags & set(c.tags or [])
        score = (
            len(common) * 3                          # 共同标签 +3/个
            + (1 if c.campus != current_user.campus else 0) * 2  # 不同校区 +2
            + random.uniform(-1, 1)                  # 随机扰动
        )
        scored.append((score, c))

    # ── 第4步：排序取 Top N ──
    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "id": c.id,
            "nickname": c.nickname,
            "avatar": c.avatar,
            "college": c.college,
            "grade": c.grade,
            "campus": c.campus,
            "bio": c.bio,
            "tags": c.tags or [],
            "commonTags": list(current_tags & set(c.tags or [])),
        }
        for _, c in scored[:count]
    ]
```

**动作接口：双向匹配状态机**

```python
@router.post("/{targetId}/action")
async def match_action(
    targetId: str,
    body: MatchActionRequest,  # { action: "left" | "right" | "super" }
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    action = body.action

    # 记录当前用户的操作
    match = Match(userId=current_user.id, targetId=targetId, action=action)
    db.add(match)

    if action == "left":
        match.status = "rejected"
        db.commit()
        return ok({"matched": False, "action": "left"})

    # right / super → 查询对方是否也喜欢我
    reverse = (
        db.query(Match)
        .filter(
            Match.userId == targetId,
            Match.targetId == current_user.id,
            Match.action.in_(["right", "super"]),
        )
        .first()
    )

    if reverse:
        # 双向匹配成功
        match.status = "matched"
        reverse.status = "matched"
        # 创建 ChatSession
        session = ChatSession(
            matchId=match.id,
            user1Id=current_user.id,
            user2Id=targetId,
            stage="ice_breaking",
        )
        db.add(session)
        db.commit()

        target = db.query(User).filter(User.id == targetId).first()
        return ok({
            "matched": True,
            "matchId": match.id,
            "sessionId": session.id,
            "needIceBreak": True,
            "targetUser": {"id": target.id, "nickname": target.nickname, "avatar": target.avatar},
        })

    match.status = "pending"
    db.commit()
    return ok({"matched": False, "action": action})
```

---

### 5.4 破冰问答 (questions) ⭐核心差异化

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/questions/icebreak/{matchId}` | 获取随机 3 题 |
| POST | `/questions/icebreak/{matchId}/answer` | 提交答案 |
| GET | `/questions/icebreak/{matchId}/result` | 查看双方答案对比 |
| POST | `/questions/icebreak/{matchId}/rate` | 打分 (1-5) |

**破冰流程:**

```
匹配成功 → 拉 3 题 → 答题 → 双方提交 → 互看答案 → 盲评
  ├─ 双方≥3 → 解锁聊天 ✓
  └─ 一方<3 → 匹配解除 ✗
```

**获取破冰问题逻辑（services/icebreak_service.py）：**

```python
import random

def get_icebreak_questions(db: Session, match_id: str) -> list[dict]:
    """从问题池随机抽取 3 题，确保不同类别"""
    all_questions = db.query(Question).filter(Question.active == True).all()

    # 按类别分组
    by_category: dict[str, list[Question]] = {}
    for q in all_questions:
        by_category.setdefault(q.category, []).append(q)

    # 从不同类别各抽一题，直到凑满 3 题
    categories = list(by_category.keys())
    random.shuffle(categories)

    selected = []
    for cat in categories[:3]:
        q = random.choice(by_category[cat])
        selected.append({"id": q.id, "category": q.category, "content": q.content})

    return selected[:3]
```

---

### 5.5 聊天 (chat)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/chat/sessions` | 会话列表 |
| GET | `/chat/sessions/{id}/messages?before=&limit=30` | 历史消息 |
| POST | `/chat/sessions/{id}/messages` | 发送消息（REST 兜底） |

**WebSocket 事件 (python-socketio，兼容前端 socket.io-client)：**

```python
# socketio/handlers.py
import socketio

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

@sio.on("connect")
async def on_connect(sid, environ, auth):
    token = auth.get("token") if auth else None
    if not token:
        raise ConnectionRefusedError("未登录")
    # 验证 token，绑定 userId 到 sid
    payload = verify_token(token)
    await sio.save_session(sid, {"userId": payload["sub"]})

@sio.on("chat:join")
async def on_chat_join(sid, data):
    session_id = data["sessionId"]
    sio.enter_room(sid, f"chat:{session_id}")

@sio.on("chat:message")
async def on_chat_message(sid, data):
    session_id = data["sessionId"]
    content = data["content"]
    msg_type = data.get("type", "text")

    session = await sio.get_session(sid)
    sender_id = session["userId"]

    # 保存到数据库
    db = SessionLocal()
    msg = Message(sessionId=session_id, senderId=sender_id, type=msg_type, content=content)
    db.add(msg)
    db.commit()

    # 推送给房间内所有人（含自己）
    await sio.emit(
        "chat:message",
        {
            "sessionId": session_id,
            "message": {
                "id": msg.id,
                "senderId": sender_id,
                "type": msg_type,
                "content": content,
                "createdAt": msg.createdAt.isoformat(),
            },
        },
        room=f"chat:{session_id}",
    )

@sio.on("chat:typing")
async def on_chat_typing(sid, data):
    session = await sio.get_session(sid)
    await sio.emit(
        "chat:typing",
        {"sessionId": data["sessionId"], "userId": session["userId"]},
        room=f"chat:{data['sessionId']}",
        skip_sid=sid,
    )
```

---

### 5.6 用户资料 (users)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users/me` | 我的信息（不含 realName/idCardLast6） |
| PUT | `/users/me` | 更新基本资料 |
| GET | `/users/me/profile` | 我的详细资料卡 |
| PUT | `/users/me/profile` | 更新身高/MBTI/家乡/兴趣 |
| PUT | `/users/me/tags` | 更新标签（全量替换） |
| GET | `/users/{id}/profile` | 查看他人资料（需已解锁聊天） |

**Pydantic Schema 示例：**

```python
# schemas/user.py
from pydantic import BaseModel, Field
from typing import Optional

class UserOut(BaseModel):
    id: str
    nickname: str
    avatar: Optional[str] = None
    college: str
    major: str
    grade: str
    campus: str
    gender: str
    bio: Optional[str] = None
    tags: list[str] = []
    creditScore: int
    points: int
    status: str

    model_config = {"from_attributes": True}
    # 注意：realName 和 idCardLast6 永远不在 UserOut 中

class ProfileOut(BaseModel):
    photos: list[str] = []
    height: Optional[int] = None
    mbti: Optional[str] = None
    hometown: Optional[str] = None
    interests: list[str] = []

class UpdateTagsRequest(BaseModel):
    tags: list[str] = Field(..., max_length=20)
```

---

### 5.7 积分 (points)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/balance` | 余额 |
| GET | `/points/transactions` | 流水 |
| POST | `/points/checkin` | 每日签到 +5 |

---

## 6. 砍掉清单（比赛不开发）

| 砍掉 | 原因 |
|------|------|
| ❌ 打卡系统 + GPS | 开发量大，Demo 用不到 |
| ❌ 排行榜 | 第二周末尾再说 |
| ❌ 亲密度 | 同上 |
| ❌ 交叉验证评分 | 简化为盲评 + 双方互评即生效 |
| ❌ 图片上传 | Demo 用硬编码 URL |
| ❌ 校园网 IP 校验 | Demo 用不到 |
| ❌ 学工系统对接 | 假数据 |
| ❌ 内容审核 | Demo 跳过 |
| ❌ 拉黑 / 举报 | 比赛不演示 |
| ❌ 退款逻辑 | 简化为一键退款 |
| ❌ 定时任务 | 手动触发 / asyncio.create_task |
| ❌ PostgreSQL / Redis / MinIO / Docker | SQLite + 内存 + 本地目录即可 |

---

## 7. 种子数据

> **重要: Demo 必须有可展示的数据。** 预置 20 个假用户 + 5 篇攻略 + 20 道破冰题。

```python
# seed.py
from database import SessionLocal, engine, Base
from models.user import User
from models.guide import Guide
from models.question import Question
from services.auth_service import hash_password

Base.metadata.create_all(bind=engine)
db = SessionLocal()

# ── 种子用户 ──
users_data = [
    {"studentId": "213200001", "nickname": "三三", "college": "信息学院",
     "tags": ["自习", "跑步", "王者"], "campus": "jiulonghu", "gender": "male"},
    {"studentId": "213200002", "nickname": "思思", "college": "建筑学院",
     "tags": ["咖啡", "摄影", "CityWalk"], "campus": "sipailou", "gender": "female"},
    # ... 18 more
]
for u in users_data:
    db.add(User(
        studentId=u["studentId"],
        realName="测试用户",
        idCardLast6="123456",
        passwordHash=hash_password("123456"),
        nickname=u["nickname"],
        college=u["college"],
        major="测试专业",
        grade="2024",
        campus=u["campus"],
        gender=u["gender"],
        tags=u["tags"],
        creditScore=85,
        points=100,
    ))

# ── 种子攻略 ──
guides_data = [
    {"title": "九龙湖情侣一日游", "category": "date", "price": 5,
     "description": "从图书馆出发，先去橘园食堂...", "tags": ["散步", "美食"]},
    # ... 4 more
]
for g in guides_data:
    db.add(Guide(
        authorId="<seed-user-id>",
        title=g["title"],
        description=g["description"],
        category=g["category"],
        price=g["price"],
        tags=g["tags"],
        route={"points": [{"lat": 31.89, "lng": 118.81, "name": "图书馆"}]},
    ))

# ── 种子破冰题 ──
questions_data = [
    {"category": "values", "content": "你认为大学里最重要的是什么？"},
    {"category": "lifestyle", "content": "周末通常会怎么度过？"},
    # ... 18 more
]
for q in questions_data:
    db.add(Question(category=q["category"], content=q["content"]))

db.commit()
db.close()
print("Seed data created!")
```

---

## 8. 启动方式

```bash
# 安装依赖
pip install -r requirements.txt

# 初始化数据库 + 种子数据
python seed.py

# 启动开发服务器（热重载）
uvicorn app:socket_app --reload --host 0.0.0.0 --port 3000

# API 文档
# Swagger UI: http://localhost:3000/api/docs
# ReDoc:      http://localhost:3000/api/redoc
```

**Vite 代理配置（前端，不变）：**

```ts
// vite.config.ts
server: {
  proxy: {
    '/api': 'http://localhost:3000',
    '/socket.io': { target: 'http://localhost:3000', ws: true },
  }
}
```

---

## 9. requirements.txt

```
fastapi==0.115.*
uvicorn[standard]==0.32.*
sqlalchemy==2.0.*
python-socketio==5.11.*
passlib[bcrypt]==1.7.*
pyjwt==2.9.*
pydantic==2.10.*
python-multipart==0.0.*     # 表单数据支持
```

> 总计 8 个依赖。Python 生态极简起步。

---

## 10. 错误码速查

| code | message |
|------|---------|
| 0 | ok |
| 10001 | 参数校验失败 |
| 10002 | 未登录 / Token 过期 |
| 10003 | 无权限 |
| 10004 | 资源不存在 |
| 10005 | 资源冲突（重复操作） |
| 10010 | 信用分不足 |
| 10011 | 积分不足 |
| 10020 | 校园网验证失败 |
| 10021 | 认证信息不匹配 |
| 10030 | 匹配超时 |
| 10031 | 破冰问题未完成 |
| 10032 | 匹配已失效 |
| 10040 | 聊天未解锁 |

---

## 11. 开发顺序（10 天计划）

| 天 | 后端（Python） | 前端（React） |
|----|---------------|---------------|
| Day 1 | FastAPI 项目骨架 + SQLAlchemy 模型 + seed | Vite + React + Tailwind + MUI，PhoneFrame + Router + 3Tab 骨架 |
| Day 2 | auth 模块 (register/login + JWT) | 登录/注册页面 |
| Day 3 | users 模块 (资料 CRUD) | Tab1 广场（PlazaTabs + 多分区卡片） |
| Day 4 | guides 模块 (CRUD+购买) | 发现页 MatchCard (framer-motion 拖拽) |
| Day 5 | match 模块 (推荐算法+动作状态机) | 破冰答题+审核+结果页 |
| Day 6 | questions 模块 (破冰完整流程) | Tab3 会话列表+QQ风格聊天+Socket |
| Day 7 | chat (REST + python-socketio) | 个人资料页 + 破冰问题设置 |
| Day 8 | points 模块 (余额+签到) | 排行榜+积分签到+空状态+骨架屏 |
| Day 9-10 | 联调+修复+种子数据优化 | 联调+桌面手机框美化+Demo预演 |
