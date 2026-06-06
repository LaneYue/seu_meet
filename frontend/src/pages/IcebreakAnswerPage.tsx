import { useEffect, useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { http } from "../lib/http"

type Question = {
  id: string
  category: string
  content: string
}

export function IcebreakAnswerPage() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<string[]>(["", "", ""])
  const [currentStep, setCurrentStep] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!matchId) return
    http.get<{ questions: Question[] }>(`/questions/icebreak/${matchId}`)
      .then((data) => setQuestions(data.questions))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [matchId])

  const handleSubmit = async () => {
    if (!matchId) return
    try {
      await http.post(`/questions/icebreak/${matchId}/answer`, {
        answers: questions.map((q, i) => ({ questionId: q.id, content: answers[i] })),
      })
      setSubmitted(true)
    } catch { /* fallback */ }
  }

  const allFilled = answers.every((a) => a.trim().length >= 10)

  if (loading) return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page" style={{ padding: 32, textAlign: "center" }}>
        <p>加载问题中...</p>
      </div>
    </div>
  )

  if (submitted) return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page" style={{ padding: 32, textAlign: "center" }}>
        <p className="publish-success-icon" style={{ fontSize: 48, display: "block", marginBottom: 12 }}>📝</p>
        <h2>答案已提交</h2>
        <p style={{ color: "#888", marginTop: 8 }}>等待对方完成答题后，将自动跳转到答案对比页面</p>
        <p style={{ color: "#888" }}>
          你也可以稍后从消息页查看结果
        </p>
      </div>
    </div>
  )

  const q = questions[currentStep]

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page partner-post-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>破冰问答</h1>
            <p>认真回答，让对方更了解你 — {currentStep + 1}/3</p>
          </div>
          <span />
        </header>

        <section className="glass-card editor-panel">
          <div style={{ marginBottom: 16 }}>
            <strong style={{ fontSize: 16 }}>Q: {q?.content}</strong>
          </div>
          <label>
            <span>你的答案</span>
            <textarea
              value={answers[currentStep]}
              onChange={(e) => {
                const next = [...answers]
                next[currentStep] = e.target.value
                setAnswers(next)
              }}
              rows={5}
              placeholder="在这里写下你的答案...（至少10字）"
            />
          </label>
        </section>

        <div className="detail-actions">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((s) => s - 1)}
          >
            上一题
          </button>
          {currentStep < 2 ? (
            <button
              className="primary-action"
              onClick={() => setCurrentStep((s) => s + 1)}
              disabled={answers[currentStep].trim().length < 10}
            >
              下一题
            </button>
          ) : (
            <button
              className="primary-action"
              onClick={handleSubmit}
              disabled={!allFilled}
            >
              <Send size={16} /> 提交，不可修改
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
