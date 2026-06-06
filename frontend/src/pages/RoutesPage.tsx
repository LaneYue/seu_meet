import { useEffect, useState } from "react"
import { Award, Bell, BookOpen, Clock, Coins, Coffee, Compass, Dumbbell, Heart, Map, MapPin, Plus, Search, Sparkles, Star, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Pill, TabLayout } from "../components/AppShell"
import { routes, partnerPosts } from "../data/mock/linkit"
import { allAchievements } from "../data/achievements"
import { routesApi, type MarketRoute } from "../lib/api-routes"

const fallbackRouteImage = "/自习女.jpg"

// 找搭子快捷入口
const QUICK_ITEMS = [
  { title: "学习搭子", desc: "自习 · 备考 · 课程", icon: BookOpen, tone: "mint" },
  { title: "饭搭子", desc: "午饭 · 探店 · 分享", icon: Coffee, tone: "peach" },
  { title: "运动搭子", desc: "跑步 · 球类 · 健身", icon: Dumbbell, tone: "green" },
  { title: "认真关系", desc: "兴趣 · 成长 · 陪伴", icon: Heart, tone: "lilac" },
  { title: "兴趣交友", desc: "摄影 · 音乐 · 阅读", icon: Sparkles, tone: "blue" },
  { title: "校园路线", desc: "打卡 · 徽章 · 探索", icon: Map, tone: "mint" },
  { title: "跨校区同行", desc: "九龙湖 · 四牌楼", icon: Compass, tone: "peach" },
  { title: "活动组队", desc: "讲座 · 社团 · 公益", icon: Users, tone: "lilac" }
]

const CROSS_ITEMS = ["建筑 × 信息", "医学 × 工科", "经管 × 设计"]

// mock 兜底数据（后端无数据时展示）
const MOCK_MARKET_ROUTES: MarketRoute[] = [
  {
    id: "jiulonghu", title: "九龙湖学习搭子路线", badge: "官方路线", campus: "九龙湖",
    duration: "约 1 天", difficulty: "轻松", people: "1.2k", nodes: 8,
    image: "/自习女.jpg", intro: "从图书馆到教学楼，串起一次温和的共同学习行动。",
    tags: ["学习", "图书馆"], price: 0, rating: 4.9, sales: 1200,
    author: { id: "official", name: "官方", avatar: "官" },
  },
  {
    id: "sipaifang", title: "四牌楼文化同行路线", badge: "人文探索", campus: "四牌楼",
    duration: "约 3 小时", difficulty: "轻松", people: "860", nodes: 6,
    image: "/骑行1.jpg", intro: "一起走过老校区建筑与树影，认识校园里的另一面。",
    tags: ["文化", "摄影"], price: 20, rating: 4.7, sales: 386,
    author: { id: "user-1", name: "梓宁", avatar: "梓" },
  },
  {
    id: "citywalk-jiulonghu", title: "九龙湖夜间 city walk", badge: "UGC 路线", campus: "九龙湖",
    duration: "约 2 小时", difficulty: "轻松", people: "240", nodes: 5,
    image: "/草原.jpg", intro: "夜晚的九龙湖有另一种静谧，这条路线带你找到它。",
    tags: ["夜间", "探索"], price: 10, rating: 4.5, sales: 97,
    author: { id: "user-2", name: "安屿", avatar: "安" },
  },
  {
    id: "food-jiulonghu", title: "殷巷美食探店地图", badge: "UGC 路线", campus: "九龙湖",
    duration: "约 2 小时", difficulty: "轻松", people: "530", nodes: 8,
    image: "/早餐.jpg", intro: "10 家高性价比小店，从奶茶到锅贴，全是亲测踩点。",
    tags: ["美食", "探店"], price: 5, rating: 4.8, sales: 412,
    author: { id: "user-3", name: "慕溪", avatar: "慕" },
  },
]

const SORT_OPTIONS = ["热门", "最新", "评分", "免费"] as const
type SortOption = typeof SORT_OPTIONS[number]

const CAMPUS_FILTERS = ["全部", "九龙湖", "四牌楼", "丁家桥"] as const

export function RoutesPage() {
  const [activeTab, setActiveTab] = useState<"market" | "mine" | "partners">("market")
  const [sort, setSort] = useState<SortOption>("热门")
  const [campus, setCampus] = useState("全部")
  const [searchText, setSearchText] = useState("")
  const [marketData, setMarketData] = useState<MarketRoute[]>(MOCK_MARKET_ROUTES)
  const [loading, setLoading] = useState(false)

  const unlockedAchievements = allAchievements.filter((a) => a.unlocked)
  const unlockedCount = unlockedAchievements.length
  const myRoutes = routes

  useEffect(() => {
    if (activeTab !== "market") return
    setLoading(true)
    routesApi.listMarket({ campus, sort, search: searchText })
      .then((data) => { if (data.length > 0) setMarketData(data) })
      .catch(() => {}) // 后端不可达时保留 mock 数据
      .finally(() => setLoading(false))
  }, [activeTab, campus, sort, searchText])

  const filteredMarket = marketData

  return (
    <TabLayout>
      <div className="scroll-page routes-page">
        <header className="page-top">
          <div>
            <h1>路线</h1>
            <p>探索 · 购买 · 发布</p>
          </div>
          <div className="top-actions">
            <Link className="icon-button" to="/routes/publish" aria-label="发布路线"><Plus size={19} /></Link>
            <button className="icon-button" aria-label="路线通知"><Bell size={19} /></button>
          </div>
        </header>

        {/* Tab 切换 */}
        <div className="routes-tab-row">
          <button className={activeTab === "partners" ? "active" : ""} onClick={() => setActiveTab("partners")}>找搭子</button>
          <button className={activeTab === "market" ? "active" : ""} onClick={() => setActiveTab("market")}>路线市集</button>
          <button className={activeTab === "mine" ? "active" : ""} onClick={() => setActiveTab("mine")}>我的路线</button>
        </div>

        {/* ── 找搭子 Tab ─────────────────────────────────────────────── */}
        {activeTab === "partners" && (
          <>
            {/* 快捷入口 */}
            <section className="quick-grid">
              {QUICK_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <Link to={item.title.includes("路线") ? "/routes" : "/partners"} className={`quick-card ${item.tone}`} key={item.title}>
                    <span><Icon size={22} /></span>
                    <strong>{item.title}</strong>
                    <small>{item.desc}</small>
                  </Link>
                )
              })}
            </section>

            {/* 热门搭子需求 */}
            <section className="section-block">
              <div className="section-title">
                <h2>热门搭子需求</h2>
                <Link to="/partners">查看全部</Link>
              </div>
              {partnerPosts.slice(0, 2).map((post) => (
                <Link className="home-partner-card" to="/partners" key={post.id}>
                  <div>
                    <strong>{post.title}</strong>
                    <p>{post.time} · {post.place}</p>
                    <span>{post.joined} / {post.total} 人</span>
                  </div>
                  <button>加入</button>
                </Link>
              ))}
            </section>

            {/* 本周跨专业交流 */}
            <section className="section-block">
              <div className="section-title">
                <h2>本周跨专业交流</h2>
              </div>
              <div className="cross-grid">
                {CROSS_ITEMS.map((item) => (
                  <article className="cross-card" key={item}>
                    <strong>{item}</strong>
                    <p>从一次共同行动开始认识</p>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── 路线市集 Tab ───────────────────────────────────────────── */}
        {activeTab === "market" && (
          <>
            {/* 搜索 */}
            <label className="search-box">
              <Search size={18} />
              <input
                placeholder="搜索路线、地点、标签"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </label>

            {/* 校区筛选 */}
            <div className="filter-row">
              {CAMPUS_FILTERS.map((c) => (
                <button key={c} className={campus === c ? "selected" : ""} onClick={() => setCampus(c)}>{c}</button>
              ))}
            </div>

            {/* 排序 */}
            <div className="sort-row">
              {SORT_OPTIONS.map((s) => (
                <button key={s} className={sort === s ? "selected" : ""} onClick={() => setSort(s)}>{s}</button>
              ))}
            </div>

            {/* 市集列表 */}
            {loading && <p className="achievement-empty">加载中…</p>}
            <div className="market-route-list">
              {filteredMarket.map((route) => (
                <Link className="market-route-card" to={`/routes/${route.id}`} key={route.id}>
                  <img
                    src={route.image}
                    alt=""
                    onError={(e) => { e.currentTarget.src = fallbackRouteImage }}
                  />
                  <div className="market-route-body">
                    <div className="market-route-top">
                      <Pill tone="blue">{route.badge}</Pill>
                      {route.price === 0
                        ? <span className="market-price free">免费</span>
                        : <span className="market-price paid"><Coins size={12} />{route.price} 点</span>
                      }
                    </div>
                    <h3>{route.title}</h3>
                    <p>{route.intro}</p>
                    <div className="market-route-meta">
                      <span><MapPin size={12} />{route.campus}</span>
                      <span><Clock size={12} />{route.duration}</span>
                      <span><Users size={12} />{route.people} 人参与</span>
                    </div>
                    <div className="market-route-footer">
                      <span className="market-author">
                        <span className="market-author-avatar">{route.author.avatar}</span>
                        {route.author.name}
                      </span>
                      <span className="market-rating">
                        <Star size={12} />{route.rating}
                        <span className="market-sales">· {route.sales} 次购买</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* ── 我的路线 Tab ───────────────────────────────────────────── */}
        {activeTab === "mine" && (
          <>
            <section className="section-block route-list-section">
              <div className="section-title"><h2>已参与路线</h2></div>
              <div className="route-list">
                {myRoutes.map((route) => (
                  <Link className="route-card" to={`/routes/${route.id}`} key={route.id}>
                    <img
                      src={route.image}
                      alt=""
                      onError={(e) => { e.currentTarget.src = fallbackRouteImage }}
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
              <div className="section-title"><h2>我的吧唧</h2><Link to="/achievements">成就墙 →</Link></div>
              <div className="achievement-preview-row">
                {unlockedAchievements.slice(0, 4).map((a) => (
                  <Link to="/achievements" key={a.code} className="achievement-preview-pin">
                    <img src={`/achievements/${a.code}.png`} alt={a.name} />
                    <span>{a.name}</span>
                  </Link>
                ))}
                {unlockedCount === 0 && (
                  <p className="achievement-empty-hint">完成校园路线打卡可解锁成就吧唧</p>
                )}
                <Link to="/achievements" className="achievement-preview-more">
                  {unlockedCount > 4 ? `+${unlockedCount - 4}` : "查看全部"}
                </Link>
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
          </>
        )}
      </div>
    </TabLayout>
  )
}