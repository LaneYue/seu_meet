"""破冰问答路由 — GET/POST /questions/icebreak/*"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from schemas import ok, error
from schemas.question import SubmitAnswersRequest, RateRequest
from routers.auth_deps import get_current_user
from services.icebreak_service import (
    get_icebreak_questions,
    submit_answers,
    get_result,
    process_rating,
)

router = APIRouter()


@router.get("/icebreak/{match_id}")
async def get_questions(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    questions = get_icebreak_questions(db, match_id)
    if questions is None:
        return error(10030, "匹配不存在或已失效")

    return ok({
        "matchId": match_id,
        "questions": questions,
    })


@router.post("/icebreak/{match_id}/answer")
async def post_answers(
    match_id: str,
    body: SubmitAnswersRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    answers = [
        {"questionId": a.questionId, "content": a.content}
        for a in body.answers
    ]
    result = submit_answers(db, match_id, current_user.id, answers)

    if not result.get("ok"):
        return error(10005, result.get("message", "提交失败"))

    return ok(result)


@router.get("/icebreak/{match_id}/result")
async def view_result(
    match_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = get_result(db, match_id, current_user.id)
    if result is None:
        return error(10031, "答案尚未准备就绪，请等待双方完成答题")

    return ok(result)


@router.post("/icebreak/{match_id}/rate")
async def rate_icebreak(
    match_id: str,
    body: RateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    result = process_rating(db, match_id, current_user.id, body.score)
    return ok(result)
