import { useEffect, useState } from "react"
import { ArrowLeft, Star, Send } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { http } from "../lib/http"

type Comparison = {
  question: { id: string; category: string; content: string }
  myAnswer: string
  otherAnswer: string
}

export function IcebreakResultPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()

  const [result, setResult] = useState<{
    myNickname: string
    otherNickname: string
    comparisons: Comparison[]
    canRate: boolean
  } | null>(null)
  const [score, setScore] = useState(0)
  const [rated, setRated] = useState(false)
  const [verdict, setVerdict] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    http.get<any>(`/questions/icebreak/${matchId}/result`)
      .then((data) => setResult(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [matchId])

  const handleRate = async () => {
    if (!matchId || score === 0) return
    try {
      const data = await http.post<any>(`/questions/icebreak/${matchId}/rate`, { score })
      setRated(true)
      if (data.stage === "UNLOCKED") {
        setVerdict(`🎉 破冰成功！你们可以开始聊天了`)
        setTimeout(() => {
          if (data.sessionId) navigate(`/chats/${data.sessionId}`)
        }, 3000)
      } else if (data.stage === "REJECTED") {
        setVerdict(`对方觉得不太合适，期待下一次相遇`)
        setTimeout(() => navigate("/home"), 3000)
      } else {
        setVerdict(`评分已提交，等待对方评分...`)
      }
    } catch { /* fallback */ }
  }

  if (loading) return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page" style={{ padding: 32, textAlign: "center" }}>
        <p>加载答案对比中...</p>
      </div>
    </div>
  )

  if (verdict) return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page" style={{ padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 32, display: "block", marginBottom: 12 }}>
          {verdict.includes("成功") ? "🎉" : verdict.includes("不太合适") ? "💔" : "✅"}
        </p>
        <h2>{verdict}</h2>
        {verdict.includes("成功") && <p style={{ color: "#888", marginTop: 8 }}>3秒后自动跳转到聊天...</p>}
        {verdict.includes("不太合适") && <p style={{ color: "#888", marginTop: 8 }}>3秒后返回发现页...</p>}
      </div>
    </div>
  )

  if (!result) return null

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page partner-post-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>答案对比</h1>
            <p>{result.myNickname} vs {result.otherNickname}</p>
          </div>
          <span />
        </header>

        {result.comparisons.map((c, i) => (
          <section className="glass-card" key={i}>
            <strong style={{ display: "block", marginBottom: 12 }}>Q: {c.question.content}</strong>
            <div className="editor-panel" style={{
              background: "#e3f2fd", padding: 12, borderRadius: 8, marginBottom: 8,
            }}>
              <span style={{ fontSize: 12, color: "#666" }}>你的答案</span>
              <p>{c.myAnswer}</p>
            </div>
            <div className="editor-panel" style={{
              background: "#fce4ec", padding: 12, borderRadius: 8,
            }}>
              <span style={{ fontSize: 12, color: "#666" }}>{result.otherNickname}的答案</span>
              <p>{c.otherAnswer}</p>
            </div>
          </section>
        ))}

        {result.canRate && !rated && (
          <section className="glass-card" style={{ textAlign: "center" }}>
            <h3 style={{ marginBottom: 12 }}>
              给 {result.otherNickname} 打分
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16 }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setScore(s)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 28,
                    color: s <= score ? "#f59e0b" : "#d1d5db",
                    transition: "color 0.2s",
                  }}
                  type="button"
                >
                  <Star size={32} fill={s <= score ? "#f59e0b" : "none"} />
                </button>
              ))}
            </div>
            <button
              className="full-width-action"
              onClick={handleRate}
              disabled={score === 0}
            >
              <Send size={16} /> 提交评分
            </button>
          </section>
        )}
      </div>
    </div>
  )
}
