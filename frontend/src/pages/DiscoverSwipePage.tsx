import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CheckCircle2, ChevronLeft, ShieldCheck } from "lucide-react";
import { BottomNav } from "../components/AppShell";
import { PublicProfileCard } from "../components/PublicProfileCard";
import { discoverProfiles } from "../data/mock/linkit";
import { linkitService } from "../services/linkitService";
import type { DiscoverProfile } from "../types/linkit";

type DragState = {
  startX: number;
  startY: number;
  x: number;
  y: number;
  dragging: boolean;
};

type ExitState = {
  x: number;
  y: number;
  rotate: number;
};

const swipeThreshold = 82;

export function DiscoverSwipePage() {
  const [cards, setCards] = useState<DiscoverProfile[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [exit, setExit] = useState<ExitState | null>(null);
  const [gestureLabel, setGestureLabel] =
    useState("左滑不喜欢，右滑喜欢，上滑看详情");
  const [matchedUser, setMatchedUser] = useState<{
    nickname: string;
    matchId: string;
    sessionId: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  // Card expansion states
  const [animPhase, setAnimPhase] = useState<
    "idle" | "expanding" | "expanded" | "collapsing"
  >("idle");
  const [collapsePhase, setCollapsePhase] = useState<
    "start" | "animating"
  >("start");
  const expandedRef = useRef<HTMLDivElement>(null);
  const collapseDragRef = useRef<{
    startY: number;
    moved: boolean;
  } | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    linkitService.discover
      .listProfiles()
      .then((list) => {
        if (list.length > 0) {
          setCards(list);
        } else {
          setCards(discoverProfiles);
        }
        setLoading(false);
      })
      .catch(() => {
        setCards(discoverProfiles);
        setLoading(false);
      });
  }, []);

  const profile = cards[activeIndex % Math.max(cards.length, 1)] ?? null;
  const nextProfile = cards[(activeIndex + 1) % Math.max(cards.length, 1)];
  const thirdProfile = cards[(activeIndex + 2) % Math.max(cards.length, 1)];

  const currentMotion = useMemo(() => {
    if (exit) return exit;
    if (drag) return { x: drag.x, y: drag.y, rotate: drag.x / 18 };
    return { x: 0, y: 0, rotate: 0 };
  }, [drag, exit]);

  const nextScale = Math.min(
    1,
    0.94 + Math.min(0.06, Math.hypot(currentMotion.x, currentMotion.y) / 1800),
  );
  const nextTranslate = Math.max(
    0,
    16 - Math.hypot(currentMotion.x, currentMotion.y) / 18,
  );

  // ── Swipe finish (left/right/down) ──────────────────────────────

  const finishToNext = () => {
    setExit(null);
    setDrag(null);
    setActiveIndex((value) => (value + 1) % Math.max(cards.length, 1));
  };

  const recordSwipe = async (action: "like" | "dislike" | "skip") => {
    if (!profile) return;
    try {
      const result = (await linkitService.discover.recordSwipe({
        profileId: profile.id,
        action,
      })) as any;
      if (result?.matched) {
        setMatchedUser({
          nickname: result.targetUser?.nickname ?? "对方",
          matchId: result.matchId,
          sessionId: result.sessionId,
        });
      }
    } catch {
      /* fallback */
    }
  };

  // ── Pointer handling for card swiping ───────────────────────────

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (exit || animPhase !== "idle") return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({
      startX: event.clientX,
      startY: event.clientY,
      x: 0,
      y: 0,
      dragging: true,
    });
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    if (!drag?.dragging || exit || animPhase !== "idle") return;
    const x = event.clientX - drag.startX;
    const y = event.clientY - drag.startY;
    setDrag({ ...drag, x, y });

    if (Math.abs(x) > Math.abs(y)) {
      setGestureLabel(x > 0 ? "松手喜欢" : "松手不喜欢");
    } else if (y < 0) {
      setGestureLabel("松手进入详情");
    } else if (y > 0) {
      setGestureLabel("松手跳过");
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!drag || exit || animPhase !== "idle") return;
    event.currentTarget.releasePointerCapture(event.pointerId);

    const absX = Math.abs(drag.x);
    const absY = Math.abs(drag.y);

    if (Math.max(absX, absY) < swipeThreshold) {
      setDrag(null);
      setGestureLabel("左滑不喜欢，右滑喜欢，上滑看详情");
      return;
    }

    if (absX > absY) {
      const direction = drag.x > 0 ? 1 : -1;
      setGestureLabel(
        drag.x > 0 ? "已喜欢，继续为你推荐" : "已略过，继续为你推荐",
      );
      recordSwipe(drag.x > 0 ? "like" : "dislike");
      setExit({ x: direction * 520, y: drag.y * 0.35, rotate: direction * 18 });
      return;
    }

    if (drag.y < 0) {
      // Up swipe → expand card in-place (no navigation)
      setGestureLabel("");
      setDrag(null);
      // Let React commit the drag-snap to inset:5% first
      setTimeout(() => setAnimPhase("expanding"), 0);
      return;
    }

    setGestureLabel("已下滑跳过");
    recordSwipe("skip");
    setExit({ x: drag.x * 0.2, y: 620, rotate: 0 });
  };

  const handlePointerCancel = () => {
    if (!exit && animPhase === "idle") setDrag(null);
  };

  // ── Card expansion / collapse ───────────────────────────────────

  const handleCardTransitionEnd = () => {
    if (animPhase === "expanding") {
      setAnimPhase("expanded");
    } else if (animPhase === "collapsing" && collapsePhase === "animating") {
      setAnimPhase("idle");
      setCollapsePhase("start");
    }
  };

  const handleCollapse = () => {
    setAnimPhase("collapsing");
    setCollapsePhase("start");
  };

  // Two-step collapse: render card at inset:0, then next frame add inset:5%
  useEffect(() => {
    if (animPhase === "collapsing" && collapsePhase === "start") {
      requestAnimationFrame(() => setCollapsePhase("animating"));
    }
  }, [animPhase, collapsePhase]);

  // ── Swipe-down-to-collapse on expanded view ─────────────────────

  const handleExpandedPointerDown = (e: PointerEvent) => {
    if (expandedRef.current && expandedRef.current.scrollTop === 0) {
      collapseDragRef.current = { startY: e.clientY, moved: false };
    }
  };

  const handleExpandedPointerMove = (e: PointerEvent) => {
    const dragState = collapseDragRef.current;
    if (!dragState || expandedRef.current?.scrollTop !== 0) return;
    const dy = e.clientY - dragState.startY;
    if (dy > 60) {
      dragState.moved = true;
      collapseDragRef.current = null;
      handleCollapse();
    }
  };

  const handleExpandedPointerUp = () => {
    collapseDragRef.current = null;
  };

  // ── Derived flags ───────────────────────────────────────────────

  const isAnimating =
    animPhase === "expanding" || animPhase === "collapsing";

  // ── Loading state ───────────────────────────────────────────────

  if (loading) {
    return (
      <div className="app-screen discover-fullscreen with-tabbar">
        <section className="discover-page fullscreen">
          <p className="gesture-hint fullscreen">加载中...</p>
        </section>
        <BottomNav transparent />
      </div>
    );
  }

  // ── No more profiles ────────────────────────────────────────────

  if (!profile) {
    return (
      <div className="app-screen discover-fullscreen with-tabbar">
        <section className="discover-page fullscreen">
          <p className="gesture-hint fullscreen">今日已无更多推荐，明天再来</p>
          <button
            className="full-width-action"
            style={{ marginTop: 16 }}
            onClick={() => {
              linkitService.discover
                .listProfiles()
                .then((list) => {
                  setCards(list.length > 0 ? list : discoverProfiles);
                  setActiveIndex(0);
                })
                .catch(() => {
                  setCards(discoverProfiles);
                  setActiveIndex(0);
                });
            }}
          >
            刷新
          </button>
        </section>
        <BottomNav transparent />
      </div>
    );
  }

  // ── Main render ─────────────────────────────────────────────────

  return (
    <div className="app-screen discover-fullscreen with-tabbar">
      <section className="discover-page fullscreen">
        {/* ── Card stack (hidden when fully expanded) ── */}
        {animPhase !== "expanded" && (
          <div className="discover-stack fullscreen" aria-label="同行推送名片">
            {!isAnimating && thirdProfile && (
              <article
                data-stack-layer="2"
                className="discover-card"
                aria-hidden="true"
                style={{
                  inset: "5%",
                  transform: "scale(0.91) translateY(28px)",
                  opacity: 0.32,
                }}
              >
                <img
                  className="w-full h-full object-cover block"
                  src={thirdProfile.photos[0]}
                  alt=""
                />
              </article>
            )}
            {!isAnimating && nextProfile && (
              <article
                data-stack-layer="1"
                className="discover-card"
                aria-hidden="true"
                style={{
                  inset: "5%",
                  transform: `scale(${nextScale}) translateY(${nextTranslate}px)`,
                  opacity: 0.88,
                  transition: "transform 220ms ease, opacity 220ms ease",
                }}
              >
                <img
                  className="w-full h-full object-cover block"
                  src={nextProfile.photos[0]}
                  alt=""
                />
              </article>
            )}
            <PublicProfileCard
              profile={profile}
              data-stack-layer="0"
              className={`swipe-motion-card ${!isAnimating ? "!inset-x-[5%] !inset-y-[5%]" : ""} ${drag ? "dragging" : ""} ${exit ? "exiting" : ""} ${isAnimating ? "animating-inset" : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              onTransitionEnd={
                isAnimating
                  ? handleCardTransitionEnd
                  : exit
                    ? finishToNext
                    : undefined
              }
              style={{
                transform:
                  exit || drag
                    ? `translate3d(${currentMotion.x}px, ${currentMotion.y}px, 0) rotate(${currentMotion.rotate}deg)`
                    : undefined,
                ...(animPhase === "expanding"
                  ? { inset: 0, borderRadius: 0, boxShadow: "none", border: "none" }
                  : {}),
                ...(animPhase === "collapsing" && collapsePhase === "start"
                  ? { inset: 0, borderRadius: 0, boxShadow: "none", border: "none" }
                  : {}),
              }}
            />
          </div>
        )}

        {/* ── Gesture hint ── */}
        {gestureLabel && animPhase === "idle" && (
          <p className="gesture-hint fullscreen">{gestureLabel}</p>
        )}
      </section>

      {/* ── Expanded detail view (dark theme) ──────────────────── */}
      {animPhase === "expanded" && profile && (
        <div
          ref={expandedRef}
          className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-[#07111f]"
          style={{ scrollbarWidth: "none" }}
          onPointerDown={handleExpandedPointerDown}
          onPointerMove={handleExpandedPointerMove}
          onPointerUp={handleExpandedPointerUp}
          onPointerCancel={handleExpandedPointerUp}
        >
          {/* Top bar */}
          <div className="sticky top-0 z-20 flex items-center justify-between px-4 pt-12 pb-3 pointer-events-none bg-gradient-to-b from-[#07111f] to-transparent">
            <button
              onClick={handleCollapse}
              className="pointer-events-auto w-9 h-9 inline-flex items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm"
            >
              <ChevronLeft size={20} />
            </button>
          </div>

          {/* Hero — same photo as the card cover */}
          <div className="relative -mt-14" style={{ minHeight: "45vh" }}>
            <img
              className="absolute inset-0 w-full h-full object-cover"
              src={profile.photos[0]}
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            <div className="absolute bottom-6 left-4 right-4 text-white">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#065f46]">
                <CheckCircle2 size={12} />
                {profile.verified}
              </span>
              <div className="flex items-end gap-2 mt-2">
                <h1 className="text-3xl font-bold leading-none">
                  {profile.name}
                </h1>
                <span className="text-base opacity-80 pb-0.5">
                  {profile.gender} {profile.age}
                </span>
              </div>
              <p className="text-sm opacity-80 mt-1 flex items-center gap-1">
                <BookOpen size={14} />
                {profile.school}
              </p>
            </div>
          </div>

          {/* Content sections */}
          <div className="px-4 pb-28 -mt-4 space-y-3 relative z-10">
            {/* 个人介绍 */}
            <section className="glass-card-dark">
              <h2 className="text-base font-bold mb-2 text-white/90">
                个人介绍
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                {profile.post}
              </p>
            </section>

            {/* 分享图片 */}
            {profile.photos.length > 1 && (
              <section className="glass-card-dark">
                <h2 className="text-base font-bold mb-3 text-white/90">
                  分享图片
                </h2>
                <div className="grid grid-cols-[1.2fr_0.8fr] gap-2">
                  <img
                    className="row-span-2 h-60 object-cover rounded-xl"
                    src={profile.photos[0]}
                    alt=""
                  />
                  {profile.photos.slice(1, 3).map((p) => (
                    <img
                      className="h-28 object-cover rounded-xl"
                      src={p}
                      alt=""
                      key={p}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* 爱好 */}
            <section className="glass-card-dark">
              <h2 className="text-base font-bold mb-3 text-white/90">爱好</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((tag) => (
                  <span
                    className="px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm font-medium"
                    key={tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* 安全提示 */}
            <section className="bg-amber-900/20 border border-amber-600/30 rounded-xl p-3 flex gap-2 text-sm text-amber-200/80">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <span>{profile.safety}</span>
            </section>

            {/* 操作按钮 */}
            <div className="flex gap-3 pt-2">
              <button className="flex-1 h-11 rounded-xl bg-white/10 text-white font-bold backdrop-blur-sm">
                💬 发消息
              </button>
              <button
                className="flex-1 h-11 rounded-xl bg-[#23866a] text-white font-bold"
                onClick={handleCollapse}
              >
                返回推送
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 匹配成功弹窗 ── */}
      {matchedUser && (
        <div className="modal-backdrop" onClick={() => setMatchedUser(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 你们互相喜欢！</h2>
            <p>你和{matchedUser.nickname}匹配成功</p>
            <div className="detail-actions" style={{ marginTop: 16 }}>
              <button
                className="primary-action"
                onClick={() => navigate(`/icebreak/${matchedUser.matchId}`)}
              >
                立即答题
              </button>
              <button onClick={() => setMatchedUser(null)}>稍后</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom nav (hidden when expanded) ── */}
      {animPhase !== "expanded" && <BottomNav transparent />}
    </div>
  );
}