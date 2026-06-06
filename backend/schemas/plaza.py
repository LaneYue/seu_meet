"""广场模块 Schema"""

from pydantic import BaseModel, Field
from typing import Optional


class CreatePlazaPostRequest(BaseModel):
    title: str = Field(..., min_length=2, max_length=40)
    category: str = Field(..., pattern=r"^(study|sport|life|interest)$")
    time: str = Field(..., max_length=50)
    place: str = Field(..., max_length=100)
    capacity: int = Field(..., ge=2, le=20)
    note: Optional[str] = Field(None, max_length=500)


class PlazaActionRequest(BaseModel):
    action: str = Field(..., pattern=r"^(join|request)$")
