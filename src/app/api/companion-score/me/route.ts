import { currentUserId, scoreLogs } from "@/data/mock"
import { ok } from "@/lib/api"
import { calculateCompanionScore } from "@/lib/trust/trustEngine"

export async function GET() {
  return ok(calculateCompanionScore(currentUserId, scoreLogs))
}
