import { CalendarDays, MapPin, Plus } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { Pill, TabLayout } from "../components/AppShell"
import { partnerPosts } from "../data/mock/linkit"

const categories = [
  { key: "all", label: "全部", title: "全部同行需求", desc: "发现适合你的校园同行伙伴" },
  { key: "study", label: "学习", title: "学习搭子", desc: "自习、备考、课程互助和图书馆同行" },
  { key: "sport", label: "运动", title: "运动搭子", desc: "羽毛球、跑步、球类和轻运动" },
  { key: "life", label: "生活", title: "生活搭子", desc: "饭搭子、探店、校园散步和日常陪伴" },
  { key: "interest", label: "兴趣", title: "兴趣交友", desc: "摄影、音乐、展览和跨专业交流" }
]

const categoryPostIds: Record<string, string[]> = {
  all: partnerPosts.map((post) => post.id),
  study: ["library-night"],
  sport: ["badminton"],
  life: ["library-night", "sipaifang-walk"],
  interest: ["sipaifang-walk"]
}

export function PartnerSquarePage() {
  const { category = "all" } = useParams()
  const activeCategory = categories.find((item) => item.key === category) ?? categories[0]
  const visiblePosts = partnerPosts.filter((post) => categoryPostIds[activeCategory.key]?.includes(post.id))

  return (
    <TabLayout>
      <div className="scroll-page plaza-page">
        <header className="page-top">
          <div>
            <h1>同行广场</h1>
            <p>发布搭子需求，遇见合拍的人</p>
          </div>
          <Link className="post-button" to="/partners/new"><Plus size={18} />发布</Link>
        </header>
        <nav className="filter-row" aria-label="同行广场分类">
          {categories.map((item) => (
            <Link
              className={item.key === activeCategory.key ? "selected" : ""}
              key={item.key}
              to={item.key === "all" ? "/partners" : `/partners/${item.key}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="partner-category-panel">
          <strong>{activeCategory.title}</strong>
          <p>{activeCategory.desc}</p>
        </section>

        <PartnerCards posts={visiblePosts.length > 0 ? visiblePosts : partnerPosts} />
      </div>
    </TabLayout>
  )
}

function PartnerCards({ posts }: { posts: typeof partnerPosts }) {
  return (
    <div className="partner-list">
      {posts.map((post) => (
        <article className="partner-card" key={post.id}>
          <div className="card-line">
            <h2>{post.title}</h2>
            <Pill tone={post.tone}>{post.status}</Pill>
          </div>
          <p><CalendarDays size={14} />{post.time}</p>
          <p><MapPin size={14} />{post.place}</p>
          <div className="mini-avatars">
            <span />
            <span />
            <span />
            <b>{post.joined} / {post.total} 人</b>
          </div>
          <footer>
            <span>{post.note}</span>
            <button>{post.status === "进行中" ? "加入" : "申请加入"}</button>
          </footer>
        </article>
      ))}
    </div>
  )
}
