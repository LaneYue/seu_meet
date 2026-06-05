import { campusRoutes, profiles } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET() {
  return ok(
    campusRoutes
      .filter((route) => route.createdBy)
      .map((route) => ({ routeTitle: route.title, contributor: profiles.find((profile) => profile.userId === route.createdBy)?.nickname }))
  )
}
