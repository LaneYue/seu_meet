import type { Badge, CampusRoute, RouteCheckin, UserBadge } from "@/types"

export function unlockBadgesAfterRoute(
  userId: string,
  route: CampusRoute,
  checkins: RouteCheckin[],
  badges: Badge[],
  existingBadges: UserBadge[]
): Badge[] {
  const completedStopIds = new Set(
    checkins
      .filter((checkin) => checkin.userId === userId && checkin.routeId === route.id)
      .map((checkin) => checkin.stopId)
  )
  const hasCompletedRoute = route.stops.every((stop) => completedStopIds.has(stop.id))
  if (!hasCompletedRoute) return []

  const ownedBadgeIds = new Set(existingBadges.filter((badge) => badge.userId === userId).map((badge) => badge.badgeId))
  return badges.filter((badge) => {
    if (ownedBadgeIds.has(badge.id)) return false
    return badge.unlockRule === `complete_route:${route.id}` || badge.unlockRule === `complete_campus:${route.campus}`
  })
}
