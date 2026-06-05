import { partnerPosts } from "@/data/mock"
import { ok } from "@/lib/api"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  return ok(partnerPosts.find((post) => post.id === params.id) ?? null)
}
