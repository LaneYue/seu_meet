import { Award, BookOpen, HeartPulse, Landmark, Map, Network, Route, ShieldCheck } from "lucide-react"
import { BadgePill, Card, PageHeader, Stat } from "@/components/ui"
import { badges, currentUserId, userBadges } from "@/data/mock"

const iconMap = { Award, BookOpen, HeartPulse, Landmark, Map, Network, Route, ShieldCheck }

export default function BadgesPage() {
  const owned = new Set(userBadges.filter((item) => item.userId === currentUserId).map((item) => item.badgeId))
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Badges"
        title="电子徽章墙"
        description="徽章鼓励共同学习、路线探索、守约和跨专业连接，不做亲密度榜单。"
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="已获得徽章" value={owned.size} tone="gold" />
        <Stat label="可解锁徽章" value={badges.length} tone="campus" />
        <Stat label="公开亲密榜" value="0" tone="brick" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {badges.map((badge) => {
          const Icon = iconMap[badge.icon as keyof typeof iconMap] ?? Award
          const isOwned = owned.has(badge.id)
          return (
            <Card key={badge.id} className={isOwned ? "border-amber-200" : ""}>
              <div className="flex items-start gap-4">
                <span className={`flex size-12 shrink-0 items-center justify-center rounded-lg ${isOwned ? "bg-amber-100 text-gold" : "bg-slate-100 text-slate-500"}`}>
                  <Icon className="size-6" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-ink">{badge.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{badge.description}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <BadgePill tone={isOwned ? "gold" : "neutral"}>{isOwned ? "已获得" : "未解锁"}</BadgePill>
                    <BadgePill>{badge.category}</BadgePill>
                    <BadgePill>{badge.rarity}</BadgePill>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
