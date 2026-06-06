import { ArrowLeft, Edit3, ShieldCheck } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { StatusBar } from "../components/AppShell"
import { PublicProfileCard } from "../components/PublicProfileCard"
import { myProfile } from "../data/mock/linkit"

export function MyProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page my-profile-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>我的主页</h1>
            <p>别人刷到你时看到的公开名片</p>
          </div>
          <Link className="icon-button" to="/me/edit" aria-label="装点主页">
            <Edit3 size={19} />
          </Link>
        </header>

        <section className="profile-preview-frame">
          <PublicProfileCard
            profile={myProfile}
            className="static-profile-card"
            topSlot={<span className="profile-preview-label">公开预览</span>}
          />
        </section>

        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>主页不会展示真实姓名、学号、手机号。你可以随时调整展示图片、兴趣和介绍。</span>
        </section>
      </div>
    </div>
  )
}
