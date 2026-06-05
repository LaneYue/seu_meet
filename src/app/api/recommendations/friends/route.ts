import { ok } from "@/lib/api"
import { getFriendRecommendations } from "@/lib/mockSelectors"

export async function GET() {
  return ok(getFriendRecommendations())
}
