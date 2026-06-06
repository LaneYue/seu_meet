"""匹配模块 Schema"""

from pydantic import BaseModel, Field
from typing import Optional, Literal


class MatchActionRequest(BaseModel):
    action: Literal["left", "right", "super"]


class DiscoverQuery(BaseModel):
    count: int = Field(20, ge=1, le=20)
