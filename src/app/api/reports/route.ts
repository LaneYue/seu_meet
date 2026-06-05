import { currentUserId } from "@/data/mock"
import { created } from "@/lib/api"

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  return created({
    id: `report-${Date.now()}`,
    reporterId: currentUserId,
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...payload
  })
}
