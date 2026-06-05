import { mockMutation } from "@/lib/api"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return mockMutation("admin-route-reject", { routeId: params.id, ...(await request.json().catch(() => ({}))) })
}
