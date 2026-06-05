import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("match-like", await request.json().catch(() => ({})))
}
