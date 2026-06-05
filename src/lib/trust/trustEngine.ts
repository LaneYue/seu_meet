import type { CompanionScoreLog, TrustProfile } from "@/types"

const DAILY_COMPANION_CAP = 80

export function calculateCompanionScore(userId: string, logs: CompanionScoreLog[]) {
  const total = logs.filter((log) => log.userId === userId).reduce((sum, log) => sum + log.points, 0)
  const byDay = new Map<string, number>()

  for (const log of logs.filter((item) => item.userId === userId)) {
    const day = log.createdAt.slice(0, 10)
    byDay.set(day, Math.min(DAILY_COMPANION_CAP, (byDay.get(day) ?? 0) + log.points))
  }

  const cappedTotal = Array.from(byDay.values()).reduce((sum, points) => sum + points, 0)
  return { total, cappedTotal, dailyCap: DAILY_COMPANION_CAP, today: byDay.get("2026-06-06") ?? 0 }
}

export function applyNoShow(profile: TrustProfile): TrustProfile {
  const trustScore = Math.max(0, profile.trustScore - 10)
  return {
    ...profile,
    trustScore,
    noShowCount: profile.noShowCount + 1,
    status: trustScore < 60 ? "limited" : profile.status,
    updatedAt: new Date().toISOString()
  }
}

export function applyValidReport(profile: TrustProfile): TrustProfile {
  const trustScore = Math.max(0, profile.trustScore - 40)
  return {
    ...profile,
    trustScore,
    validReportCount: profile.validReportCount + 1,
    status: trustScore < 50 ? "frozen" : "limited",
    updatedAt: new Date().toISOString()
  }
}

export function describeTrust(profile: TrustProfile) {
  if (profile.status === "banned") return "账号已封禁，仅保留申诉入口"
  if (profile.status === "frozen") return "账号已冻结，需要管理员复核"
  if (profile.status === "limited") return "部分功能受限，需完成守约行为恢复"
  return "状态正常，信用分仅用于平台风控，不公开排名"
}
