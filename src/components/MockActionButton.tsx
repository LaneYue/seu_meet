"use client"

import { useState } from "react"

export function MockActionButton({ label, doneLabel = "已记录" }: { label: string; doneLabel?: string }) {
  const [done, setDone] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setDone(true)}
      className="focus-ring inline-flex min-h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700"
      disabled={done}
    >
      {done ? doneLabel : label}
    </button>
  )
}
