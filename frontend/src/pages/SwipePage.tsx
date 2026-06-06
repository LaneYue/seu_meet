import { ArrowLeft, Heart, Send, Share2, X } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BottomNav, StatusBar } from "../components/AppShell"
import { people } from "../data/mock/linkit"

export function SwipePage() {
  const navigate = useNavigate()
  const [index, setIndex] = useState(0)
  const person = people[index % people.length]

  const next = () => setIndex((i) => (i + 1) % people.length)
  const photos = ["/自习女.jpg", "/骑行1.jpg", "/草原.jpg", "/山间田野.jpg", "/早餐.jpg"]
  const photo = photos[index % 5]

  return (
    <div className="app-screen swipe-screen">
      <StatusBar />
      <img className="swipe-photo" src={photo} alt="" />
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
        <p>{person.school}</p>
        <div className="tag-row light">
          {person.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <p className="swipe-copy">{person.intro}</p>
        <small>推荐理由：你们都喜欢校园探索，标签高度重合。</small>
      </section>
      <div className="swipe-actions">
        <button onClick={next}><X size={28} /><span>跳过</span></button>
        <button className="send"><Send size={26} /><span>发请求</span></button>
        <button className="heart" onClick={next}><Heart size={28} /><span>喜欢</span></button>
      </div>
      <BottomNav />
    </div>
  )
}
