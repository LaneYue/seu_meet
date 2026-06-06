"""FastAPI 应用创建 + 中间件 + 路由注册 + Socket.IO 挂载"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import socketio as sio_module

from config import settings
from database import engine, Base
from ws.handlers import sio
from routers import auth, users, guides, match, questions, chat, points

# ── 创建数据库表 ──
Base.metadata.create_all(bind=engine)


# ── FastAPI 应用 ──
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# ── CORS ──
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 全局异常处理 ──
@app.exception_handler(Exception)
async def global_exception_handler(_request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": 10999, "message": f"服务器内部错误: {str(exc)}"},
    )

# ── 健康检查 ──
@app.get("/api/health")
async def health():
    return {"status": "ok", "version": settings.VERSION}

# ── 注册 REST 路由 ──
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(guides.router, prefix="/api/v1/guides", tags=["Guides"])
app.include_router(match.router, prefix="/api/v1/match", tags=["Match"])
app.include_router(questions.router, prefix="/api/v1/questions", tags=["Questions"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Chat"])
app.include_router(points.router, prefix="/api/v1/points", tags=["Points"])

# ── 挂载 Socket.IO ──
socket_app = sio_module.ASGIApp(sio, app)
