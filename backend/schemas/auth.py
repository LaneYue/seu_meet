"""认证模块 Schema"""

from pydantic import BaseModel, Field


class RegisterRequest(BaseModel):
    studentId: str = Field(..., min_length=9, max_length=9, pattern=r"^\d{9}$")
    realName: str = Field(..., min_length=2, max_length=10)
    idCardLast6: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")
    password: str = Field(..., min_length=6, max_length=32)
    nickname: str = Field(..., min_length=2, max_length=12)
    college: str = Field(..., min_length=2, max_length=50)
    major: str = Field(..., min_length=2, max_length=50)
    grade: str = Field(..., min_length=4, max_length=4)
    campus: str = Field(..., pattern=r"^(jiulonghu|sipailou|dingjiaqiao)$")
    gender: str = Field(..., pattern=r"^(male|female|other)$")


class LoginRequest(BaseModel):
    studentId: str = Field(..., min_length=9, max_length=9)
    password: str = Field(..., min_length=1, max_length=32)
