import { Plus, ShieldCheck } from "lucide-react"
import { Link } from "react-router-dom"
import { Avatar, Pill, TabLayout } from "../components/AppShell"
import { chats } from "../data/mock/linkit"

export function MessagesPage() {
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
        <div className="filter-row">
          {["全部", "搭子", "路线", "认真关系", "系统"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>
        <div className="chat-list">
          {chats.map((chat) => (
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
      </div>
    </TabLayout>
  )
}
