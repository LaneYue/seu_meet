import { currentUserId } from "@/data/mock"
import { created } from "@/lib/api"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json().catch(() => ({}))
  return created({
    id: `checkin-${Date.now()}`,
    routeId: params.id,
    userId: currentUserId,
    status: "completed",
    proofType: "manual",
    createdAt: new Date().toISOString(),
    ...payload
  })
}
