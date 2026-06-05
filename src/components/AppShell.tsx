import {
  BadgeCheck,
  CircleUserRound,
  ClipboardList,
  HeartHandshake,
  LayoutDashboard,
  Map,
  MessageSquare,
  Route,
  Shield,
  Sparkles,
  Users
} from "lucide-react"
import Link from "next/link"

const navItems = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/profile", label: "资料", icon: CircleUserRound },
  { href: "/discover", label: "推荐", icon: Sparkles },
  { href: "/partners", label: "搭子", icon: Users },
  { href: "/relationship", label: "关系意向", icon: HeartHandshake },
  { href: "/routes", label: "路线", icon: Route },
  { href: "/badges", label: "徽章", icon: BadgeCheck },
  { href: "/chat", label: "聊天", icon: MessageSquare },
  { href: "/reputation", label: "信用", icon: Shield },
  { href: "/admin", label: "管理端", icon: ClipboardList }
]

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-campus text-white">
              <Map className="size-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-semibold text-ink">东大同行</span>
              <span className="block text-xs text-slate-500">校园可信社交与共同行动</span>
            </span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto pb-1 lg:pb-0" aria-label="主导航">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="focus-ring inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-mist hover:text-campus"
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">{children}</main>
    </div>
  )
}
