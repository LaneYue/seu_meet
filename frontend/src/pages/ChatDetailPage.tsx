import { ArrowLeft, CalendarDays, Flag, MoreHorizontal, Send, ShieldCheck, UserX, X } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { chats } from "../data/mock/linkit"

export function ChatDetailPage() {
  const { chatId } = useParams()
  const chat = chats.find((item) => item.id === chatId) ?? chats[0]
  const navigate = useNavigate()

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <header className="chat-top">
        <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
        <div>
          <strong>{chat.name}</strong>
          <span>{chat.tag}</span>
        </div>
        <button aria-label="更多"><MoreHorizontal size={21} /></button>
      </header>
      <div className="scroll-page chat-detail-page">
        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>首次见面请选择校园公共空间，你可以随时举报或结束匹配。</span>
        </section>
        <section className="inline-action-card">
          <CalendarDays size={20} />
          <div>
            <strong>今晚 19:00 图书馆自习</strong>
            <p>确认活动时间后，将同步到路线小队。</p>
          </div>
          <button onClick={() => navigate(`/chats/${chat.id}/confirm-activity`)}>确认</button>
        </section>
        <div className="message-thread">
          <p className="message-bubble">你好呀，我看到你也想找算法题搭子。</p>
          <p className="message-bubble mine">可以！我今晚在九龙湖图书馆。</p>
          <p className="message-bubble">那我们先从一小时刷题开始，轻松一点。</p>
        </div>
      </div>
      <div className="chat-actions">
        <button onClick={() => navigate(`/chats/${chat.id}/report`)}><Flag size={17} />举报</button>
        <button onClick={() => navigate(`/chats/${chat.id}/block`)}><UserX size={17} />拉黑</button>
        <button onClick={() => navigate(`/chats/${chat.id}/end`)}><X size={17} />结束匹配</button>
      </div>
      <form className="chat-composer">
        <input placeholder="友好地说点什么" />
        <button type="button"><Send size={18} /></button>
      </form>
    </div>
  )
}
