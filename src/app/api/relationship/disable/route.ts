import { mockMutation } from "@/lib/api"

export async function POST() {
  return mockMutation("relationship-disable")
}
