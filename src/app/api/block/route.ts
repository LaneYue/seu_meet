import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("block-user", await request.json().catch(() => ({})))
}
