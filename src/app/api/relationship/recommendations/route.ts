import { ok } from "@/lib/api"
import { getRelationshipRecommendations } from "@/lib/mockSelectors"

export async function GET() {
  return ok(getRelationshipRecommendations())
}
