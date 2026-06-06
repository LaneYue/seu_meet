"""用户模块 Schema"""

from pydantic import BaseModel, Field
from typing import Optional


class UserOut(BaseModel):
    id: str
    studentId: str
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


class UserCard(BaseModel):
    """发现页卡片信息 — 不含敏感字段"""
    id: str
    nickname: str
    avatar: Optional[str] = None
    college: str
    grade: str
    campus: str
    bio: Optional[str] = None
    tags: list[str] = []
    commonTags: list[str] = []


class UpdateUserRequest(BaseModel):
    nickname: Optional[str] = Field(None, min_length=2, max_length=12)
    avatar: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=200)
    gender: Optional[str] = None


class ProfileOut(BaseModel):
    id: str
    userId: str
    photos: list[str] = []
    height: Optional[int] = None
    mbti: Optional[str] = None
    hometown: Optional[str] = None
    interests: list[str] = []


class UpdateProfileRequest(BaseModel):
    photos: Optional[list[str]] = None
    height: Optional[int] = Field(None, ge=100, le=250)
    mbti: Optional[str] = None
    hometown: Optional[str] = Field(None, max_length=20)
    interests: Optional[list[str]] = None


class UpdateTagsRequest(BaseModel):
    tags: list[str] = Field(..., max_length=20)
