import { useState } from "react"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { routesApi } from "../lib/api-routes"

type Step = { title: string; desc: string; method: string }

const CAMPUSES = ["九龙湖", "四牌楼", "丁家桥", "跨校区"]
const TAGS = ["学习", "文化", "运动", "美食", "公益", "探索"]
const CHECK_METHODS = ["扫码打卡", "计时打卡", "文字打卡", "拍照打卡"]

export function RoutePublishPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState("")
  const [campus, setCampus] = useState("九龙湖")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [intro, setIntro] = useState("")
  const [budget, setBudget] = useState("")
  const [price, setPrice] = useState(0)
  const [steps, setSteps] = useState<Step[]>([{ title: "", desc: "", method: "扫码打卡" }])
  const [submitted, setSubmitted] = useState(false)

  const toggleTag = (tag: string) =>
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])

  const addStep = () => setSteps((prev) => [...prev, { title: "", desc: "", method: "扫码打卡" }])
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i))
  const updateStep = (i: number, field: keyof Step, value: string) =>
    setSteps((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))

  const canSubmit = title.trim() && intro.trim() && steps.every((s) => s.title.trim())

  const handleSubmit = async () => {
    if (!canSubmit) return
    try {
      await routesApi.publishRoute({ title, campus, tags: selectedTags, intro, budget, price, steps })
    } catch {
      // 后端不可达时仍展示成功（mock 模式）
    }
    setSubmitted(true)
    setTimeout(() => navigate("/routes"), 1500)
  }

  if (submitted) {
    return (
      <div className="app-screen detail-screen">
        <StatusBar />
        <div className="publish-success">
          <span className="publish-success-icon">🎉</span>
          <strong>路线发布成功！</strong>
          <p>获得 +3 点数奖励，正在跳转…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page route-publish-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>发布路线</h1>
            <p>发布后获得 +3 点数奖励</p>
          </div>
        </header>

        {/* 基本信息 */}
        <section className="publish-section">
          <label className="publish-label">路线标题</label>
          <input
            className="publish-input"
            placeholder="如：九龙湖情侣限定一日游"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={30}
          />

          <label className="publish-label">所属校区</label>
          <div className="filter-row">
            {CAMPUSES.map((c) => (
              <button key={c} className={campus === c ? "selected" : ""} onClick={() => setCampus(c)}>{c}</button>
            ))}
          </div>

          <label className="publish-label">标签（可多选）</label>
          <div className="filter-row">
            {TAGS.map((t) => (
              <button key={t} className={selectedTags.includes(t) ? "selected" : ""} onClick={() => toggleTag(t)}>{t}</button>
            ))}
          </div>

          <label className="publish-label">路线简介</label>
          <textarea
            className="publish-textarea"
            placeholder="描述这条路线的亮点和体验…"
            value={intro}
            onChange={(e) => setIntro(e.target.value)}
            rows={3}
            maxLength={200}
          />

          <label className="publish-label">预算参考</label>
          <input
            className="publish-input"
            placeholder="如：人均 0 元 / 约 10 元"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
        </section>

        {/* 路线节点 */}
        <section className="publish-section">
          <div className="section-title">
            <h2>路线节点</h2>
            <button onClick={addStep}><Plus size={15} /> 添加</button>
          </div>
          {steps.map((step, i) => (
            <div className="publish-step-card" key={i}>
              <div className="publish-step-header">
                <span className="step-dot compact">{i + 1}</span>
                <input
                  className="publish-input flex-1"
                  placeholder="节点名称"
                  value={step.title}
                  onChange={(e) => updateStep(i, "title", e.target.value)}
                />
                {steps.length > 1 && (
                  <button className="icon-button danger" onClick={() => removeStep(i)}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
              <input
                className="publish-input"
                placeholder="节点描述（可选）"
                value={step.desc}
                onChange={(e) => updateStep(i, "desc", e.target.value)}
              />
              <select
                className="publish-select"
                value={step.method}
                onChange={(e) => updateStep(i, "method", e.target.value)}
              >
                {CHECK_METHODS.map((m) => <option key={m}>{m}</option>)}
              </select>
            </div>
          ))}
        </section>

        {/* 定价 */}
        <section className="publish-section">
          <label className="publish-label">定价（点数）</label>
          <div className="price-row">
            {[0, 5, 10, 20, 30, 50].map((p) => (
              <button key={p} className={price === p ? "selected" : ""} onClick={() => setPrice(p)}>
                {p === 0 ? "免费" : `${p} 点`}
              </button>
            ))}
          </div>
          {price > 0 && <p className="publish-hint">购买者支付 {price} 点数，其中 {price} 点归你</p>}
        </section>

        <button
          className={`full-width-action ${!canSubmit ? "disabled" : ""}`}
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          发布路线
        </button>
      </div>
    </div>
  )
}
