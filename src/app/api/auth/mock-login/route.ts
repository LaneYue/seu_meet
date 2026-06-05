import { identities, profiles } from "@/data/mock"
import { ok } from "@/lib/api"

export async function POST() {
  return ok({ identity: identities[0], profile: profiles[0], token: "mock-session-token" })
}
