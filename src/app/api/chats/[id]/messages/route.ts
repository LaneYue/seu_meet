import { currentUserId } from "@/data/mock"
import { created, ok } from "@/lib/api"
import { moderateMessage } from "@/lib/moderation"
import { getRoomMessages } from "@/lib/mockSelectors"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return ok(getRoomMessages(params.id))
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const payload = await request.json().catch(() => ({ content: "" }))
  const content = String(payload.content ?? "")
  return created({
    id: `m-${Date.now()}`,
    roomId: params.id,
    senderId: currentUserId,
    content,
    moderationStatus: moderateMessage(content),
    createdAt: new Date().toISOString()
  })
}
