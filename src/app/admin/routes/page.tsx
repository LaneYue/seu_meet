import { BadgePill, Card, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { campusRoutes, profiles } from "@/data/mock"

export default function AdminRoutesPage() {
  const pending = campusRoutes.filter((route) => route.status === "community_pending")
  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Route Review" title="路线审核" description="社区路线通过审核后才能进入公开路线列表；审核时重点检查公共空间、安全边界和隐私保护。" />
      <div className="space-y-4">
        {pending.map((route) => {
          const creator = profiles.find((profile) => profile.userId === route.createdBy)
          return (
            <Card key={route.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <BadgePill tone="gold">待审核</BadgePill>
                    <BadgePill>{route.campus}</BadgePill>
                    <BadgePill>{route.routeType}</BadgePill>
                    <BadgePill>投稿人：{creator?.nickname}</BadgePill>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-ink">{route.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{route.description}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <MockActionButton label="通过" doneLabel="已通过" />
                  <MockActionButton label="拒绝" doneLabel="已拒绝" />
                  <MockActionButton label="标记官方推荐" doneLabel="已推荐" />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
