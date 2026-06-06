import { ArrowLeft, Image, Save, Sparkles } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { PublicProfileCard } from "../components/PublicProfileCard"
import { myProfile, updateMockProfile } from "../data/mock/linkit"
import { linkitService } from "../services/linkitService"

const themePhotos = [
  { label: "校园湖畔", url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80" },
  { label: "学习桌面", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" },
  { label: "城市漫步", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80" },
]

export function MyProfileEditPage() {
  const navigate = useNavigate()
  const [post, setPost] = useState(myProfile.post)
  const [interests, setInterests] = useState(myProfile.interests.join("、"))
  const [photo, setPhoto] = useState(myProfile.photos[0])
  const [saving, setSaving] = useState(false)

  const interestList = interests.split(/[、,，]/).map((item) => item.trim()).filter(Boolean).slice(0, 6)

  const previewProfile = useMemo(() => ({
    ...myProfile,
    post,
    interests: interestList,
    photos: [photo, ...myProfile.photos.slice(1)],
  }), [interests, photo, post])

  const handleSave = async () => {
    setSaving(true)
    // 1. 先更新内存 mock（即时生效，不依赖后端）
    updateMockProfile({ post, interests: interestList, photos: [photo, ...myProfile.photos.slice(1)] })
    // 2. 尝试同步到后端
    try {
      await linkitService.profile.updateMe({ post, interests: interestList })
    } catch { /* 后端不可达时 mock 已生效 */ }
    setSaving(false)
    navigate("/me")
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page profile-editor-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={20} /></button>
          <div><h1>装点主页</h1><p>编辑别人刷到你时看到的名片</p></div>
          <button className="icon-button" onClick={handleSave} aria-label="保存装点" disabled={saving}><Save size={19} /></button>
        </header>

        <section className="glass-card editor-panel">
          <label><span><Sparkles size={16} />主页文案</span><textarea value={post} onChange={(e) => setPost(e.target.value)} rows={4} /></label>
          <label><span><Sparkles size={16} />兴趣标签</span><input value={interests} onChange={(e) => setInterests(e.target.value)} /></label>
          <div>
            <span className="editor-label"><Image size={16} />主页封面</span>
            <div className="theme-photo-row">
              {themePhotos.map((item) => (
                <button className={photo === item.url ? "selected" : ""} key={item.url}
                  onClick={() => setPhoto(item.url)} type="button">
                  <img src={item.url} alt="" /><span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="profile-preview-frame editor-preview">
          <PublicProfileCard profile={previewProfile} className="static-profile-card"
            topSlot={<span className="profile-preview-label">实时预览</span>} />
        </section>

        <Link className="full-width-action" to="/me">{saving ? "保存中..." : "完成预览"}</Link>
      </div>
    </div>
  )
}
