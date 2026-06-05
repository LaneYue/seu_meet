import { notFound } from "next/navigation"
import { BadgePill, PageHeader, SafetyNotice } from "@/components/ui"
import { RouteCheckin } from "@/components/RouteCheckin"
import { campusRoutes } from "@/data/mock"

export default function RouteDetailPage({ params }: { params: { id: string } }) {
  const route = campusRoutes.find((item) => item.id === params.id)
  if (!route) notFound()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`${route.campus} · ${route.routeType}`}
        title={route.title}
        description={route.description}
      />
      <div className="flex flex-wrap gap-2">
        <BadgePill tone="green">{route.status === "official" ? "官方推荐" : "社区投稿"}</BadgePill>
        <BadgePill>{route.estimatedMinutes} 分钟</BadgePill>
        <BadgePill>{route.recommendedGroupSize}</BadgePill>
        {route.suitableGoals.map((goal) => <BadgePill key={goal} tone="blue">{goal}</BadgePill>)}
      </div>
      <SafetyNotice />
      <RouteCheckin route={route} />
    </div>
  )
}
