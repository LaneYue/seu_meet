"""匹配服务 — 推荐算法 + 双向匹配状态机"""

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models.user import User
from models.match import Match
from models.chat import ChatSession


def get_discover_cards(
    db: Session,
    current_user_id: str,
    count: int = 20,
) -> list[dict]:
    """纯规则推荐引擎"""

    current_user = db.query(User).filter(User.id == current_user_id).first()
    if not current_user:
        return []

    # ── 第1步：构建排除池 ──
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    operated = db.query(Match.targetId).filter(
        Match.userId == current_user_id,
        Match.createdAt >= thirty_days_ago,
    ).all()
    operated_ids = {r[0] for r in operated} | {current_user_id}

    matched = db.query(Match.targetId).filter(
        Match.userId == current_user_id,
        Match.status == "matched",
    ).all()
    matched_ids = {r[0] for r in matched}

    exclude_ids = operated_ids | matched_ids

    # ── 第2步：拉取候选 ──
    candidates = (
        db.query(User)
        .filter(
            User.id.notin_(exclude_ids),
            User.gender != current_user.gender,
            User.creditScore >= 70,
            User.status == "active",
        )
        .limit(count * 3)
        .all()
    )

    # ── 第3步：计算推荐分 ──
    current_tags = set(current_user.tags or [])
    scored = []
    for c in candidates:
        common = current_tags & set(c.tags or [])
        score = (
            len(common) * 3
            + (1 if c.campus != current_user.campus else 0) * 2
            + random.uniform(-1, 1)
        )
        scored.append((score, c))

    # ── 第4步：排序取 Top N ──
    scored.sort(key=lambda x: x[0], reverse=True)

    return [
        {
            "id": c.id,
            "nickname": c.nickname,
            "avatar": c.avatar,
            "college": c.college,
            "grade": c.grade,
            "campus": c.campus,
            "bio": c.bio,
            "tags": c.tags or [],
            "commonTags": list(current_tags & set(c.tags or [])),
        }
        for _, c in scored[:count]
    ]


def process_match_action(
    db: Session,
    current_user_id: str,
    target_id: str,
    action: str,
) -> dict:
    """执行匹配动作，返回匹配结果"""

    # 检查目标用户是否存在
    target = db.query(User).filter(User.id == target_id).first()
    if not target:
        return {"matched": False, "action": action, "error": "目标用户不存在"}

    # 记录当前操作
    match = Match(userId=current_user_id, targetId=target_id, action=action)
    db.add(match)

    if action == "left":
        match.status = "rejected"
        db.commit()
        return {"matched": False, "action": "left"}

    # right / super — 检查双向匹配
    reverse = (
        db.query(Match)
        .filter(
            Match.userId == target_id,
            Match.targetId == current_user_id,
            Match.action.in_(["right", "super"]),
        )
        .first()
    )

    if reverse:
        # 双向匹配成功!
        match.status = "matched"
        reverse.status = "matched"

        session = ChatSession(
            matchId=match.id,
            user1Id=current_user_id,
            user2Id=target_id,
            stage="ice_breaking",
        )
        db.add(session)
        db.commit()

        return {
            "matched": True,
            "matchId": match.id,
            "sessionId": session.id,
            "needIceBreak": True,
            "targetUser": {
                "id": target.id,
                "nickname": target.nickname,
                "avatar": target.avatar,
                "college": target.college,
            },
        }

    match.status = "pending"
    db.commit()
    return {"matched": False, "action": action}
