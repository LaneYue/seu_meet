import { ArrowLeft, CheckCircle2, Heart, Share2, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Pill, StatusBar } from "../components/AppShell"
import { discoverProfiles } from "../data/mock/linkit"
import { linkitService } from "../services/linkitService"

export function ProfileDetailPage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const profile = discoverProfiles.find((item) => item.id === profileId) ?? discoverProfiles[0]
  const [matched, setMatched] = useState<{ matchId: string; sessionId: string } | null>(null)

  const handleInterested = async () => {
    try {
      const result = await linkitService.discover.recordSwipe({
        profileId: profile.id,
        action: "like",
      }) as any
      if (result?.matched) {
        setMatched({ matchId: result.matchId, sessionId: result.sessionId })
      }
    } catch { /* fallback */ }
  }

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page profile-detail-page">
        <header className="profile-detail-hero">
          <img src={profile.photos[0]} alt="" />
          <div className="detail-hero-actions">
            <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
            <button aria-label="分享"><Share2 size={20} /></button>
          </div>
          <div className="profile-detail-title">
            <Pill tone="green"><CheckCircle2 size={13} />{profile.verified}</Pill>
            <h1>{profile.name}<span>{profile.gender} {profile.age}</span></h1>
            <p>{profile.school}</p>
          </div>
        </header>

        <section className="glass-card">
          <div className="section-title"><h2>发布的信息</h2></div>
          <p>{profile.post}</p>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>分享图片</h2></div>
          <div className="profile-photo-grid">
            {profile.photos.map((photo) => <img src={photo} alt="" key={photo} />)}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>爱好</h2></div>
          <div className="tag-row">
            {profile.interests.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </section>

        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>{profile.safety}</span>
        </section>

        <section className="detail-actions">
          {matched ? (
            <>
              <p style={{ textAlign: "center", marginBottom: 8 }}>🎉 匹配成功！</p>
              <button className="primary-action" onClick={() => navigate(`/icebreak/${matched.matchId}`)}>
                去答题
              </button>
            </>
          ) : (
            <>
              <button className="primary-action" onClick={handleInterested}>
                <Heart size={16} /> 感兴趣，加好友
              </button>
              <button onClick={() => navigate("/home")}>返回推送</button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
