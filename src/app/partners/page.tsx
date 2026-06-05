import { Filter, UserPlus } from "lucide-react"
import { BadgePill, Card, ActionLink, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { getPartnerRecommendations } from "@/lib/mockSelectors"

export default function PartnersPage() {
  const recommendations = getPartnerRecommendations()
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Partners"
        title="搭子广场"
        description="找学习搭子、饭搭子、运动搭子、活动搭子和项目组队。所有线下活动都建议选择校园公共空间。"
        action={<ActionLink href="/partners/new">发布搭子需求</ActionLink>}
      />
      <Card className="shadow-none">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="size-5 text-campus" />
          <BadgePill tone="green">九龙湖</BadgePill>
          <BadgePill>学习搭子</BadgePill>
          <BadgePill>未来 7 天</BadgePill>
          <BadgePill tone="blue">公共空间优先</BadgePill>
        </div>
      </Card>
      <div className="space-y-4">
        {recommendations.map(({ item, score, reasons }) => (
          <Card key={item.id}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <BadgePill tone="green">{item.type}</BadgePill>
                  <BadgePill>{item.campus}</BadgePill>
                  <BadgePill>{item.status}</BadgePill>
                </div>
                <h2 className="mt-3 text-xl font-semibold text-ink">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                <p className="mt-2 text-sm text-slate-500">{item.locationText} · {new Date(item.startTime).toLocaleString("zh-CN")}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.requirements?.map((requirement) => <BadgePill key={requirement}>{requirement}</BadgePill>)}
                </div>
              </div>
              <div className="shrink-0 rounded-lg bg-mist p-4 text-center">
                <p className="text-2xl font-semibold text-campus">{score}</p>
                <p className="text-xs text-slate-500">匹配分</p>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-600">{reasons[0]}；{reasons[1]}</div>
            <div className="mt-4 flex flex-wrap gap-2">
              <MockActionButton label="申请加入" doneLabel="申请已发送" />
              <MockActionButton label="发起者同意" doneLabel="已生成活动" />
              <MockActionButton label="拒绝申请" doneLabel="已拒绝" />
              <MockActionButton label="关闭需求" doneLabel="已关闭" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
