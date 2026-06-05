import { campusRoutes } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET() {
  return ok(campusRoutes.filter((route) => route.status === "community_pending"))
}
