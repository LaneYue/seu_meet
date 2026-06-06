"""攻略模块 Schema"""

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
    category: str = Field(..., pattern=r"^(date|food|study|outing|cross_campus|activity|other)$")
    coverImage: Optional[str] = None
    images: list[str] = Field(default=[], max_length=9)
    route: Route
    budget: Optional[int] = Field(None, ge=0, le=10000)
    suitableFor: Optional[str] = Field("any", pattern=r"^(solo|couple|group|any)$")
    tags: list[str] = Field(default=[], max_length=5)
    price: int = Field(0, ge=0, le=50)


class UpdateGuideRequest(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=40)
    description: Optional[str] = Field(None, min_length=10, max_length=2000)
    category: Optional[str] = None
    coverImage: Optional[str] = None
    images: Optional[list[str]] = None
    route: Optional[Route] = None
    budget: Optional[int] = None
    suitableFor: Optional[str] = None
    tags: Optional[list[str]] = None
    price: Optional[int] = Field(None, ge=0, le=50)


class GuideListQuery(BaseModel):
    category: Optional[str] = None
    campus: Optional[str] = None
    tags: Optional[str] = None
    sort: Optional[str] = "popular"
    search: Optional[str] = None
    page: int = Field(1, ge=1)
    pageSize: int = Field(20, ge=1, le=50)
