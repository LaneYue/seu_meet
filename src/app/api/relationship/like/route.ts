import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("relationship-like", await request.json().catch(() => ({})))
}
