import { currentUserId, trustProfiles } from "@/data/mock"
import { ok } from "@/lib/api"
import { describeTrust } from "@/lib/trust/trustEngine"

export async function GET() {
  const trust = trustProfiles.find((profile) => profile.userId === currentUserId)
  return ok(trust ? { ...trust, description: describeTrust(trust) } : null)
}
