import { profiles, scoreLogs } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET() {
  return ok(
    profiles.slice(0, 5).map((profile) => ({
      nickname: profile.nickname,
      points: scoreLogs.filter((log) => log.userId === profile.userId && log.sourceType !== "penalty").reduce((sum, log) => sum + log.points, 0)
    }))
  )
}
