import { campusRoutes } from "@/data/mock"
import { created, ok } from "@/lib/api"

export async function GET() {
  return ok(campusRoutes)
}

export async function POST(request: Request) {
  return created({ id: `r-${Date.now()}`, status: "community_pending", ...(await request.json().catch(() => ({}))) })
}
