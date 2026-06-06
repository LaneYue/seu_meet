import { http } from "./http"

export type MarketRoute = {
  id: string
  title: string
  badge: string
  campus: string
  duration: string
  difficulty: string
  people: string
  nodes: number
  image: string
  intro: string
  tags: string[]
  price: number
  rating: number
  sales: number
  author: { id: string; name: string; avatar: string }
  purchased?: boolean
}

export type PublishRoutePayload = {
  title: string
  campus: string
  tags: string[]
  intro: string
  budget: string
  price: number
  steps: { title: string; desc: string; method: string }[]
}

type BackendGuide = {
  id: string
  title: string
  category: string
  coverImage: string | null
  tags: string[]
  price: number
  sales: number
  avgRating: number
  author: { id: string; nickname: string; avatar: string | null }
  createdAt: string
}

const CAMPUS_MAP: Record<string, string> = {
  study: "九龙湖", food: "九龙湖", date: "四牌楼", outing: "四牌楼",
  cross_campus: "跨校区", activity: "九龙湖", other: "九龙湖",
}

const BADGE_MAP: Record<string, string> = {
  study: "学习路线", food: "美食探店", date: "约会路线", outing: "外出路线",
  cross_campus: "跨校区", activity: "活动路线", other: "UGC 路线",
}

function guideToMarketRoute(g: BackendGuide): MarketRoute {
  return {
    id: g.id,
    title: g.title,
    badge: BADGE_MAP[g.category] ?? "UGC 路线",
    campus: CAMPUS_MAP[g.category] ?? "九龙湖",
    duration: "约 2 小时",
    difficulty: "轻松",
    people: g.sales >= 1000 ? `${(g.sales / 1000).toFixed(1)}k` : String(g.sales),
    nodes: 5,
    image: g.coverImage ?? "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
    intro: "",
    tags: g.tags ?? [],
    price: g.price,
    rating: g.avgRating ?? 0,
    sales: g.sales,
    author: { id: g.author.id, name: g.author.nickname, avatar: g.author.avatar?.charAt(0) ?? g.author.nickname.charAt(0) },
    purchased: false,
  }
}

export const routesApi = {
  async listMarket(params?: { campus?: string; sort?: string; search?: string }): Promise<MarketRoute[]> {
    const sortMap: Record<string, string> = { "热门": "popular", "最新": "new", "评分": "rating", "免费": "popular" }
    const qs = new URLSearchParams()
    if (params?.search) qs.set("search", params.search)
    if (params?.sort) qs.set("sort", sortMap[params.sort] ?? "popular")
    if (params?.sort === "免费") qs.set("price_max", "0")
    const data = await http.get<{ list: BackendGuide[] }>(`/guides?${qs}`)
    let result = data.list.map(guideToMarketRoute)
    if (params?.sort === "免费") {
      result = result.filter((r) => r.price === 0)
    }
    return result
  },

  async publishRoute(payload: PublishRoutePayload): Promise<{ id: string }> {
    // 将前端节点结构转成后端 route.points 格式（用占位坐标）
    const CAMPUS_COORDS: Record<string, { lat: number; lng: number }> = {
      "九龙湖": { lat: 31.89, lng: 118.82 },
      "四牌楼": { lat: 32.05, lng: 118.78 },
      "丁家桥": { lat: 32.07, lng: 118.76 },
      "跨校区": { lat: 31.97, lng: 118.80 },
    }
    const base = CAMPUS_COORDS[payload.campus] ?? CAMPUS_COORDS["九龙湖"]
    const points = payload.steps.map((step, i) => ({
      lat: base.lat + i * 0.001,
      lng: base.lng + i * 0.001,
      name: step.title || `节点 ${i + 1}`,
      desc: step.desc,
    }))

    const categoryMap: Record<string, string> = {
      "学习": "study", "文化": "outing", "运动": "activity",
      "美食": "food", "公益": "activity", "探索": "outing",
    }
    const category = payload.tags.length > 0 ? (categoryMap[payload.tags[0]] ?? "other") : "other"

    const data = await http.post<{ id: string; title: string }>("/guides", {
      title: payload.title,
      description: payload.intro || payload.title,
      category,
      tags: payload.tags,
      price: payload.price,
      budget: payload.budget ? parseInt(payload.budget) || 0 : 0,
      route: { points },
    })
    return { id: data.id }
  },

  async purchaseRoute(guideId: string): Promise<{ balanceAfter: number }> {
    const data = await http.post<{ balanceAfter: number }>(`/guides/${guideId}/purchase`)
    return data
  },
}
