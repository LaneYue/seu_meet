import { ok } from "@/lib/api"
import { getAdminDashboard } from "@/lib/mockSelectors"

export async function GET() {
  return ok(getAdminDashboard())
}
