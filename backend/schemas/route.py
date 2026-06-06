"""路线模块 Schema"""

from pydantic import BaseModel, Field
from typing import Optional


class CheckinRequest(BaseModel):
    stepId: str
