import { AlertTriangle, MapPinned, Shield, UserPlus, Users } from "lucide-react"
import { ActionLink, Card, PageHeader, Stat } from "@/components/ui"
import { getAdminDashboard } from "@/lib/mockSelectors"

export default function AdminPage() {
  const dashboard = getAdminDashboard()
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="管理端 Dashboard"
        description="管理员可处理举报、路线审核和用户风控。所有管理员操作都返回 mock 审计轨迹。"
      />
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="今日新增用户" value={dashboard.newUsersToday} />
        <Stat label="今日搭子发布" value={dashboard.partnerPostsToday} tone="lake" />
        <Stat label="今日路线打卡" value={dashboard.routeCheckinsToday} tone="gold" />
        <Stat label="待处理举报" value={dashboard.pendingReports} tone="brick" />
        <Stat label="待审核路线" value={dashboard.pendingRoutes} />
        <Stat label="受限用户" value={dashboard.limitedUsers} tone="brick" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <AlertTriangle className="size-6 text-brick" />
          <h2 className="mt-3 text-lg font-semibold text-ink">举报处理</h2>
          <p className="mt-2 text-sm text-slate-600">查看骚扰、爽约、虚假信息和不安全见面诱导。</p>
          <div className="mt-5"><ActionLink href="/admin/reports">进入举报处理</ActionLink></div>
        </Card>
        <Card>
          <MapPinned className="size-6 text-campus" />
          <h2 className="mt-3 text-lg font-semibold text-ink">路线审核</h2>
          <p className="mt-2 text-sm text-slate-600">审核学生投稿路线，标记官方推荐或拒绝。</p>
          <div className="mt-5"><ActionLink href="/admin/routes">进入路线审核</ActionLink></div>
        </Card>
        <Card>
          <Shield className="size-6 text-lake" />
          <h2 className="mt-3 text-lg font-semibold text-ink">用户风控</h2>
          <p className="mt-2 text-sm text-slate-600">限制、冻结或封禁高风险用户。</p>
          <div className="mt-5"><ActionLink href="/admin/users">进入用户风控</ActionLink></div>
        </Card>
      </div>
    </div>
  )
}
