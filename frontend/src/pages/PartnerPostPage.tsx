import { ArrowLeft, CalendarDays, MapPin, Send, Users } from "lucide-react"
import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"

const typeOptions = ["学习", "运动", "生活", "兴趣"]

export function PartnerPostPage() {
  const navigate = useNavigate()
  const [type, setType] = useState("学习")

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
            <input defaultValue="今晚图书馆自习搭子" placeholder="例如：今晚图书馆自习搭子" />
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
                  {item}
                </button>
              ))}
            </div>
          </div>

          <label>
            <span><CalendarDays size={16} />时间</span>
            <input defaultValue="今天 19:00-22:00" placeholder="今天 19:00-22:00" />
          </label>

          <label>
            <span><MapPin size={16} />地点</span>
            <input defaultValue="九龙湖图书馆 · 研习区" placeholder="建议选择校园公共空间" />
          </label>

          <label>
            <span><Users size={16} />人数上限</span>
            <input defaultValue="6" inputMode="numeric" />
          </label>

          <label>
            <span><Send size={16} />补充说明</span>
            <textarea defaultValue="一起专注学习，互相监督，结束后确认守约状态。" rows={4} />
          </label>
        </section>

        <section className="safe-notice">
          <MapPin size={18} />
          <span>首次见面建议选择图书馆、教学楼、食堂等校园公共空间。</span>
        </section>

        <Link className="full-width-action" to="/partners">发布并返回广场</Link>
      </div>
    </div>
  )
}
