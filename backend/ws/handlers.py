"""Socket.IO 事件处理 — 聊天实时推送"""

import socketio

from database import SessionLocal
from models.chat import Message, ChatSession
from services.auth_service import verify_token

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")


@sio.on("connect")
async def on_connect(sid, environ, auth):
    """连接时验证 token"""
    if not auth or not auth.get("token"):
        raise ConnectionRefusedError("未登录")

    try:
        payload = verify_token(auth["token"])
    except Exception:
        raise ConnectionRefusedError("token 无效")

    await sio.save_session(sid, {"userId": payload["sub"]})
    print(f"[WS] User {payload['sub']} connected (sid={sid})")


@sio.on("disconnect")
async def on_disconnect(sid):
    session = await sio.get_session(sid)
    user_id = session.get("userId", "unknown")
    print(f"[WS] User {user_id} disconnected (sid={sid})")


@sio.on("chat:join")
async def on_chat_join(sid, data):
    """加入会话房间"""
    session_id = data.get("sessionId")
    if not session_id:
        return

    # 验证用户是否有权访问此会话
    sess = await sio.get_session(sid)
    user_id = sess.get("userId")

    db = SessionLocal()
    try:
        chat_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if chat_session and (chat_session.user1Id == user_id or chat_session.user2Id == user_id):
            sio.enter_room(sid, f"chat:{session_id}")
    finally:
        db.close()


@sio.on("chat:message")
async def on_chat_message(sid, data):
    """发送消息并广播"""
    session_id = data.get("sessionId")
    content = data.get("content", "")
    msg_type = data.get("type", "text")

    if not session_id or not content:
        return

    sess = await sio.get_session(sid)
    sender_id = sess.get("userId")

    db = SessionLocal()
    try:
        # 验证会话和权限
        chat_session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not chat_session:
            return
        if chat_session.user1Id != sender_id and chat_session.user2Id != sender_id:
            return

        # 保存消息
        msg = Message(
            sessionId=session_id,
            senderId=sender_id,
            type=msg_type,
            content=content,
        )
        db.add(msg)
        chat_session.updatedAt = msg.createdAt
        db.commit()

        # 广播给房间内所有人
        await sio.emit(
            "chat:message",
            {
                "sessionId": session_id,
                "message": {
                    "id": msg.id,
                    "senderId": sender_id,
                    "type": msg_type,
                    "content": content,
                    "createdAt": msg.createdAt.isoformat() if msg.createdAt else None,
                },
            },
            room=f"chat:{session_id}",
        )
    finally:
        db.close()


@sio.on("chat:typing")
async def on_chat_typing(sid, data):
    """通知对方正在输入"""
    session_id = data.get("sessionId")
    if not session_id:
        return

    sess = await sio.get_session(sid)
    await sio.emit(
        "chat:typing",
        {"sessionId": session_id, "userId": sess.get("userId")},
        room=f"chat:{session_id}",
        skip_sid=sid,
    )


@sio.on("chat:read")
async def on_chat_read(sid, data):
    """标记已读"""
    session_id = data.get("sessionId")
    message_id = data.get("messageId")
    if not session_id:
        return

    sess = await sio.get_session(sid)
    # 更新数据库消息已读时间
    db = SessionLocal()
    try:
        msg = db.query(Message).filter(Message.id == message_id).first()
        if msg:
            from datetime import datetime, timezone
            msg.readAt = datetime.now(timezone.utc)
            db.commit()
    finally:
        db.close()

    await sio.emit(
        "chat:read",
        {"sessionId": session_id, "messageId": message_id, "userId": sess.get("userId")},
        room=f"chat:{session_id}",
        skip_sid=sid,
    )
