"""应用入口 — 开发服务器启动"""

import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app:socket_app",
        host="0.0.0.0",
        port=3100,
        reload=True,
        log_level="info",
    )
