import {
  ArrowLeft,
  Award,
  Bell,
  CalendarCheck,
  CheckCircle2,
  Flag,
  MapPin,
  ShieldCheck,
  UserPlus,
  UserX,
  X
} from "lucide-react"
import type { ReactNode } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Pill, StatusBar } from "../components/AppShell"
import { badges, chats, routeSteps, routes } from "../data/mock/linkit"

function UtilityShell({
  title,
  subtitle,
  children
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  const navigate = useNavigate()

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page utility-page">
        <header className="simple-page-top">
          <button className="icon-button" onClick={() => navigate(-1)} aria-label="返回">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <span />
        </header>
        {children}
      </div>
    </div>
  )
}

export function BadgeWallPage() {
  return (
    <UtilityShell title="我的徽章墙" subtitle="记录你完成过的校园同行行动">
      <section className="badge-grid utility-grid">
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <article className="badge-item" key={badge.name}>
              <Icon size={26} />
              <strong>{badge.name}</strong>
              <span>{badge.level}</span>
            </article>
          )
        })}
      </section>
    </UtilityShell>
  )
}

export function BadgeApplyPage() {
  return (
    <UtilityShell title="申请电子吧唧" subtitle="完成官方路线后可生成纪念徽章">
      <section className="glass-card action-panel">
        <Award size={32} />
        <div>
          <h2>九龙湖学习纪念吧唧</h2>
          <p>当前已满足 2 项条件。完成一条官方路线并确认守约状态后，即可提交申请。</p>
        </div>
      </section>
      <section className="glass-card checklist-card">
        {["完成校内认证", "完成 1 次公共空间路线同行", "确认活动守约状态"].map((item, index) => (
          <p key={item}><CheckCircle2 size={17} />{item}<Pill tone={index < 2 ? "green" : "gray"}>{index < 2 ? "已完成" : "待完成"}</Pill></p>
        ))}
      </section>
      <Link className="full-width-action" to="/routes">去完成路线</Link>
    </UtilityShell>
  )
}

export function RouteCheckInPage() {
  const { routeId } = useParams()
  const route = routes.find((item) => item.id === routeId) ?? routes[0]

  return (
    <UtilityShell title="继续打卡" subtitle={route.title}>
      <section className="glass-card checklist-card">
        {routeSteps.map((step, index) => (
          <p key={step.title}>
            <span className="step-dot compact">{index + 1}</span>
            <span>{step.title}</span>
            <Pill tone={index < 2 ? "green" : index === 2 ? "orange" : "gray"}>{step.status}</Pill>
          </p>
        ))}
      </section>
      <section className="safe-notice">
        <MapPin size={18} />
        <span>打卡只记录路线节点完成状态，不展示实时定位。</span>
      </section>
    </UtilityShell>
  )
}

export function RouteInvitePage() {
  const { routeId } = useParams()
  const route = routes.find((item) => item.id === routeId) ?? routes[0]

  return (
    <UtilityShell title="邀请同行" subtitle={route.title}>
      <section className="glass-card action-panel">
        <UserPlus size={32} />
        <div>
          <h2>生成路线邀请</h2>
          <p>邀请会展示路线标题、集合校区和安全提示，对方同意后进入路线小队消息。</p>
        </div>
      </section>
      <Link className="full-width-action" to="/chats">发送到消息</Link>
    </UtilityShell>
  )
}

export function SafetyCenterPage() {
  return (
    <UtilityShell title="安全中心" subtitle="校内可信与低压力社交的边界">
      <section className="glass-card checklist-card">
        {["首次见面请选择校园公共空间", "不展示真实姓名、学号、手机号", "可以随时举报、拉黑或结束匹配", "认真关系频道不参与公开榜单"].map((item) => (
          <p key={item}><ShieldCheck size={17} />{item}</p>
        ))}
      </section>
    </UtilityShell>
  )
}

export function NotificationsPage() {
  return (
    <UtilityShell title="系统通知" subtitle="活动、路线和安全提醒">
      <section className="chat-list">
        {["今晚 19:00 自习搭子即将开始", "你获得了新的路线徽章", "首次同行建议选择公共空间"].map((item) => (
          <article className="chat-card notice-card" key={item}>
            <Bell size={22} />
            <div>
              <strong>{item}</strong>
              <p>刚刚</p>
            </div>
          </article>
        ))}
      </section>
    </UtilityShell>
  )
}

export function ChatConfirmActivityPage() {
  const { chatId } = useParams()
  const chat = chats.find((item) => item.id === chatId) ?? chats[0]

  return (
    <UtilityShell title="确认活动时间" subtitle={chat.name}>
      <section className="glass-card action-panel">
        <CalendarCheck size={32} />
        <div>
          <h2>今晚 19:00 图书馆自习</h2>
          <p>确认后会同步到路线小队，并在活动结束后提醒双方确认守约状态。</p>
        </div>
      </section>
      <Link className="full-width-action" to={`/chats/${chat.id}`}>确认并返回聊天</Link>
    </UtilityShell>
  )
}

export function ChatReportPage() {
  return (
    <UtilityShell title="举报" subtitle="提交后平台会优先处理安全风险">
      <section className="glass-card action-panel">
        <Flag size={32} />
        <div>
          <h2>选择举报原因</h2>
          <p>骚扰、不安全见面要求、虚假信息或其他不适行为。</p>
        </div>
      </section>
    </UtilityShell>
  )
}

export function ChatBlockPage() {
  return (
    <UtilityShell title="拉黑确认" subtitle="拉黑后对方无法继续联系你">
      <section className="glass-card action-panel">
        <UserX size={32} />
        <div>
          <h2>确认拉黑该会话？</h2>
          <p>你可以在安全中心管理拉黑名单。</p>
        </div>
      </section>
    </UtilityShell>
  )
}

export function ChatEndPage() {
  return (
    <UtilityShell title="结束匹配" subtitle="低压力地停止这次互动">
      <section className="glass-card action-panel">
        <X size={32} />
        <div>
          <h2>结束后不会通知公开列表</h2>
          <p>会话将归档，你仍然可以提交守约反馈。</p>
        </div>
      </section>
    </UtilityShell>
  )
}
