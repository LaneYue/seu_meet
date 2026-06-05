import { mockMutation } from "@/lib/api"

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  return mockMutation("admin-user-freeze", { userId: params.id })
}
