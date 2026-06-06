import { useState } from "react"
import { ArrowLeft, Clock, Coins, Flag, MapPin, Share2, X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Pill, StatusBar } from "../components/AppShell"
import { badges, routeSteps, routes } from "../data/mock/linkit"
import { routesApi } from "../lib/api-routes"

const MOCK_BALANCE = 130
const ROUTE_PRICES: Record<string, number> = {
  "jiulonghu": 0,
  "sipaifang": 20,
}

export function RouteDetailPage() {
  const { routeId } = useParams()
  const route = routes.find((item) => item.id === routeId) ?? routes[0]
  const navigate = useNavigate()

  const price = ROUTE_PRICES[route.id] ?? 0
  const [purchased, setPurchased] = useState(price === 0)
  const [balance, setBalance] = useState(MOCK_BALANCE)
  const [showModal, setShowModal] = useState(false)
  const [insufficient, setInsufficient] = useState(false)

  const handlePurchase = async () => {
    if (balance < price) { setInsufficient(true); return }
    try {
      const result = await routesApi.purchaseRoute(route.id)
      setBalance(result.balanceAfter)
    } catch {
      setBalance((b) => b - price) // 后端不可达时本地扣减
    }
    setPurchased(true)
    setShowModal(false)
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page route-detail">
        <header className="detail-hero">
          <img src={route.image} alt="" />
          <div className="detail-hero-actions">
            <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
            <button aria-label="分享"><Share2 size={20} /></button>
          </div>
          <div>
            <Pill tone="blue">{route.badge}</Pill>
            <h1>{route.title}</h1>
            <p>{route.intro}</p>
          </div>
        </header>

        <section className="detail-meta">
          <span><MapPin size={16} />{route.campus}</span>
          <span><Clock size={16} />{route.duration}</span>
          <span><Flag size={16} />{route.difficulty}</span>
          {price > 0 && (
            <span className="route-price-tag">
              <Coins size={14} />{purchased ? "已购买" : `${price} 点`}
            </span>
          )}
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>路线步骤</h2><span>{routeSteps.length} 个节点</span></div>
          <div className="timeline">
            {routeSteps.map((step, index) => (
              <article className={`timeline-step ${index < 2 ? "done" : ""}`} key={step.title}>
                <span className="step-dot">{index + 1}</span>
                <div>
                  <div className="card-line">
                    <strong>{step.title}</strong>
                    <Pill tone={index < 2 ? "green" : index === 2 ? "orange" : "gray"}>{step.status}</Pill>
                  </div>
                  <p>{step.desc}</p>
                  <small>{step.method}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>电子徽章</h2></div>
          <div className="badge-grid">
            {badges.slice(0, 3).map((badge) => {
              const Icon = badge.icon
              return (
                <article className="badge-item" key={badge.name}>
                  <Icon size={24} />
                  <strong>{badge.name}</strong>
                  <span>{badge.level}</span>
                </article>
              )
            })}
          </div>
        </section>

        <section className="detail-actions">
          {purchased ? (
            <>
              <button className="primary-action" onClick={() => navigate(`/routes/${route.id}/checkin`)}>继续打卡</button>
              <button onClick={() => navigate(`/routes/${route.id}/invite`)}>邀请同行</button>
            </>
          ) : (
            <button className="primary-action" onClick={() => setShowModal(true)}>
              <Coins size={16} /> {price} 点数解锁路线
            </button>
          )}
        </section>
      </div>

      {/* 购买弹窗 */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}><X size={18} /></button>
            <h2>解锁路线</h2>
            <p className="modal-route-title">{route.title}</p>
            <div className="modal-cost-row">
              <span>消耗点数</span>
              <b><Coins size={14} /> {price} 点</b>
            </div>
            <div className="modal-cost-row">
              <span>当前余额</span>
              <b>{balance} 点</b>
            </div>
            <div className="modal-cost-row">
              <span>解锁后余额</span>
              <b className={balance < price ? "negative" : ""}>{balance - price} 点</b>
            </div>
            {insufficient && (
              <p className="modal-error">
                点数不足，
                <button className="text-link" onClick={() => navigate("/points")}>去获取点数 →</button>
              </p>
            )}
            <button
              className={`full-width-action ${balance < price ? "disabled" : ""}`}
              onClick={handlePurchase}
              disabled={balance < price}
            >
              确认解锁
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
