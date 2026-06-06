import type { ReactNode } from "react"
import { Home, Map, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { chats } from "../data/mock/linkit"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return <main className="desktop-stage"><section className="phone-shell">{children}</section></main>
}

export function StatusBar() {
  return <div className="status-bar" />
}

export function BottomNav({ transparent }: { transparent?: boolean }) {
  const hasUnread = chats.some((c) => (c.unread ?? 0) > 0)

  return (
    <nav className={`bottom-nav${transparent ? " bottom-nav-transparent" : ""}`} aria-label="底部导航">
      <NavLink to="/routes" className={({ isActive }) => (isActive ? "active" : "")}>
        <Map size={20} />
        <span>路线</span>
      </NavLink>
      <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
        <Home size={20} />
        <span>同行</span>
      </NavLink>
      <NavLink to="/me" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-badge-wrap">
          <User size={20} />
          {hasUnread && <i />}
        </span>
        <span>我的</span>
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

export function Avatar({ label, gradient, size }: { label: string; gradient?: string; size?: "lg" | "sm" }) {
  const cls = size === "lg" ? " avatar-lg" : size === "sm" ? " avatar-sm" : ""
  return (
    <span className={`avatar${cls}`} style={{ background: gradient ?? "linear-gradient(135deg,#d1fae5,#bfdbfe)" }}>
      {label}
    </span>
  )
}
