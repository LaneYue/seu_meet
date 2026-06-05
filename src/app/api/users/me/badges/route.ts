import { badges, currentUserId, userBadges } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET() {
  const owned = userBadges
    .filter((item) => item.userId === currentUserId)
    .map((item) => ({ ...item, badge: badges.find((badge) => badge.id === item.badgeId) }))
  return ok(owned)
}
