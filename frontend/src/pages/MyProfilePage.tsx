import { Edit3, MessageCircle, ChevronRight, Send } from "lucide-react"
import { useEffect, useState, type PointerEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, TabLayout } from "../components/AppShell"
import { myProfile, chats } from "../data/mock/linkit"
import { allAchievements } from "../data/achievements"
import { linkitService } from "../services/linkitService"
import { pointsApi } from "../lib/api-points"
import type { ChatItem } from "../types/linkit"

// ── constants ────────────────────────────────────────────────────────

const SWIPE_THRESHOLD = 72

// ── Chat card with content area ──────────────────────────────────────

function ChatCardContent({ chat, onCardClick }: { chat: ChatItem; onCardClick: () => void }) {
  return (
    <>
      <div className="profile-chat-card-inner" onClick={onCardClick}>
        <div className="profile-chat-card-top">
          <Avatar label={chat.avatar} size="lg" />
          <div className="profile-chat-card-meta">
            <div className="card-line">
              <strong>{chat.name}</strong>
              <span className="profile-chat-time">{chat.time}</span>
            </div>
            <span className="pill blue" style={{ marginTop: 4, display: "inline-flex" }}>{chat.tag}</span>
          </div>
          {chat.unread > 0 && <b className="unread">{chat.unread}</b>}
        </div>
        <p className="profile-chat-preview">{chat.message}</p>
      </div>

      {/* click hint — only shown when not swiping */}
      <div className="profile-chat-card-body-hint">
        点击卡片进入对话
      </div>
    </>
  )
}

// ── main page ────────────────────────────────────────────────────────

export function MyProfilePage() {
  const navigate = useNavigate()
  const unlockedAchievements = allAchievements.filter((a) => a.unlocked)
  const unlockedCount = unlockedAchievements.length
  const [points, setPoints] = useState(130)
  const [chatList, setChatList] = useState<ChatItem[]>(chats)
  const [quickReply, setQuickReply] = useState("")

  // ── load data ──
  useEffect(() => {
    pointsApi.getBalance().then(setPoints).catch(() => {})
    linkitService.messages.listChats()
      .then((list) => { if (list.length > 0) setChatList(list) })
      .catch(() => {})
  }, [])

  // ── swipe state (per DiscoverSwipePage pattern) ────────────────────
  type DragState = { startX: number; startY: number; x: number; y: number; dragging: boolean }
  type ExitState = { x: number; y: number; rotate: number }
  const [drag, setDrag] = useState<DragState | null>(null)
  const [exit, setExit] = useState<ExitState | null>(null)

  const currentMotion = exit ?? (drag ? { x: drag.x, y: drag.y, rotate: drag.x / 32 } : { x: 0, y: 0, rotate: 0 })
  const hasSwiped = (drag && Math.max(Math.abs(drag.x), Math.abs(drag.y)) > 16) || exit

  const nextScale = Math.min(1, 0.94 + Math.min(0.06, Math.hypot(currentMotion.x, currentMotion.y) / 2800))
  const nextTranslate = Math.max(0, 24 - Math.hypot(currentMotion.x, currentMotion.y) / 22)

  const finishExit = () => {
    setExit(null)
    setDrag(null)
    setChatList(([_, ...rest]) => rest)
  }

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (exit) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0, dragging: true })
  }

  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    if (!drag?.dragging || exit) return
    setDrag({ ...drag, x: e.clientX - drag.startX, y: e.clientY - drag.startY })
  }

  const onPointerUp = (e: PointerEvent<HTMLElement>) => {
    if (!drag || exit) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (Math.abs(drag.x) < SWIPE_THRESHOLD && Math.abs(drag.y) < SWIPE_THRESHOLD) {
      setDrag(null) // tap — handled by onClick on inner element
      return
    }
    if (Math.abs(drag.x) > Math.abs(drag.y)) {
      const dir = drag.x > 0 ? 1 : -1
      setExit({ x: dir * 420, y: drag.y * 0.3, rotate: dir * 14 })
    } else {
      setExit({ x: drag.x * 0.2, y: drag.y > 0 ? 620 : -620, rotate: 0 })
    }
  }

  // ── quick reply send ───────────────────────────────────────────────
  const handleQuickReply = async () => {
    if (!quickReply.trim() || chatList.length === 0) return
    const content = quickReply.trim()
    setQuickReply("")
    try {
      await linkitService.messages.sendMessage({ chatId: chatList[0].id, content })
      // update mock lastMessage
      setChatList(([first, ...rest]) => {
        if (!first) return []
        return [{ ...first, message: content, time: "刚刚" }, ...rest]
      })
    } catch { /* fallback */ }
  }

  // ── render ─────────────────────────────────────────────────────────
  return (
    <TabLayout>
      <div className="scroll-page my-profile-page">

        {/* ── User info (compact, HomeFeed identity-row style) ────── */}
        <header className="my-profile-hero">
          <div className="my-profile-hero-left">
            <Link to="/me/edit" style={{ flexShrink: 0, borderRadius: 16 }}>
              <Avatar label={myProfile.name.charAt(0)} gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" size="lg" />
            </Link>
            <div>
              <strong>{myProfile.name}</strong>
              <p>{myProfile.school}</p>
              <span className="verified-badge">东大学生已认证</span>
            </div>
          </div>
          <Link to="/points" className="profile-points-chip">
            <span className="profile-points-icon">💰</span>
            <span>{points}</span>
          </Link>
        </header>

        {/* ── Bio & tags ─────────────────────────────────────────── */}
        <div className="profile-bio-row">
          <p className="profile-post">{myProfile.post || "还没有写介绍，点击编辑添加"}</p>
          <div className="tag-row" style={{ marginTop: 4 }}>
            {myProfile.interests.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>

        {/* ── Achievement pins ──────────────────────────────────────── */}
        <section className="section-block" style={{ marginTop: 10 }}>
          <div className="section-title">
            <h2>我的吧唧</h2>
            <Link to="/achievements">
              已解锁 {unlockedCount}/{allAchievements.length} <ChevronRight size={14} style={{ verticalAlign: -3 }} />
            </Link>
          </div>
          <div className="achievement-preview-row">
            {unlockedAchievements.slice(0, 5).map((a) => (
              <Link to="/achievements" key={a.code} className="achievement-preview-pin">
                <img src={`/achievements/${a.code}.png`} alt={a.name} /><span>{a.name}</span>
              </Link>
            ))}
            {unlockedCount === 0 && <p className="achievement-empty-hint">完成校园路线打卡可解锁成就吧唧</p>}
            {unlockedCount > 5 && <Link to="/achievements" className="achievement-preview-more">+{unlockedCount - 5}</Link>}
          </div>
        </section>

        {/* ── Chat section ────────────────────────────────────────── */}
        <section className="section-block" style={{ marginTop: 12, paddingBottom: 20 }}>
          <div className="section-title">
            <h2>消息</h2>
            <Link to="/chats">全部 <ChevronRight size={14} style={{ verticalAlign: -3 }} /></Link>
          </div>

          {chatList.length === 0 ? (
            <div className="empty-state-card" style={{ minHeight: 120 }}>
              <MessageCircle size={22} /><strong>暂无消息</strong>
              <p>去同行页认识新朋友，匹配成功后即可聊天</p>
            </div>
          ) : (
            <>
              {/* ── Swipe card stack ── */}
              <div className="profile-swipe-stack">
                {/* ghost 2 */}
                {chatList.length >= 3 && (
                  <div className="profile-swipe-card profile-swipe-ghost-2">
                    <ChatCardContent chat={chatList[2]} onCardClick={() => {}} />
                  </div>
                )}
                {/* ghost 1 */}
                {chatList.length >= 2 && (
                  <div className="profile-swipe-card profile-swipe-ghost-1"
                    style={{ transform: `scale(${nextScale}) translateY(${nextTranslate}px)` }}>
                    <ChatCardContent chat={chatList[1]} onCardClick={() => {}} />
                  </div>
                )}
                {/* active */}
                <div
                  className={`profile-swipe-card profile-swipe-active ${drag ? "profile-swipe-card-dragging" : ""} ${exit ? "profile-swipe-card-exit" : ""}`}
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={() => { if (!exit) setDrag(null) }}
                  onTransitionEnd={exit ? finishExit : undefined}
                  style={{
                    transform: `translate3d(${currentMotion.x}px, ${currentMotion.y}px, 0) rotate(${currentMotion.rotate}deg)`,
                    touchAction: "none",
                  }}
                >
                  <ChatCardContent
                    chat={chatList[0]}
                    onCardClick={() => { if (!hasSwiped) navigate(`/chats/${chatList[0].id}`) }}
                  />
                </div>
              </div>

              {/* ── Quick reply bar ── */}
              <form
                className="profile-quick-reply"
                onSubmit={(e) => { e.preventDefault(); handleQuickReply() }}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  placeholder={`回复 ${chatList[0]?.name ?? ""}`}
                  value={quickReply}
                  onChange={(e) => setQuickReply(e.target.value)}
                />
                <button type="submit" disabled={!quickReply.trim()}>
                  <Send size={17} />
                </button>
              </form>

              {chatList.length > 1 && (
                <p className="profile-chat-remaining">还有 {chatList.length - 1} 条消息</p>
              )}
            </>
          )}
        </section>
      </div>
    </TabLayout>
  )
}
