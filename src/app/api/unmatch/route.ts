import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("unmatch", await request.json().catch(() => ({})))
}
