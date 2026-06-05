import { mockMutation } from "@/lib/api"

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return mockMutation("partner-close", { postId: params.id })
}
