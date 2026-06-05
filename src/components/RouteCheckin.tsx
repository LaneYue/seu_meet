"use client"

import { CheckCircle2 } from "lucide-react"
import { useMemo, useState } from "react"
import type { CampusRoute } from "@/types"

export function RouteCheckin({ route }: { route: CampusRoute }) {
  const [completed, setCompleted] = useState<string[]>([])
  const complete = (stopId: string) => setCompleted((items) => (items.includes(stopId) ? items : [...items, stopId]))
  const done = completed.length === route.stops.length
  const percent = useMemo(() => Math.round((completed.length / route.stops.length) * 100), [completed.length, route.stops.length])

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">路线打卡</h2>
          <p className="mt-1 text-sm text-slate-500">MVP 使用手动 / mock QR 打卡，不读取真实定位。</p>
        </div>
        <span className="text-sm font-semibold text-campus">{percent}%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-campus transition-all" style={{ width: `${percent}%` }} />
      </div>
      <div className="mt-5 space-y-3">
        {route.stops.map((stop, index) => {
          const isDone = completed.includes(stop.id)
          return (
            <div key={stop.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-mist text-sm font-semibold text-campus">
                {isDone ? <CheckCircle2 className="size-5" /> : index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{stop.title}</p>
                <p className="mt-1 text-sm text-slate-500">{stop.description}</p>
                {stop.taskPrompt ? <p className="mt-1 text-sm text-slate-600">任务：{stop.taskPrompt}</p> : null}
              </div>
              <button
                type="button"
                onClick={() => complete(stop.id)}
                disabled={isDone}
                className="focus-ring min-h-9 shrink-0 rounded-md bg-campus px-3 py-2 text-sm font-semibold text-white disabled:bg-emerald-100 disabled:text-emerald-700"
              >
                {isDone ? "已打卡" : stop.checkinMethod === "qr_mock" ? "mock QR" : "打卡"}
              </button>
            </div>
          )
        })}
      </div>
      {done ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
          路线完成：可解锁相关徽章，同行值增加 20 分。
        </div>
      ) : null}
    </div>
  )
}
