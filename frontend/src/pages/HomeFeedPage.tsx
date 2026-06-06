import { Bell, BookOpen, ChevronRight, Coffee, Compass, Dumbbell, Heart, Map, Search, Sparkles, Users } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, Pill, TabLayout } from "../components/AppShell"
import { partnerPosts, people, routes } from "../data/mock/linkit"

export function HomeFeedPage() {
  const quick = [
    { title: "学习搭子", desc: "自习 · 备考 · 课程", icon: BookOpen, tone: "mint" },
    { title: "饭搭子", desc: "午饭 · 探店 · 分享", icon: Coffee, tone: "peach" },
    { title: "运动搭子", desc: "跑步 · 球类 · 健身", icon: Dumbbell, tone: "green" },
    { title: "认真关系", desc: "兴趣 · 成长 · 陪伴", icon: Heart, tone: "lilac" },
    { title: "兴趣交友", desc: "摄影 · 音乐 · 阅读", icon: Sparkles, tone: "blue" },
    { title: "校园路线", desc: "打卡 · 徽章 · 探索", icon: Map, tone: "mint" },
    { title: "跨校区同行", desc: "九龙湖 · 四牌楼", icon: Compass, tone: "peach" },
    { title: "活动组队", desc: "讲座 · 社团 · 公益", icon: Users, tone: "lilac" }
  ]

  return (
    <TabLayout>
      <div className="scroll-page home-page">
        <header className="home-hero">
          <div className="identity-row">
            <Link to="/me" className="profile-entry" aria-label="进入我的主页">
              <Avatar label="L" gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" />
            </Link>
            <div>
              <strong>东大学生已认证</strong>
              <p>九龙湖校区 · 晴 22°C</p>
            </div>
            <button className="icon-button" aria-label="通知">
              <Bell size={19} />
            </button>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input placeholder="搜索搭子、路线、活动" />
          </label>
        </header>

        <section className="quick-grid">
          {quick.map((item) => {
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

        <section className="section-block">
          <div className="section-title">
            <h2>今日推荐</h2>
            <button>换一批</button>
          </div>
          <div className="people-list">
            {people.map((person) => (
              <article className="person-card" key={person.id}>
                <Avatar label={person.avatar} gradient={person.color} />
                <div className="person-main">
                  <div className="card-line">
                    <strong>{person.name}</strong>
                    <Pill>{person.status}</Pill>
                  </div>
                  <p>{person.school}</p>
                  <div className="tag-row">
                    {person.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <p className="intro">{person.intro}</p>
                </div>
                <button className="soft-like" aria-label="想认识">
                  <Heart size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>

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

        <section className="section-block">
          <div className="section-title">
            <h2>本周跨专业交流</h2>
          </div>
          <div className="cross-grid">
            {["建筑 × 信息", "医学 × 工科", "经管 × 设计"].map((item) => (
              <article className="cross-card" key={item}>
                <strong>{item}</strong>
                <p>从一次共同行动开始认识</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-title">
            <h2>推荐校园路线</h2>
          </div>
          {routes.slice(0, 1).map((route) => (
            <Link className="home-route-card" to={`/routes/${route.id}`} key={route.id}>
              <img src={route.image} alt="" />
              <div>
                <Pill tone="blue">{route.badge}</Pill>
                <strong>{route.title}</strong>
                <p>{route.campus} · {route.people} 人参与</p>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </section>
      </div>
    </TabLayout>
  )
}
