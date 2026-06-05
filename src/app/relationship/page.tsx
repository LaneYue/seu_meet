import { HeartHandshake, ShieldCheck } from "lucide-react"
import { BadgePill, Card, PageHeader, SafetyNotice } from "@/components/ui"
import { MockActionButton } from "@/components/MockActionButton"
import { relationshipPreferences } from "@/data/mock"
import { currentUserId } from "@/data/mock"
import { getRelationshipRecommendations } from "@/lib/mockSelectors"

export default function RelationshipPage() {
  const preference = relationshipPreferences.find((item) => item.userId === currentUserId)
  const recommendations = getRelationshipRecommendations()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Relationship"
        title="认真关系意向频道"
        description="这是低频、克制、安全的双向匹配频道。双方都点击愿意进一步了解后才开放聊天，不参与公开榜单或官方奖励。"
      />
      <SafetyNotice />
      <Card className="border-campus/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-campus">
              <HeartHandshake className="size-5" />
              <h2 className="text-lg font-semibold">频道状态：{preference?.enabled ? "已开启" : "未开启"}</h2>
            </div>
            <p className="mt-2 text-sm text-slate-600">每日最多展示 {preference?.dailyRecommendationLimit ?? 3} 个推荐，可随时关闭。</p>
          </div>
          <MockActionButton label="关闭该频道" doneLabel="已关闭" />
        </div>
      </Card>
      <div className="grid gap-4 md:grid-cols-3">
        {recommendations.map(({ item, score, reasons }) => (
          <Card key={item.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-ink">{item.nickname}</h2>
                <p className="mt-1 text-sm text-slate-500">{score} 分推荐</p>
              </div>
              <ShieldCheck className="size-5 text-campus" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <BadgePill>{item.campus}</BadgePill>
              <BadgePill>{item.departmentCategory}</BadgePill>
              {item.interests.slice(0, 2).map((interest) => <BadgePill key={interest} tone="blue">{interest}</BadgePill>)}
            </div>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
              {reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2">
              <MockActionButton label="愿意进一步了解" doneLabel="已发送意向" />
              <MockActionButton label="暂不继续" doneLabel="已跳过" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
