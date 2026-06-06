"""应用全局配置"""

import os


class Settings:
    APP_NAME: str = "IFLand API"
    VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-in-prod")
    ALGORITHM: str = "HS256"
    TOKEN_EXPIRE_HOURS: int = 24

    # 数据库
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./ifland.db")

    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:*",
    ]


settings = Settings()
