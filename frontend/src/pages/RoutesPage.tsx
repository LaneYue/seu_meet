import { Award, Bell, Clock, MapPin, Search, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Pill, TabLayout } from "../components/AppShell"
import { badges, routes } from "../data/mock/linkit"

const fallbackRouteImage =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80"

export function RoutesPage() {
  return (
    <TabLayout>
      <div className="scroll-page routes-page">
        <header className="page-top">
          <div>
            <h1>路线</h1>
            <p>一起探索东大校园</p>
          </div>
          <button className="icon-button" aria-label="路线通知"><Bell size={19} /></button>
        </header>
        <label className="search-box">
          <Search size={18} />
          <input placeholder="搜索路线、地点、主题" />
        </label>
        <div className="filter-row wrap">
          {["九龙湖", "四牌楼", "丁家桥", "学习", "文化", "运动", "公益", "徽章"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>

        <section className="section-block route-list-section">
          <div className="section-title"><h2>精选路线</h2></div>
          <div className="route-list">
            {routes.map((route) => (
              <Link className="route-card" to={`/routes/${route.id}`} key={route.id}>
                <img
                  src={route.image}
                  alt=""
                  onError={(event) => {
                    event.currentTarget.src = fallbackRouteImage
                  }}
                />
                <div className="route-overlay">
                  <div className="route-copy">
                    <Pill tone="blue">{route.badge}</Pill>
                    <h2>{route.title}</h2>
                    <p>{route.intro}</p>
                    <div className="route-meta">
                      <span><Users size={14} />{route.people} 人参与</span>
                      <span><MapPin size={14} />{route.nodes} 个打卡点</span>
                      <span><Clock size={14} />{route.duration}</span>
                    </div>
                  </div>
                </div>
                <div className="route-progress">
                  <span>打卡进度</span>
                  <b>{route.progress} / {route.nodes}</b>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-title"><h2>我的徽章</h2><Link to="/badges">徽章墙</Link></div>
          <div className="badge-grid">
            {badges.map((badge) => {
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

        <section className="score-card">
          <div>
            <span>当前同行值</span>
            <strong>130</strong>
            <p>青禾 Lv.2 · 本周 +18</p>
          </div>
          <div className="score-bar"><i /></div>
          <small>距离下一等级还差 40 点</small>
        </section>

        <section className="badge-apply-card">
          <Award size={28} />
          <div>
            <strong>电子吧唧申请</strong>
            <p>已满足 2 项条件，完成一条官方路线即可申请。</p>
          </div>
          <Link to="/badges/apply">查看</Link>
        </section>
      </div>
    </TabLayout>
  )
}
