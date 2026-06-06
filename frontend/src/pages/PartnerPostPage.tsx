import { ArrowLeft, CalendarDays, MapPin, Send, Users } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { linkitService } from "../services/linkitService"

const typeOptions = ["study", "sport", "life", "interest"]
const typeLabels: Record<string, string> = { study: "学习", sport: "运动", life: "生活", interest: "兴趣" }

export function PartnerPostPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("study")
  const [title, setTitle] = useState("")
  const [time, setTime] = useState("")
  const [place, setPlace] = useState("")
  const [capacity, setCapacity] = useState(6)
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = title.trim() && time.trim() && place.trim()

  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    try {
      await linkitService.partners.createPost({
        title, type: type as any, time, place, capacity, note,
      })
    } catch { /* fallback */ }
    navigate("/partners")
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page partner-post-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>发布同行任务</h1>
            <p>用清楚、低压力的方式发起一次共同行动</p>
          </div>
          <span />
        </header>

        <section className="glass-card editor-panel">
          <label>
            <span><Send size={16} />任务标题</span>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="例如：今晚图书馆自习搭子" />
          </label>

          <div>
            <span className="editor-label"><Users size={16} />任务类型</span>
            <div className="segmented-options">
              {typeOptions.map((item) => (
                <button
                  className={type === item ? "selected" : ""}
                  key={item}
                  onClick={() => setType(item)}
                  type="button"
                >
                  {typeLabels[item]}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span><CalendarDays size={16} />时间</span>
            <input value={time} onChange={e => setTime(e.target.value)} placeholder="今天 19:00-22:00" />
          </label>

          <label>
            <span><MapPin size={16} />地点</span>
            <input value={place} onChange={e => setPlace(e.target.value)} placeholder="建议选择校园公共空间" />
          </label>

          <label>
            <span><Users size={16} />人数上限</span>
            <input value={capacity} onChange={e => setCapacity(Number(e.target.value) || 2)} inputMode="numeric" />
          </label>

          <label>
            <span><Send size={16} />补充说明</span>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="一起专注学习，互相监督..." rows={4} />
          </label>
        </section>

        <section className="safe-notice">
          <MapPin size={18} />
          <span>首次见面建议选择图书馆、教学楼、食堂等校园公共空间。</span>
        </section>

        <button
          className={`full-width-action ${!canSubmit ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? "发布中..." : "发布并返回广场"}
        </button>
      </div>
    </div>
  )
}
