import { useState } from "react"
import { ArrowLeft, Coins, Package } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { allAchievements, campusLabel, categoryLabel } from "../data/achievements"

const REDEEM_COST = 50
const MOCK_BALANCE = 130

export function RedeemPage() {
  const { code } = useParams<{ code: string }>()
  const navigate = useNavigate()
  const achievement = allAchievements.find((a) => a.code === code)

  const [balance] = useState(MOCK_BALANCE)
  const [dorm, setDorm] = useState("")
  const [room, setRoom] = useState("")
  const [done, setDone] = useState(false)

  if (!achievement) return null

  const canRedeem = dorm.trim() && room.trim() && balance >= REDEEM_COST

  if (done) {
    return (
      <div className="app-screen detail-screen">
        <StatusBar />
        <div className="redeem-success">
          <Package size={48} />
          <strong>兑换申请已提交！</strong>
          <p>实体吧唧将通过校内邮件确认配送信息，预计 7-14 天到达。</p>
          <button className="full-width-action" onClick={() => navigate("/achievements")}>返回成就墙</button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page redeem-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>兑换实体吧唧</h1>
            <p>消耗 {REDEEM_COST} 点数</p>
          </div>
        </header>

        {/* 吧唧预览 */}
        <section className="redeem-preview">
          <img
            className="redeem-badge-img"
            src={`/achievements/${achievement.code}.png`}
            alt={achievement.name}
          />
          <div>
            <span className="achievement-code">{achievement.code} · {campusLabel[achievement.campus]} · {categoryLabel[achievement.category]}</span>
            <h2>{achievement.name}</h2>
            <p className="achievement-humor">{achievement.humorDesc}</p>
          </div>
        </section>

        {/* 费用明细 */}
        <section className="glass-card redeem-cost-card">
          <div className="modal-cost-row">
            <span>兑换费用</span>
            <b><Coins size={14} /> {REDEEM_COST} 点</b>
          </div>
          <div className="modal-cost-row">
            <span>当前余额</span>
            <b>{balance} 点</b>
          </div>
          <div className="modal-cost-row">
            <span>兑换后余额</span>
            <b className={balance < REDEEM_COST ? "negative" : ""}>{balance - REDEEM_COST} 点</b>
          </div>
          {balance < REDEEM_COST && (
            <p className="modal-error">点数不足，<button className="text-link" onClick={() => navigate("/points")}>去获取点数 →</button></p>
          )}
        </section>

        {/* 收件信息 */}
        <section className="glass-card publish-section">
          <h2>收件信息</h2>
          <p className="points-recharge-hint">吧唧将配送到校内宿舍</p>
          <label className="publish-label">宿舍楼栋</label>
          <input className="publish-input" placeholder="如：梅园 3 舍" value={dorm} onChange={(e) => setDorm(e.target.value)} />
          <label className="publish-label">房间号</label>
          <input className="publish-input" placeholder="如：302" value={room} onChange={(e) => setRoom(e.target.value)} />
        </section>

        <button
          className={`full-width-action ${!canRedeem ? "disabled" : ""}`}
          disabled={!canRedeem}
          onClick={() => setDone(true)}
        >
          确认兑换
        </button>
      </div>
    </div>
  )
}
