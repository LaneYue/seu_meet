import { mockMutation } from "@/lib/api"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  return mockMutation("admin-report-resolve", { reportId: params.id, ...(await request.json().catch(() => ({}))) })
}
