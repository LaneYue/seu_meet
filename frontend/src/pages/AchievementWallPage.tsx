import { useState } from "react"
import { ArrowLeft, Coins, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import {
  allAchievements,
  campusLabel,
  categoryLabel,
  CAMPUSES,
  CATEGORIES,
} from "../data/achievements"
import type { Achievement } from "../types/linkit"

function AchievementPin({ achievement }: { achievement: Achievement }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const img = `/achievements/${achievement.code}.png`

  return (
    <>
      <button
        className={`achievement-pin ${achievement.unlocked ? "unlocked" : "locked"}`}
        onClick={() => setOpen(true)}
        aria-label={achievement.name}
      >
        <div className="achievement-pin-img-wrap">
          <img src={img} alt={achievement.name} />
          {!achievement.unlocked && (
            <span className="achievement-lock-overlay"><Lock size={14} /></span>
          )}
        </div>
        <span className="achievement-pin-name">{achievement.name}</span>
      </button>

      {open && (
        <div className="achievement-sheet-backdrop" onClick={() => setOpen(false)}>
          <div className="achievement-sheet" onClick={(e) => e.stopPropagation()}>
            <div className={`achievement-sheet-img-wrap ${achievement.unlocked ? "" : "locked"}`}>
              <img src={img} alt={achievement.name} />
              {!achievement.unlocked && (
                <span className="achievement-lock-overlay large"><Lock size={28} /></span>
              )}
            </div>
            <div className="achievement-sheet-meta">
              <span className="achievement-code">{achievement.code} · {campusLabel[achievement.campus]} · {categoryLabel[achievement.category]}</span>
              <h2>{achievement.name}</h2>
              {achievement.unlocked ? (
                <p className="achievement-unlocked-tag">✓ 已解锁{achievement.unlockedAt ? ` · ${achievement.unlockedAt}` : ""}</p>
              ) : (
                <p className="achievement-condition">🔒 {achievement.conditionDesc}</p>
              )}
              <p className="achievement-humor">{achievement.humorDesc}</p>
            </div>
            {achievement.unlocked && (
              <button
                className="achievement-redeem-btn"
                onClick={() => { setOpen(false); navigate(`/achievements/${achievement.code}/redeem`) }}
              >
                <Coins size={15} /> 兑换实体吧唧 · 50 点数
              </button>
            )}
            <button className="achievement-sheet-close" onClick={() => setOpen(false)}>关闭</button>
          </div>
        </div>
      )}
    </>
  )
}

export function AchievementWallPage() {
  const navigate = useNavigate()
  const [activeCampus, setActiveCampus] = useState<string>("all")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const filtered = allAchievements.filter(
    (a) =>
      (activeCampus === "all" || a.campus === activeCampus) &&
      (activeCategory === "all" || a.category === activeCategory)
  )

  const unlockedCount = allAchievements.filter((a) => a.unlocked).length

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page achievement-wall-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>成就墙</h1>
            <p>已解锁 {unlockedCount} / {allAchievements.length} 个吧唧</p>
          </div>
        </header>

        {/* 校区筛选 */}
        <nav className="filter-row achievement-filter">
          <button className={activeCampus === "all" ? "selected" : ""} onClick={() => setActiveCampus("all")}>全部</button>
          {CAMPUSES.map((c) => (
            <button key={c} className={activeCampus === c ? "selected" : ""} onClick={() => setActiveCampus(c)}>
              {campusLabel[c]}
            </button>
          ))}
        </nav>

        {/* 类型筛选 */}
        <nav className="filter-row achievement-filter secondary">
          <button className={activeCategory === "all" ? "selected" : ""} onClick={() => setActiveCategory("all")}>全类型</button>
          {CATEGORIES.map((c) => (
            <button key={c} className={activeCategory === c ? "selected" : ""} onClick={() => setActiveCategory(c)}>
              {categoryLabel[c]}
            </button>
          ))}
        </nav>

        {/* 吧唧网格 */}
        <div className="achievement-grid">
          {filtered.map((a) => (
            <AchievementPin key={a.code} achievement={a} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="achievement-empty">该分类暂无成就</p>
        )}
      </div>
    </div>
  )
}
