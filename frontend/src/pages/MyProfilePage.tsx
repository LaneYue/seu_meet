import { Edit3, Medal, MessageCircle, ShieldCheck, Coins } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, TabLayout } from "../components/AppShell"
import { myProfile, chats } from "../data/mock/linkit"
import { allAchievements } from "../data/achievements"

const MOCK_POINTS = 130

export function MyProfilePage() {
  const unlockedCount = allAchievements.filter((a) => a.unlocked).length
  const unreadTotal = chats.reduce((sum, c) => sum + (c.unread ?? 0), 0)

  return (
    <TabLayout>
      <div className="scroll-page my-profile-page">
        <header className="my-profile-header">
          <div className="my-profile-identity">
            <Avatar label="L" gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" size="lg" />
            <div>
              <strong>{myProfile.name}</strong>
              <p>{myProfile.school}</p>
              <span className="verified-badge">东大学生已认证</span>
            </div>
          </div>
          <Link className="icon-button" to="/me/edit" aria-label="编辑资料">
            <Edit3 size={19} />
          </Link>
        </header>

        {/* 点数卡片 */}
        <Link to="/points" className="points-card">
          <Coins size={22} />
          <div>
            <strong>{MOCK_POINTS} 点数</strong>
            <span>本周活动积攒 +18</span>
          </div>
          <span className="entry-arrow">→</span>
        </Link>

        {/* 消息入口 */}
        <Link to="/chats" className="profile-entry-row">
          <MessageCircle size={20} />
          <div>
            <strong>我的消息</strong>
            <span>{unreadTotal > 0 ? `${unreadTotal} 条未读` : "暂无新消息"}</span>
          </div>
          {unreadTotal > 0 && <b className="unread">{unreadTotal}</b>}
          <span className="entry-arrow">→</span>
        </Link>

        {/* 成就吧唧入口 */}
        <Link to="/achievements" className="profile-entry-row">
          <Medal size={20} />
          <div>
            <strong>我的成就吧唧</strong>
            <span>已解锁 {unlockedCount} / {allAchievements.length} 个</span>
          </div>
          <span className="entry-arrow">→</span>
        </Link>

        {/* 公开名片预览 */}
        <section className="profile-card-preview">
          <div className="section-title">
            <h2>公开名片预览</h2>
            <Link to="/me/edit">装点</Link>
          </div>
          <div className="profile-preview-mini">
            <p className="profile-post">{myProfile.post || "还没有写介绍，点击编辑添加"}</p>
            <div className="tag-row">
              {myProfile.interests.map((tag) => <span key={tag}>{tag}</span>)}
            </div>
          </div>
        </section>

        {/* 安全隐私 */}
        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>主页不会展示真实姓名、学号、手机号。</span>
        </section>
      </div>
    </TabLayout>
  )
}
