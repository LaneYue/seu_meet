import { currentUserId, profiles } from "@/data/mock"
import { mockMutation, ok } from "@/lib/api"
import { toPublicProfile } from "@/lib/privacy"

export async function GET() {
  const profile = profiles.find((item) => item.userId === currentUserId)
  return ok(profile ? toPublicProfile(profile) : null)
}

export async function PATCH(request: Request) {
  return mockMutation("update-profile", await request.json().catch(() => ({})))
}
