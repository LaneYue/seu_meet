"""聊天路由 — GET/POST /chat/* (REST 兜底)"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
from models.user import User
from models.chat import ChatSession, Message
from schemas import ok, error
from routers.auth_deps import get_current_user

router = APIRouter()


@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    sessions = db.query(ChatSession).filter(
        or_(
            ChatSession.user1Id == current_user.id,
            ChatSession.user2Id == current_user.id,
        )
    ).order_by(ChatSession.updatedAt.desc()).all()

    list_data = []
    for s in sessions:
        other_id = s.user2Id if s.user1Id == current_user.id else s.user1Id
        other = db.query(User).filter(User.id == other_id).first()

        last_msg = db.query(Message).filter(
            Message.sessionId == s.id,
        ).order_by(Message.createdAt.desc()).first()

        list_data.append({
            "sessionId": s.id,
            "stage": s.stage,
            "targetUser": {
                "id": other.id, "nickname": other.nickname, "avatar": other.avatar,
                "college": other.college,
            } if other else None,
            "lastMessage": {
                "content": last_msg.content, "type": last_msg.type,
                "createdAt": last_msg.createdAt.isoformat() if last_msg.createdAt else None,
            } if last_msg else None,
            "updatedAt": s.updatedAt.isoformat() if s.updatedAt else None,
        })

    return ok({"list": list_data})


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: str,
    before: str = Query(None),
    limit: int = Query(30, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # 验证会话归属
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return error(10004, "会话不存在")
    if session.user1Id != current_user.id and session.user2Id != current_user.id:
        return error(10003, "无权访问此会话")

    query = db.query(Message).filter(Message.sessionId == session_id).order_by(Message.createdAt.desc())

    if before:
        query = query.filter(Message.createdAt < before)

    messages = query.limit(limit).all()

    return ok({
        "list": [
            {
                "id": m.id,
                "type": m.type,
                "content": m.content,
                "senderId": m.senderId,
                "isMe": m.senderId == current_user.id,
                "createdAt": m.createdAt.isoformat() if m.createdAt else None,
                "readAt": m.readAt.isoformat() if m.readAt else None,
            }
            for m in reversed(messages)  # 正序返回
        ],
        "hasMore": len(messages) >= limit,
    })


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: str,
    body: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        return error(10004, "会话不存在")
    if session.user1Id != current_user.id and session.user2Id != current_user.id:
        return error(10003, "无权操作")
    if session.stage not in ("ice_breaking", "normal", "intimate"):
        return error(10040, "聊天未解锁，请先完成破冰问答")

    msg = Message(
        sessionId=session_id,
        senderId=current_user.id,
        type=body.get("type", "text"),
        content=body["content"],
    )
    db.add(msg)
    session.updatedAt = msg.createdAt  # 更新会话时间
    db.commit()

    return ok({
        "id": msg.id,
        "type": msg.type,
        "content": msg.content,
        "senderId": msg.senderId,
        "isMe": True,
        "createdAt": msg.createdAt.isoformat() if msg.createdAt else None,
    })
