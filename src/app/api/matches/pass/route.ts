import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("match-pass", await request.json().catch(() => ({})))
}
