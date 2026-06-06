"""破冰服务 — 随机抽题 + 盲评判定"""

import random
from sqlalchemy.orm import Session

from models.question import Question, Answer, Rating
from models.match import Match
from models.chat import ChatSession


def get_icebreak_questions(db: Session, match_id: str) -> list[dict] | None:
    """获取匹配的破冰问题（随机3题，不同类别）"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match or match.status != "matched":
        return None

    all_questions = db.query(Question).filter(Question.active == True).all()
    if len(all_questions) < 3:
        return None

    by_category: dict[str, list[Question]] = {}
    for q in all_questions:
        by_category.setdefault(q.category, []).append(q)

    categories = list(by_category.keys())
    random.shuffle(categories)

    selected = []
    for cat in categories[:3]:
        q = random.choice(by_category[cat])
        selected.append({"id": q.id, "category": q.category, "content": q.content})

    return selected[:3]


def submit_answers(
    db: Session, match_id: str, user_id: str, answers: list[dict],
) -> dict:
    """提交破冰答案"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return {"ok": False, "message": "匹配不存在"}

    # 检查是否已提交
    existing = db.query(Answer).filter(
        Answer.matchId == match_id, Answer.userId == user_id
    ).first()
    if existing:
        return {"ok": False, "message": "你已提交过答案，不可修改"}

    # 保存答案
    for a in answers:
        db.add(Answer(
            matchId=match_id,
            userId=user_id,
            questionId=a["questionId"],
            content=a["content"],
        ))

    db.commit()

    # 检查对方是否也已提交
    other_id = match.targetId if match.userId == user_id else match.userId
    other_answers = db.query(Answer).filter(
        Answer.matchId == match_id, Answer.userId == other_id
    ).first()

    return {
        "ok": True,
        "submitted": True,
        "otherSubmitted": other_answers is not None,
    }


def get_result(db: Session, match_id: str, user_id: str) -> dict | None:
    """获取双方答案对比"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return None

    my_answers = db.query(Answer).filter(
        Answer.matchId == match_id, Answer.userId == user_id
    ).all()

    other_id = match.targetId if match.userId == user_id else match.userId
    other_answers = db.query(Answer).filter(
        Answer.matchId == match_id, Answer.userId == other_id
    ).all()

    if not my_answers or not other_answers:
        return None

    # 获取用户昵称
    from models.user import User
    me = db.query(User).filter(User.id == user_id).first()
    other = db.query(User).filter(User.id == other_id).first()

    comparisons = []
    for my_a, other_a in zip(my_answers, other_answers):
        question = db.query(Question).filter(Question.id == my_a.questionId).first()
        comparisons.append({
            "question": {
                "id": question.id,
                "category": question.category,
                "content": question.content,
            } if question else None,
            "myAnswer": my_a.content,
            "otherAnswer": other_a.content,
        })

    return {
        "matchId": match_id,
        "myNickname": me.nickname if me else "",
        "otherNickname": other.nickname if other else "",
        "comparisons": comparisons,
        "canRate": True,
    }


def process_rating(
    db: Session, match_id: str, user_id: str, score: int,
) -> dict:
    """处理评分 + 判定破冰结果"""
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        return {"stage": "ERROR", "message": "匹配不存在"}

    # 检查是否已评分
    existing = db.query(Rating).filter(
        Rating.matchId == match_id, Rating.fromId == user_id
    ).first()
    if existing:
        return {"stage": "ERROR", "message": "你已评过分"}

    other_id = match.targetId if match.userId == user_id else match.userId

    db.add(Rating(
        matchId=match_id,
        fromId=user_id,
        toId=other_id,
        score=score,
    ))
    db.commit()

    # 检查对方是否也评分
    other_rating = db.query(Rating).filter(
        Rating.matchId == match_id, Rating.fromId == other_id
    ).first()

    if not other_rating:
        return {"stage": "WAITING_OTHER_RATE", "message": "等待对方评分"}

    # 双方都已评分 — 判定
    if score >= 3 and other_rating.score >= 3:
        # 破冰成功 — 解锁聊天
        session = db.query(ChatSession).filter(ChatSession.matchId == match_id).first()
        if session:
            session.stage = "ice_breaking"
            db.commit()

        return {
            "stage": "UNLOCKED",
            "result": "MATCH",
            "sessionId": session.id if session else "",
            "message": "破冰成功！你们可以开始聊天了",
        }

    # 破冰失败
    match.status = "rejected"
    db.commit()

    return {
        "stage": "REJECTED",
        "result": "UNMATCH",
        "message": "对方觉得不太合适，期待下一次相遇",
    }
