import Link from "next/link"
import type { ReactNode } from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="text-sm font-semibold text-campus">{eyebrow}</p> : null}
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-ink md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 text-base leading-7 text-slate-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-slate-200 bg-white p-5 shadow-soft ${className}`}>{children}</section>
}

export function Stat({ label, value, tone = "campus" }: { label: string; value: string | number; tone?: "campus" | "lake" | "brick" | "gold" }) {
  const color = {
    campus: "text-campus",
    lake: "text-lake",
    brick: "text-brick",
    gold: "text-gold"
  }[tone]
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  )
}

export function BadgePill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "blue" | "gold" | "red" }) {
  const styles = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    blue: "border-sky-200 bg-sky-50 text-sky-700",
    gold: "border-amber-200 bg-amber-50 text-amber-700",
    red: "border-rose-200 bg-rose-50 text-rose-700"
  }[tone]
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${styles}`}>{children}</span>
}

export function ActionLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="focus-ring inline-flex min-h-10 items-center justify-center rounded-md bg-campus px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
    >
      {children}
    </Link>
  )
}

export function GhostButton({ children }: { children: ReactNode }) {
  return (
    <button className="focus-ring inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
      {children}
    </button>
  )
}

export function SafetyNotice() {
  return (
    <Card className="border-amber-200 bg-amber-50 shadow-none">
      <h2 className="text-base font-semibold text-amber-900">安全提醒</h2>
      <div className="mt-3 grid gap-2 text-sm leading-6 text-amber-900 md:grid-cols-2">
        <p>首次见面建议选择校园公共空间，不展示实时定位和宿舍楼栋。</p>
        <p>如遇骚扰、诱导不安全见面或刷分行为，请立即举报、拉黑或取消匹配。</p>
      </div>
    </Card>
  )
}
