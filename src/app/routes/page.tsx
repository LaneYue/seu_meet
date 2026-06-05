import { Clock, MapPinned, Users } from "lucide-react"
import { ActionLink, BadgePill, Card, PageHeader } from "@/components/ui"
import { campusRoutes } from "@/data/mock"

export default function RoutesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Campus Routes"
        title="校园路线"
        description="路线把线上认识转化为健康、安全、积极的校园行动。MVP 使用手动或 mock QR 打卡，不做实时定位。"
      />
      <div className="grid gap-4 md:grid-cols-2">
        {campusRoutes.map((route) => (
          <Card key={route.id}>
            <div className="flex flex-wrap items-center gap-2">
              <BadgePill tone={route.status === "official" ? "green" : "gold"}>{route.status === "official" ? "官方路线" : "待审核"}</BadgePill>
              <BadgePill>{route.campus}</BadgePill>
              <BadgePill>{route.routeType}</BadgePill>
            </div>
            <h2 className="mt-3 text-xl font-semibold text-ink">{route.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{route.description}</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
              <span className="inline-flex items-center gap-2"><Clock className="size-4" />{route.estimatedMinutes} 分钟</span>
              <span className="inline-flex items-center gap-2"><Users className="size-4" />{route.recommendedGroupSize}</span>
              <span className="inline-flex items-center gap-2"><MapPinned className="size-4" />{route.usageCount} 次使用</span>
            </div>
            <div className="mt-5">
              <ActionLink href={`/routes/${route.id}`}>查看路线</ActionLink>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
