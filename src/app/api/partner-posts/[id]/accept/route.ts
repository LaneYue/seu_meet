import { mockMutation } from "@/lib/api"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return mockMutation("partner-accept", { postId: params.id, ...(await request.json().catch(() => ({}))) })
}
