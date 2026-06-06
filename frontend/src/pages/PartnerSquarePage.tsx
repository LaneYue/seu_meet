import { CalendarDays, MapPin, Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { Pill, TabLayout } from "../components/AppShell"
import { partnerPosts } from "../data/mock/linkit"

export function PartnerSquarePage() {
  return (
    <TabLayout>
      <div className="scroll-page plaza-page">
        <header className="page-top">
          <div>
            <h1>同行广场</h1>
            <p>发布搭子需求，遇见合拍的人</p>
          </div>
          <Link className="post-button" to="/partners"><Plus size={18} />发布</Link>
        </header>
        <div className="filter-row">
          {["全部", "学习", "运动", "生活", "兴趣"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>
        <PartnerCards />
      </div>
    </TabLayout>
  )
}

function PartnerCards() {
  return (
    <div className="partner-list">
      {partnerPosts.map((post) => (
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
