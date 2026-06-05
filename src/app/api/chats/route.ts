import { currentUserId } from "@/data/mock"
import { ok } from "@/lib/api"
import { getChatRoomsForCurrentUser } from "@/lib/mockSelectors"

export async function GET() {
  return ok(getChatRoomsForCurrentUser().filter((room) => room.participantIds.includes(currentUserId)))
}
