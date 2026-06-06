import type { ReactNode } from "react"
import { Home, Map, MessageCircle } from "lucide-react"
import { NavLink } from "react-router-dom"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return <main className="desktop-stage"><section className="phone-shell">{children}</section></main>
}

export function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <span className="signal">▮▮▮ 5G ▰</span>
    </div>
  )
}

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="底部导航">
      <NavLink to="/routes" className={({ isActive }) => (isActive ? "active" : "")}>
        <Map size={20} />
        <span>路线</span>
      </NavLink>
      <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
        <Home size={20} />
        <span>同行</span>
      </NavLink>
      <NavLink to="/chats" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-badge-wrap">
          <MessageCircle size={20} />
          <i />
        </span>
        <span>消息</span>
      </NavLink>
    </nav>
  )
}

export function TabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-screen with-tabbar">
      <StatusBar />
      {children}
      <BottomNav />
    </div>
  )
}

export function Pill({ children, tone = "green" }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

export function Avatar({ label, gradient }: { label: string; gradient?: string }) {
  return (
    <span className="avatar" style={{ background: gradient ?? "linear-gradient(135deg,#d1fae5,#bfdbfe)" }}>
      {label}
    </span>
  )
}
