import { ArrowLeft, Heart, Send, Share2, X } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { BottomNav, StatusBar } from "../components/AppShell"
import { people } from "../data/mock/linkit"

export function SwipePage() {
  const navigate = useNavigate()
  const person = people[0]

  return (
    <div className="app-screen swipe-screen">
      <StatusBar />
      <img className="swipe-photo" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="" />
      <div className="swipe-shade" />
      <header className="floating-top">
        <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={22} /></button>
        <button aria-label="分享"><Share2 size={20} /></button>
      </header>
      <section className="swipe-info">
        <div className="name-row">
          <h1>{person.name}</h1>
          <span>♀ 20</span>
        </div>
        <p>人文学院 · 大二 · 四牌楼校区</p>
        <div className="tag-row light">
          {person.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <p className="swipe-copy">喜欢文字与城市漫游，希望认识有趣的人，一起探索更多可能。</p>
        <small>推荐理由：你们都喜欢校园探索，并且都去过晚樱校区。</small>
      </section>
      <div className="swipe-actions">
        <button><X size={28} /><span>跳过</span></button>
        <button className="send"><Send size={26} /><span>发请求</span></button>
        <button className="heart"><Heart size={28} /><span>喜欢</span></button>
      </div>
      <BottomNav />
    </div>
  )
}
