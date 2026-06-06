import { useEffect, useMemo, useState, type PointerEvent } from "react"
import { useNavigate } from "react-router-dom"
import { BottomNav } from "../components/AppShell"
import { PublicProfileCard } from "../components/PublicProfileCard"
import { discoverProfiles } from "../data/mock/linkit"
import { linkitService } from "../services/linkitService"
import type { DiscoverProfile } from "../types/linkit"

type DragState = {
  startX: number
  startY: number
  x: number
  y: number
  dragging: boolean
}

type ExitState = {
  x: number
  y: number
  rotate: number
  detailTarget?: string
}

const swipeThreshold = 82

export function DiscoverSwipePage() {
  const [cards, setCards] = useState<DiscoverProfile[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [exit, setExit] = useState<ExitState | null>(null)
  const [gestureLabel, setGestureLabel] = useState("左滑不喜欢，右滑喜欢，上滑看详情")
  const [matchedUser, setMatchedUser] = useState<{ nickname: string; matchId: string; sessionId: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    linkitService.discover.listProfiles()
      .then((list) => {
        if (list.length > 0) {
          setCards(list)
        } else {
          // 后端无数据时用 mock 兜底
          setCards(discoverProfiles)
        }
        setLoading(false)
      })
      .catch(() => {
        // 后端不可达时用 mock 兜底
        setCards(discoverProfiles)
        setLoading(false)
      })
  }, [])

  const profile = cards[activeIndex % Math.max(cards.length, 1)] ?? null
  const nextProfile = cards[(activeIndex + 1) % Math.max(cards.length, 1)]
  const thirdProfile = cards[(activeIndex + 2) % Math.max(cards.length, 1)]

  const currentMotion = useMemo(() => {
    if (exit) return exit
    if (drag) return { x: drag.x, y: drag.y, rotate: drag.x / 18 }
    return { x: 0, y: 0, rotate: 0 }
  }, [drag, exit])

  const nextScale = Math.min(1, 0.94 + Math.min(0.06, Math.hypot(currentMotion.x, currentMotion.y) / 1800))
  const nextTranslate = Math.max(0, 16 - Math.hypot(currentMotion.x, currentMotion.y) / 18)

  const finishToNext = () => {
    const detailTarget = exit?.detailTarget
    setExit(null)
    setDrag(null)
    setActiveIndex((value) => (value + 1) % Math.max(cards.length, 1))
    if (detailTarget) navigate(detailTarget)
  }

  const recordSwipe = async (action: "like" | "dislike" | "skip") => {
    if (!profile) return
    try {
      const result = await linkitService.discover.recordSwipe({
        profileId: profile.id,
        action,
      }) as any
      if (result?.matched) {
        setMatchedUser({
          nickname: result.targetUser?.nickname ?? "对方",
          matchId: result.matchId,
          sessionId: result.sessionId,
        })
      }
    } catch { /* fallback */ }
  }

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (exit) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({ startX: event.clientX, startY: event.clientY, x: 0, y: 0, dragging: true })
  }

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!drag?.dragging || exit) return
    const x = event.clientX - drag.startX
    const y = event.clientY - drag.startY
    setDrag({ ...drag, x, y })

    if (Math.abs(x) > Math.abs(y)) {
      setGestureLabel(x > 0 ? "松手喜欢" : "松手不喜欢")
    } else if (y < 0) {
      setGestureLabel("松手进入详情")
    } else if (y > 0) {
      setGestureLabel("松手跳过")
    }
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!drag || exit) return
    event.currentTarget.releasePointerCapture(event.pointerId)

    const absX = Math.abs(drag.x)
    const absY = Math.abs(drag.y)

    if (Math.max(absX, absY) < swipeThreshold) {
      setDrag(null)
      setGestureLabel("左滑不喜欢，右滑喜欢，上滑看详情")
      return
    }

    if (absX > absY) {
      const direction = drag.x > 0 ? 1 : -1
      setGestureLabel(drag.x > 0 ? "已喜欢，继续为你推荐" : "已略过，继续为你推荐")
      recordSwipe(drag.x > 0 ? "like" : "dislike")
      setExit({ x: direction * 520, y: drag.y * 0.35, rotate: direction * 18 })
      return
    }

    if (drag.y < 0) {
      setGestureLabel("进入名片详情")
      setExit({ x: drag.x * 0.2, y: -620, rotate: 0, detailTarget: `/home/profile/${profile.id}` })
      return
    }

    setGestureLabel("已下滑跳过")
    recordSwipe("skip")
    setExit({ x: drag.x * 0.2, y: 620, rotate: 0 })
  }

  const handlePointerCancel = () => {
    if (!exit) setDrag(null)
  }

  if (loading) {
    return (
      <div className="app-screen discover-fullscreen with-tabbar">
        <section className="discover-page fullscreen">
          <p className="gesture-hint fullscreen">加载中...</p>
        </section>
        <BottomNav transparent />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="app-screen discover-fullscreen with-tabbar">
        <section className="discover-page fullscreen">
          <p className="gesture-hint fullscreen">今日已无更多推荐，明天再来</p>
          <button className="full-width-action" style={{ marginTop: 16 }} onClick={() => {
            linkitService.discover.listProfiles().then((list) => {
              setCards(list.length > 0 ? list : discoverProfiles)
              setActiveIndex(0)
            }).catch(() => { setCards(discoverProfiles); setActiveIndex(0) })
          }}>刷新</button>
        </section>
        <BottomNav transparent />
      </div>
    )
  }

  return (
    <div className="app-screen discover-fullscreen with-tabbar">
      <section className="discover-page fullscreen">
        <button className="home-toggle top-left" onClick={() => navigate("/home/feed")} type="button">主页</button>
        <div className="discover-stack fullscreen" aria-label="同行推送名片">
          {thirdProfile && (
            <article className="discover-card ghost two fullscreen-ghost" aria-hidden="true">
              <img src={thirdProfile.photos[0]} alt="" />
            </article>
          )}
          {nextProfile && (
            <article
              className="discover-card ghost one fullscreen-next"
              aria-hidden="true"
              style={{
                transform: `scale(${nextScale}) translateY(${nextTranslate}px)`
              }}
            >
              <img src={nextProfile.photos[0]} alt="" />
            </article>
          )}
          <PublicProfileCard
            profile={profile}
            className={`swipe-motion-card ${drag ? "dragging" : ""} ${exit ? "exiting" : ""}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onTransitionEnd={exit ? finishToNext : undefined}
            style={{
              transform: `translate3d(${currentMotion.x}px, ${currentMotion.y}px, 0) rotate(${currentMotion.rotate}deg)`
            }}
          />
        </div>
        <p className="gesture-hint fullscreen">{gestureLabel}</p>
      </section>

      {/* 匹配成功弹窗 */}
      {matchedUser && (
        <div className="modal-backdrop" onClick={() => setMatchedUser(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 你们互相喜欢！</h2>
            <p>你和{matchedUser.nickname}匹配成功</p>
            <div className="detail-actions" style={{ marginTop: 16 }}>
              <button className="primary-action" onClick={() => navigate(`/icebreak/${matchedUser.matchId}`)}>
                立即答题
              </button>
              <button onClick={() => setMatchedUser(null)}>稍后</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav transparent />
    </div>
  )
}
