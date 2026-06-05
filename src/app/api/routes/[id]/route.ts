import { campusRoutes } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return ok(campusRoutes.find((route) => route.id === params.id) ?? null)
}
