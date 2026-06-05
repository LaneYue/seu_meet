import { Flag, UserPlus, UserX } from "lucide-react"
import { BadgePill, Card, GhostButton, PageHeader } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { getFriendRecommendations } from "@/lib/mockSelectors"

export default function DiscoverPage() {
  const recommendations = getFriendRecommendations()
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Interest Discover"
        title="兴趣交友推荐"
        description="推荐理由可解释，鼓励跨专业、跨校区、低压力认识新朋友。聊天必须双向匹配后开启。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map(({ item, score, reasons }) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{item.nickname}</h2>
                <p className="mt-1 text-sm text-slate-500">{score} 分推荐</p>
              </div>
              <BadgePill tone="green">{item.campus}</BadgePill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BadgePill>{item.departmentCategory}</BadgePill>
              <BadgePill>{item.gradeRange}</BadgePill>
              {item.interests.slice(0, 3).map((interest) => (
                <BadgePill key={interest} tone="blue">
                  {interest}
                </BadgePill>
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              {reasons.slice(0, 3).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <MockActionButton label="想认识" doneLabel="已发送意向" />
              <GhostButton>
                <UserX className="mr-2 size-4" />
                暂不感兴趣
              </GhostButton>
              <GhostButton>
                <Flag className="mr-2 size-4" />
                举报
              </GhostButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
