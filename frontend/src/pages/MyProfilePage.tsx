import { ChevronRight, Send } from "lucide-react"
import { useEffect, useState, type PointerEvent } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Avatar, TabLayout } from "../components/AppShell"
import { myProfile } from "../data/mock/linkit"
import { allAchievements } from "../data/achievements"
import { linkitService } from "../services/linkitService"
import { pointsApi } from "../lib/api-points"
import { http } from "../lib/http"

// ── types ────────────────────────────────────────────────────────────

type SlimMessage = { id: string; content: string; isMe: boolean }
type Session = { id: string; name: string; tag: string; unread: number; messages: SlimMessage[] }

const SWIPE_THRESHOLD = 72

// ── MiniChatCard ─────────────────────────────────────────────────────

function MiniChatCard({
  session,
  position,
  style,
  onCardClick,
  onQuickReply,
  quickReply,
  setQuickReply,
}: {
  session: Session
  position: "ghost2" | "ghost1" | "active"
  style?: React.CSSProperties
  onCardClick?: () => void
  onQuickReply?: () => void
  quickReply?: string
  setQuickReply?: (v: string) => void
}) {
  const cls = `profile-mini-chat profile-mini-${position}`
  const isActive = position === "active"

  return (
    <div className={cls} style={style}>
      {/* header */}
      <div className="profile-mini-chat-header">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Avatar label={session.name.charAt(0)} size="sm" gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" />
          <div>
            <strong>{session.name}</strong>
            <span className="pill blue" style={{ marginLeft: 6, fontSize: 10 }}>
              {session.tag}
            </span>
          </div>
        </div>
        {session.unread > 0 && (
          <b className="unread" style={{ width: 20, height: 20, fontSize: 11 }}>
            {session.unread}
          </b>
        )}
      </div>

      {/* messages — scrollable, click to enter chat */}
      <div className="profile-mini-chat-msgs" onClick={isActive ? onCardClick : undefined}>
        {session.messages.length === 0 && (
          <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 12, padding: 20 }}>暂无消息</p>
        )}
        {session.messages.map((m) => (
          <div key={m.id} className={`profile-mini-msg ${m.isMe ? "mine" : ""}`}>
            <p>{m.content}</p>
          </div>
        ))}
      </div>

      {/* reply bar — active = real input; inactive = same-height placeholder */}
      <div className="profile-mini-chat-reply">
        {isActive && onQuickReply ? (
          <form
            onSubmit={(e) => { e.preventDefault(); onQuickReply() }}
            onClick={(e) => e.stopPropagation()}
            style={{ display: "flex", gap: 6, alignItems: "center", width: "100%" }}
          >
            <input
              placeholder={`回复 ${session.name}`}
              value={quickReply ?? ""}
              onChange={(e) => setQuickReply?.(e.target.value)}
            />
            <button type="submit" disabled={!quickReply?.trim()}>
              <Send size={16} />
            </button>
          </form>
        ) : null}
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────

export function MyProfilePage() {
  const navigate = useNavigate()
  const unlockedAchievements = allAchievements.filter((a) => a.unlocked)
  const unlockedCount = unlockedAchievements.length
  const [points, setPoints] = useState(130)
  const [sessions, setSessions] = useState<Session[]>([])
  const [quickReply, setQuickReply] = useState("")
  const [loading, setLoading] = useState(true)

  // ── load data ──
  useEffect(() => {
    pointsApi.getBalance().then(setPoints).catch(() => {})
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await http.get<{
        list: { sessionId: string; stage: string; sessionType: string; unreadCount: number; targetUser: { nickname: string } | null }[]
      }>("/chat/sessions")

      const sessionList: Session[] = []
      for (const s of (data.list || []).slice(0, 3)) {
        try {
          const msgs = await http.get<{ list: { id: string; content: string; isMe: boolean }[] }>(
            `/chat/sessions/${s.sessionId}/messages?limit=4`,
          )
          sessionList.push({
            id: s.sessionId,
            name: s.targetUser?.nickname ?? "用户",
            tag: s.sessionType ?? "normal",
            unread: s.unreadCount ?? 0,
            messages: (msgs.list ?? []).slice(-4).map((m) => ({ id: m.id, content: m.content, isMe: m.isMe })),
          })
        } catch {
          sessionList.push({ id: s.sessionId, name: s.targetUser?.nickname ?? "用户", tag: "normal", unread: 0, messages: [] })
        }
      }

      setSessions(sessionList.length > 0 ? sessionList : buildMockSessions())
    } catch {
      setSessions(buildMockSessions())
    }
    setLoading(false)
  }

  // ── swipe ──
  type Drag = { startX: number; startY: number; x: number; y: number; dragging: boolean }
  type Exit = { x: number; y: number; rotate: number }
  const [drag, setDrag] = useState<Drag | null>(null)
  const [exit, setExit] = useState<Exit | null>(null)

  const motion = exit ?? (drag ? { x: drag.x, y: drag.y, rotate: drag.x / 32 } : { x: 0, y: 0, rotate: 0 })
  const hasSwiped = (drag && Math.max(Math.abs(drag.x), Math.abs(drag.y)) > 16) || exit

  const onDown = (e: PointerEvent) => {
    if (exit) return
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ startX: e.clientX, startY: e.clientY, x: 0, y: 0, dragging: true })
  }
  const onMove = (e: PointerEvent) => {
    if (!drag?.dragging || exit) return
    setDrag({ ...drag, x: e.clientX - drag.startX, y: e.clientY - drag.startY })
  }
  const onUp = (e: PointerEvent) => {
    if (!drag || exit) return
    e.currentTarget.releasePointerCapture(e.pointerId)
    if (Math.abs(drag.x) < SWIPE_THRESHOLD && Math.abs(drag.y) < SWIPE_THRESHOLD) { setDrag(null); return }
    if (Math.abs(drag.x) > Math.abs(drag.y)) { const dir = drag.x > 0 ? 1 : -1; setExit({ x: dir * 420, y: drag.y * 0.3, rotate: dir * 14 }) }
    else { setExit({ x: drag.x * 0.2, y: drag.y > 0 ? 620 : -620, rotate: 0 }) }
  }
  const finishExit = () => {
    setExit(null); setDrag(null)
    setSessions(([, second, third]) => [second ?? null, third, null].filter(Boolean) as Session[])
  }

  const nextScale = Math.min(1, 0.94 + Math.min(0.06, Math.hypot(motion.x, motion.y) / 2800))
  const nextTranslate = Math.max(0, 24 - Math.hypot(motion.x, motion.y) / 22)

  // ── quick reply ──
  const handleQuickReply = async () => {
    if (!quickReply.trim() || sessions.length === 0) return
    const content = quickReply.trim(); setQuickReply("")
    try { await linkitService.messages.sendMessage({ chatId: sessions[0].id, content }) } catch { /* fallback */ }
    setSessions(([first, ...rest]) =>
      first ? [{ ...first, messages: [...first.messages, { id: `local-${Date.now()}`, content, isMe: true }] }, ...rest] : [],
    )
  }

  // ── render ─────────────────────────────────────────────────────────
  return (
    <TabLayout>
      <div className="scroll-page my-profile-page">

        {/* ── Cover image ── */}
        <div className="my-profile-cover">
          <img src={myProfile.photos[0]} alt="" />
          <div className="my-profile-cover-overlay" />
          <header className="my-profile-hero my-profile-hero-overlay">
            <div className="my-profile-hero-left">
              <Link to="/me/edit" style={{ flexShrink: 0, borderRadius: 16 }}>
                <Avatar label={myProfile.name.charAt(0)} gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" size="lg" />
              </Link>
              <div style={{ color: "#fff", textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
                <strong>{myProfile.name}</strong>
                <p>{myProfile.school}</p>
                <span className="verified-badge">东大学生已认证</span>
              </div>
            </div>
            <Link to="/points" className="profile-points-chip">💰 <span>{points}</span></Link>
          </header>
        </div>

        {/* ── User info (compact) ── */}
        <div className="profile-bio-row">
          <p className="profile-post">{myProfile.post}</p>
          <div className="tag-row" style={{ marginTop: 4 }}>{myProfile.interests.map((t) => <span key={t}>{t}</span>)}</div>
        </div>

        {/* ── Achievements ── */}
        <section className="section-block" style={{ marginTop: 10 }}>
          <div className="section-title">
            <h2>我的吧唧</h2>
            <Link to="/achievements">已解锁 {unlockedCount}/{allAchievements.length} <ChevronRight size={14} style={{ verticalAlign: -3 }} /></Link>
          </div>
          <div className="achievement-preview-row">
            {unlockedAchievements.slice(0, 5).map((a) => (
              <Link to="/achievements" key={a.code} className="achievement-preview-pin"><img src={`/achievements/${a.code}.png`} alt={a.name} /><span>{a.name}</span></Link>
            ))}
            {unlockedCount === 0 && <p className="achievement-empty-hint">完成校园路线打卡可解锁成就吧唧</p>}
            {unlockedCount > 5 && <Link to="/achievements" className="achievement-preview-more">+{unlockedCount - 5}</Link>}
          </div>
        </section>

        {/* ── Chat section ── */}
        <section className="section-block" style={{ marginTop: 12, paddingBottom: 20 }}>
          <div className="section-title"><h2>消息</h2><Link to="/chats">全部 <ChevronRight size={14} style={{ verticalAlign: -3 }} /></Link></div>

          {loading && <p style={{ textAlign: "center", padding: 32, color: "#94a3b8", fontSize: 13 }}>加载中...</p>}

          {!loading && sessions.length === 0 && (
            <div className="empty-state-card" style={{ minHeight: 120, marginTop: 8 }}>😊<strong>暂无消息</strong><p>去同行页认识新朋友，匹配成功后即可聊天</p></div>
          )}

          {!loading && sessions.length > 0 && (
            <>
              <div className="profile-swipe-stack">
                {/* ghost 2 */}
                {sessions.length >= 3 && <MiniChatCard session={sessions[2]} position="ghost2" />}
                {/* ghost 1 */}
                {sessions.length >= 2 && (
                  <MiniChatCard session={sessions[1]} position="ghost1"
                    style={{ transform: `scale(${nextScale}) translateY(${nextTranslate}px)` }} />
                )}
                {/* active */}
                <MiniChatCard
                  session={sessions[0]} position="active"
                  style={{ transform: `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.rotate}deg)` }}
                  onCardClick={() => { if (!hasSwiped) navigate(`/chats/${sessions[0].id}`) }}
                  onQuickReply={handleQuickReply}
                  quickReply={quickReply}
                  setQuickReply={setQuickReply}
                />
                {/* swipe overlay */}
                <div className="profile-swipe-overlay"
                  onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
                  onPointerCancel={() => { if (!exit) setDrag(null) }}
                  onTransitionEnd={exit ? finishExit : undefined}
                  style={{
                    transform: `translate3d(${motion.x}px, ${motion.y}px, 0) rotate(${motion.rotate}deg)`,
                    transition: exit ? "transform 260ms cubic-bezier(0.22, 0.88, 0.34, 1)" : undefined,
                  }}
                />
              </div>

              {sessions.length > 1 && <p className="profile-chat-remaining">还有 {sessions.length - 1} 条消息</p>}
            </>
          )}
        </section>
      </div>
    </TabLayout>
  )
}

// ── fallback ─────────────────────────────────────────────────────────

function buildMockSessions(): Session[] {
  return [
    { id: "xiaocheng", name: "小澄同学", tag: "搭子请求", unread: 2, messages: [
      { id: "m1", content: "想和你一起做算法题。", isMe: false },
      { id: "m2", content: "好呀！你对哪些题型感兴趣？", isMe: true },
      { id: "m3", content: "动态规划和大数处理，你呢", isMe: false },
      { id: "m4", content: "我也在刷DP，可以一起讨论", isMe: true },
    ]},
    { id: "badminton", name: "羽毛球搭子群", tag: "路线小队", unread: 4, messages: [
      { id: "m1", content: "明天场地已订，记得带拍！", isMe: false },
      { id: "m2", content: "收到！我带两桶球过来", isMe: true },
      { id: "m3", content: "太好了，5号场18:30见", isMe: false },
    ]},
    { id: "safety", name: "安全中心", tag: "系统提醒", unread: 0, messages: [
      { id: "m1", content: "首次见面请选择校园公共空间。", isMe: false },
      { id: "m2", content: "好的，谢谢提醒！", isMe: true },
    ]},
  ]
}
