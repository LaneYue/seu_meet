import { ArrowLeft, Clock, Flag, MapPin, Share2 } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { Pill, StatusBar } from "../components/AppShell"
import { badges, routeSteps, routes } from "../data/mock/linkit"

export function RouteDetailPage() {
  const { routeId } = useParams()
  const route = routes.find((item) => item.id === routeId) ?? routes[0]
  const navigate = useNavigate()

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
          <button className="primary-action" onClick={() => navigate(`/routes/${route.id}/checkin`)}>继续打卡</button>
          <button onClick={() => navigate(`/routes/${route.id}/invite`)}>邀请同行</button>
        </section>
      </div>
    </div>
  )
}
