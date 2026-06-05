import { ShieldCheck } from "lucide-react"
import { BadgePill, Card, PageHeader, Stat } from "@/components/ui"
import { currentUserId, reports, scoreLogs, trustProfiles } from "@/data/mock"
import { calculateCompanionScore, describeTrust } from "@/lib/trust/trustEngine"

export default function ReputationPage() {
  const trust = trustProfiles.find((item) => item.userId === currentUserId)
  const companion = calculateCompanionScore(currentUserId, scoreLogs)
  const myReports = reports.filter((report) => report.reporterId === currentUserId)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Reputation"
        title="我的信用状态与守约记录"
        description="信用分只用于平台治理和风控，不用于公开排名；同行值鼓励共同行动，但认真关系频道不进入公开榜单。"
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="信任分" value={trust?.trustScore ?? 0} tone="campus" />
        <Stat label="信用状态" value={trust?.status ?? "normal"} tone="lake" />
        <Stat label="同行值" value={companion.cappedTotal} tone="gold" />
        <Stat label="今日计入" value={`${companion.today}/${companion.dailyCap}`} tone="brick" />
      </div>
      <Card>
        <div className="flex items-center gap-2 text-campus">
          <ShieldCheck className="size-5" />
          <h2 className="text-lg font-semibold">风控说明</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-slate-600">{trust ? describeTrust(trust) : "状态正常"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <BadgePill>爽约 -10</BadgePill>
          <BadgePill>恶意刷打卡 -20</BadgePill>
          <BadgePill>有效骚扰举报 -40</BadgePill>
          <BadgePill tone="green">连续守约 +10</BadgePill>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-ink">同行值记录</h2>
          <div className="mt-4 space-y-3">
            {scoreLogs.filter((log) => log.userId === currentUserId).map((log) => (
              <div key={log.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div>
                  <p className="font-medium text-slate-700">{log.reason}</p>
                  <p className="mt-1 text-xs text-slate-500">{log.createdAt.slice(0, 10)}</p>
                </div>
                <span className={log.points > 0 ? "font-semibold text-campus" : "font-semibold text-rose-600"}>{log.points}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-ink">我的举报记录</h2>
          <div className="mt-4 space-y-3">
            {myReports.map((report) => (
              <div key={report.id} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-slate-700">{report.category}</p>
                  <BadgePill tone={report.status === "pending" ? "gold" : "blue"}>{report.status}</BadgePill>
                </div>
                <p className="mt-2 text-sm text-slate-600">{report.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
