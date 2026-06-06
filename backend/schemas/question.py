"""破冰问答模块 Schema"""

from pydantic import BaseModel, Field
from typing import Optional


class AnswerItem(BaseModel):
    questionId: str
    content: str = Field(..., min_length=10, max_length=500)


class SubmitAnswersRequest(BaseModel):
    answers: list[AnswerItem] = Field(..., min_length=3, max_length=3)


class RateRequest(BaseModel):
    score: int = Field(..., ge=1, le=5)
