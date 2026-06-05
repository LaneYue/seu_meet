import { partnerPosts } from "@/data/mock"
import { created, ok } from "@/lib/api"

export async function GET() {
  return ok(partnerPosts)
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}))
  return created({ id: `pp-${Date.now()}`, status: "open", ...payload })
}
