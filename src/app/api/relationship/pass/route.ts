import { mockMutation } from "@/lib/api"

export async function POST(request: Request) {
  return mockMutation("relationship-pass", await request.json().catch(() => ({})))
}
