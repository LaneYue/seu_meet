import { BookOpen, MapPinned, ShieldCheck, Sparkles, Users } from "lucide-react"
import { BadgePill, Card, PageHeader, SafetyNotice, Stat } from "@/components/ui"
import { getDashboardData } from "@/lib/mockSelectors"

export default function DashboardPage() {
  const { profile, identity, learningPartner, activityPartner, route, pendingActivities, companion, recentBadges } =
    getDashboardData()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="MVP Dashboard"
        title="东大同行"
        description="东大同行是一个面向东南大学学生的校内可信社交与共同行动平台，帮助同学通过学习搭子、校园路线、兴趣匹配和电子徽章，在安全、低压力的环境中认识彼此、探索校园、共同成长。"
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="身份状态" value="已认证" tone="campus" />
        <Stat label="当前校区" value={identity.campus} tone="lake" />
        <Stat label="同行值" value={companion.cappedTotal} tone="gold" />
        <Stat label="待进行活动" value={pendingActivities.length} tone="brick" />
      </div>

      <SafetyNotice />

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <div className="flex items-center gap-2 text-campus">
            <BookOpen className="size-5" />
            <h2 className="font-semibold">今日学习搭子</h2>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">{learningPartner?.item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{learningPartner?.item.description}</p>
          <p className="mt-3 text-sm font-medium text-campus">{learningPartner?.score} 分匹配</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-lake">
            <Users className="size-5" />
            <h2 className="font-semibold">今日活动搭子</h2>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">{activityPartner?.item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activityPartner?.item.description}</p>
          <p className="mt-3 text-sm font-medium text-lake">{activityPartner?.score} 分匹配</p>
        </Card>
        <Card>
          <div className="flex items-center gap-2 text-brick">
            <MapPinned className="size-5" />
            <h2 className="font-semibold">今日校园路线</h2>
          </div>
          <h3 className="mt-4 text-xl font-semibold text-ink">{route?.item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{route?.item.description}</p>
          <p className="mt-3 text-sm font-medium text-brick">{route?.item.estimatedMinutes} 分钟</p>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-campus" />
            <h2 className="text-lg font-semibold text-ink">我的公开资料预览</h2>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <BadgePill tone="green">东大学生已认证</BadgePill>
            <BadgePill>{profile.nickname}</BadgePill>
            <BadgePill>{profile.campus}</BadgePill>
            <BadgePill>{profile.departmentCategory}</BadgePill>
            <BadgePill>{profile.gradeRange}</BadgePill>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            普通用户看不到真实姓名、学号、手机号或身份证号；信用分只用于风控，不公开排名。
          </p>
        </Card>
        <Card>
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-gold" />
            <h2 className="text-lg font-semibold text-ink">最近徽章</h2>
          </div>
          <div className="mt-4 space-y-3">
            {recentBadges.map((badge) => (
              <div key={badge?.id} className="rounded-lg bg-mist p-3">
                <p className="font-medium text-ink">{badge?.title}</p>
                <p className="mt-1 text-sm text-slate-600">{badge?.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
