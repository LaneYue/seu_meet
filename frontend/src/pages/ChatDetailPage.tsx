import { ArrowLeft, Flag, MoreHorizontal, Send, ShieldCheck, UserX, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { StatusBar, Avatar } from "../components/AppShell"
import { chats } from "../data/mock/linkit"
import { http } from "../lib/http"
import { linkitService } from "../services/linkitService"

type Message = {
  id: string
  type: string
  content: string
  senderId: string
  isMe: boolean
  createdAt: string
  readAt: string | null
}

export function ChatDetailPage() {
  const { chatId } = useParams()
  const navigate = useNavigate()

  const chat = chats.find((item) => item.id === chatId) ?? chats[0]

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const currentUserId = localStorage.getItem("currentUserId") ?? ""

  // 加载历史消息
  useEffect(() => {
    if (!chatId) return
    http.get<{ list: Message[] }>(`/chat/sessions/${chatId}/messages?limit=50`)
      .then((data) => {
        setMessages(data.list)
        // 标记已读
        linkitService.messages.markRead(chatId)
      })
      .catch(() => {
        // mock fallback
        setMessages([
          { id: "m1", type: "text", content: "你好呀，我看到你也想找算法题搭子。", senderId: "other", isMe: false, createdAt: new Date().toISOString(), readAt: null },
          { id: "m2", type: "text", content: "可以！我今晚在九龙湖图书馆。", senderId: "me", isMe: true, createdAt: new Date().toISOString(), readAt: null },
          { id: "m3", type: "text", content: "那我们先从一小时刷题开始，轻松一点。", senderId: "other", isMe: false, createdAt: new Date().toISOString(), readAt: null },
        ])
      })
      .finally(() => setLoading(false))
  }, [chatId])

  // WebSocket 实时消息
  useEffect(() => {
    if (!chatId) return

    const token = localStorage.getItem("token")
    if (!token) return

    // 使用原生 WebSocket 连接后端 Socket.IO（简化版，项目已有 socket.io-client 但这里用 fetch-based polling 做降级）
    const pollInterval = setInterval(async () => {
      try {
        const data = await http.get<{ list: Message[] }>(`/chat/sessions/${chatId}/messages?limit=1`)
        if (data.list.length > 0) {
          const latest = data.list[0]
          if (!messages.find((m) => m.id === latest.id)) {
            setMessages((prev) => [...prev.filter((m) => m.id !== latest.id), latest])
          }
        }
      } catch { /* skip */ }
    }, 3000)

    return () => clearInterval(pollInterval)
  }, [chatId, messages.length])

  // 滚动到底部
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !chatId) return
    const content = input.trim()
    setInput("")
    try {
      await linkitService.messages.sendMessage({ chatId, content })
      // 乐观更新
      setMessages((prev) => [...prev, {
        id: `local-${Date.now()}`,
        type: "text",
        content,
        senderId: "me",
        isMe: true,
        createdAt: new Date().toISOString(),
        readAt: null,
      }])
    } catch { /* fallback */ }
  }

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

        {loading && <p style={{ textAlign: "center", padding: 20, color: "#888" }}>加载消息中...</p>}

        <div className="message-thread">
          {messages.map((msg) => (
            <p className={`message-bubble ${msg.isMe ? "mine" : ""}`} key={msg.id}>
              {msg.content}
              {msg.readAt && msg.isMe && <span className="read-check"> ✓✓</span>}
            </p>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="chat-actions">
        <button onClick={() => navigate(`/chats/${chatId}/report`)}><Flag size={17} />举报</button>
        <button onClick={() => navigate(`/chats/${chatId}/block`)}><UserX size={17} />拉黑</button>
        <button onClick={() => navigate(`/chats/${chatId}/end`)}><X size={17} />结束匹配</button>
      </div>

      <form className="chat-composer" onSubmit={(e) => { e.preventDefault(); handleSend() }}>
        <input
          placeholder="友好地说点什么"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit"><Send size={18} /></button>
      </form>
    </div>
  )
}
