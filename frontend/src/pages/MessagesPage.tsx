import { Bell, Plus, ShieldCheck } from "lucide-react"
import { Link, useParams } from "react-router-dom"
import { Avatar, Pill, TabLayout } from "../components/AppShell"
import { chats } from "../data/mock/linkit"

const messageCategories = [
  { key: "all", label: "全部", title: "全部消息", desc: "查看所有同行沟通与系统提醒" },
  { key: "partners", label: "搭子", title: "搭子消息", desc: "搭子申请、活动通知和双向匹配聊天" },
  { key: "routes", label: "路线", title: "路线小队", desc: "路线队伍、打卡进度和徽章提醒" },
  { key: "relationship", label: "认真关系", title: "认真关系", desc: "更慢一点、更认真一点的互动消息" },
  { key: "system", label: "系统", title: "系统提醒", desc: "安全中心、认证状态和平台通知" }
]

const categoryChatIds: Record<string, string[]> = {
  all: chats.map((chat) => chat.id),
  partners: ["xiaocheng"],
  routes: ["badminton-team"],
  relationship: [],
  system: ["safety"]
}

export function MessagesPage() {
  const { category = "all" } = useParams()
  const activeCategory = messageCategories.find((item) => item.key === category) ?? messageCategories[0]
  const visibleChats = chats.filter((chat) => categoryChatIds[activeCategory.key]?.includes(chat.id))

  return (
    <TabLayout>
      <div className="scroll-page messages-page">
        <header className="page-top">
          <div>
            <h1>消息</h1>
            <p>安全、友好、低压力地沟通</p>
          </div>
          <div className="top-actions">
            <Link className="icon-button" to="/safety" aria-label="安全中心"><ShieldCheck size={19} /></Link>
            <Link className="icon-button" to="/notifications" aria-label="系统通知"><Plus size={19} /></Link>
          </div>
        </header>
        <nav className="filter-row" aria-label="消息分类">
          {messageCategories.map((item) => (
            <Link
              className={item.key === activeCategory.key ? "selected" : ""}
              key={item.key}
              to={item.key === "all" ? "/chats" : `/chats/category/${item.key}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="partner-category-panel message-category-panel">
          <strong>{activeCategory.title}</strong>
          <p>{activeCategory.desc}</p>
        </section>

        {visibleChats.length > 0 ? (
          <div className="chat-list">
            {visibleChats.map((chat) => (
              <Link className="chat-card" to={`/chats/${chat.id}`} key={chat.id}>
                <Avatar label={chat.avatar} />
                <div>
                  <div className="card-line">
                    <strong>{chat.name}</strong>
                    <span>{chat.time}</span>
                  </div>
                  <Pill tone={chat.tag.includes("系统") ? "orange" : "blue"}>{chat.tag}</Pill>
                  <p>{chat.message}</p>
                </div>
                {chat.unread > 0 && <b className="unread">{chat.unread}</b>}
              </Link>
            ))}
          </div>
        ) : (
          <section className="empty-state-card">
            <Bell size={24} />
            <strong>暂时没有新消息</strong>
            <p>当你收到新的认真关系意向或活动提醒时，会显示在这里。</p>
          </section>
        )}
      </div>
    </TabLayout>
  )
}
