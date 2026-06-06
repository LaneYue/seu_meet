/**
 * 真实 HTTP 实现，对接 FastAPI 后端 (localhost:3100/api/v1)
 * 字段映射：后端 camelCase → 前端 DiscoverProfile / ChatItem / CampusRoute 等类型
 */
import { http } from "../lib/http"
import type {
  ChatItem,
  CampusRoute,
  DiscoverProfile,
  PartnerPost,
  RouteStep,
  BadgeItem,
} from "../types/linkit"
import type {
  LinkitService,
  SwipeActionPayload,
  CreatePartnerPostPayload,
  SendMessagePayload,
  UpdateProfilePayload,
} from "./linkitService"

// ── 后端响应类型 ──────────────────────────────────────────────────────────────

type BackendUser = {
  id: string
  nickname: string
  avatar: string | null
  college: string
  major: string
  grade: string
  campus: string
  gender: string
  bio: string | null
  tags: string[]
  creditScore: number
}

type BackendCard = BackendUser & {
  commonTags: string[]
  commonTagsCount: number
}

type BackendChatSession = {
  sessionId: string
  stage: string
  sessionType: string
  unreadCount: number
  targetUser: { id: string; nickname: string; avatar: string | null; college: string } | null
  lastMessage: { content: string; type: string; createdAt: string } | null
  updatedAt: string | null
}

// ── 字段适配器 ────────────────────────────────────────────────────────────────

function cardToProfile(card: BackendCard): DiscoverProfile {
  return {
    id: card.id,
    name: card.nickname,
    age: 20,
    gender: card.gender === "male" ? "♂" : card.gender === "female" ? "♀" : card.gender,
    school: `${card.college} · ${card.grade} · ${card.campus}`,
    verified: `信用分 ${card.creditScore}`,
    post: card.bio ?? "",
    reason: card.commonTagsCount > 0 ? `你们有 ${card.commonTagsCount} 个共同标签：${card.commonTags.join("、")}` : "系统为你推荐",
    safety: "建议从校园公共空间开始，保持低压力沟通。",
    interests: card.tags,
    photos: card.avatar ? [card.avatar] : [],
  }
}

function sessionToChat(s: BackendChatSession): ChatItem {
  return {
    id: s.sessionId,
    name: s.targetUser?.nickname ?? "未知用户",
    tag: s.targetUser?.college ?? "",
    message: s.lastMessage?.content ?? "",
    time: s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }) : "",
    unread: s.unreadCount ?? 0,
    avatar: s.targetUser?.nickname?.charAt(0) ?? "?",
    sessionType: s.sessionType ?? "normal",
  }
}

// ── 真实 service 实现 ─────────────────────────────────────────────────────────

export const apiLinkitService: LinkitService = {
  discover: {
    async listProfiles(): Promise<DiscoverProfile[]> {
      const data = await http.get<{ cards: BackendCard[] }>("/match/discover?count=20")
      return data.cards.map(cardToProfile)
    },

    async getProfile(profileId: string): Promise<DiscoverProfile | undefined> {
      try {
        const data = await http.get<BackendCard>(`/users/${profileId}/card`)
        return cardToProfile(data)
      } catch {
        return undefined
      }
    },

    async recordSwipe(payload: SwipeActionPayload): Promise<{ ok: true }> {
      const actionMap: Record<string, string> = { like: "right", dislike: "left", skip: "left" }
      await http.post(`/match/${payload.profileId}/action`, { action: actionMap[payload.action] ?? "left" })
      return { ok: true }
    },
  },

  partners: {
    async listPosts(params?: { category?: string; page?: number; pageSize?: number }): Promise<PartnerPost[]> {
      try {
        const query = new URLSearchParams()
        if (params?.category) query.set("category", params.category)
        if (params?.page) query.set("page", String(params.page))
        if (params?.pageSize) query.set("pageSize", String(params.pageSize))
        const qs = query.toString()
        const data = await http.get<{
          list: Array<{
            id: string; title: string; category: string; status: string
            time: string; place: string; joined: number; total: number
            note: string; author: { id: string; nickname: string; avatar: string | null }
            createdAt: string
          }>
        }>(`/plaza/posts${qs ? `?${qs}` : ""}`)
        return data.list.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status === "recruiting" ? "招募中" : p.status === "in_progress" ? "进行中" : "已结束",
          time: p.time,
          place: p.place,
          joined: p.joined,
          total: p.total,
          note: p.note ?? "",
          tone: p.category === "study" ? "green" : p.category === "sport" ? "purple" : p.category === "life" ? "orange" : "blue",
        }))
      } catch {
        const { partnerPosts } = await import("../data/mock/linkit")
        return partnerPosts
      }
    },

    async createPost(payload: CreatePartnerPostPayload): Promise<PartnerPost> {
      try {
        const data = await http.post<{
          id: string; title: string; category: string; status: string
          time: string; place: string; joined: number; total: number
          note: string; author: { id: string; nickname: string; avatar: string | null }
        }>("/plaza/posts", {
          title: payload.title,
          category: payload.type,
          time: payload.time,
          place: payload.place,
          capacity: payload.capacity,
          note: payload.note,
        })
        return {
          id: data.id,
          title: data.title,
          status: data.status === "recruiting" ? "招募中" : data.status,
          time: data.time,
          place: data.place,
          joined: data.joined,
          total: data.total,
          note: data.note ?? "",
          tone: payload.type === "sport" ? "purple" : payload.type === "life" ? "orange" : "green",
        }
      } catch {
        return {
          id: `local-${Date.now()}`,
          title: payload.title,
          status: "招募中",
          time: payload.time,
          place: payload.place,
          joined: 1,
          total: payload.capacity,
          note: payload.note,
          tone: payload.type === "sport" ? "purple" : payload.type === "life" ? "orange" : "green",
        }
      }
    },

    async submitAction(postId: string, action: string): Promise<{ ok: true }> {
      try {
        await http.post(`/plaza/posts/${postId}/action`, { action })
      } catch { /* fallback */ }
      return { ok: true }
    },
  },

  routes: {
    async listRoutes(): Promise<CampusRoute[]> {
      try {
        const data = await http.get<{
          list: Array<{
            id: string; title: string; badge: string; campus: string
            duration: string; difficulty: string; participantCount: number
            nodeCount: number; userProgress: number; coverImage: string | null
            intro: string; tags: string[]
          }>
        }>("/routes?campus=九龙湖")
        return data.list.map((r) => ({
          id: r.id,
          title: r.title,
          badge: r.badge,
          campus: r.campus,
          duration: r.duration,
          difficulty: r.difficulty,
          people: r.participantCount > 1000 ? `${(r.participantCount / 1000).toFixed(1)}k` : String(r.participantCount),
          nodes: r.nodeCount,
          progress: r.userProgress,
          image: r.coverImage ?? "",
          intro: r.intro,
          tags: r.tags,
        }))
      } catch {
        const { routes } = await import("../data/mock/linkit")
        return routes
      }
    },

    async getRoute(routeId: string): Promise<CampusRoute | undefined> {
      try {
        const data = await http.get<{
          id: string; title: string; badge: string; campus: string
          duration: string; difficulty: string; participantCount: number
          nodeCount: number; userProgress: number; coverImage: string | null
          intro: string; tags: string[]; steps: Array<{ id: string; title: string; desc: string; method: string; status: string }>
        }>(`/routes/${routeId}`)
        return {
          id: data.id,
          title: data.title,
          badge: data.badge,
          campus: data.campus,
          duration: data.duration,
          difficulty: data.difficulty,
          people: data.participantCount > 1000 ? `${(data.participantCount / 1000).toFixed(1)}k` : String(data.participantCount),
          nodes: data.nodeCount,
          progress: data.userProgress,
          image: data.coverImage ?? "",
          intro: data.intro,
          tags: data.tags,
        }
      } catch {
        const { routes } = await import("../data/mock/linkit")
        return routes.find((r) => r.id === routeId)
      }
    },

    async listSteps(routeId: string): Promise<RouteStep[]> {
      try {
        const data = await http.get<{
          steps: Array<{ id: string; title: string; desc: string; method: string; status: string }>
        }>(`/routes/${routeId}`)
        return data.steps
      } catch {
        const { routeSteps } = await import("../data/mock/linkit")
        return routeSteps
      }
    },

    async listBadges(): Promise<BadgeItem[]> {
      try {
        const icons: Record<string, any> = await import("lucide-react")
        const data = await http.get<{
          list: Array<{ id: string; name: string; level: string; icon: string; unlockedAt: string | null }>
        }>("/routes/badges/me")
        return data.list.map((b) => ({
          name: b.name,
          level: b.level,
          icon: icons[b.icon] ?? icons.Compass,
        }))
      } catch {
        const { badges } = await import("../data/mock/linkit")
        return badges
      }
    },

    async checkIn(routeId: string, stepId: string): Promise<{ ok: true; userProgress?: number }> {
      try {
        const data = await http.post<{ stepId: string; userProgress: number; pointsAwarded: number; balanceAfter: number }>(
          `/routes/${routeId}/checkin`,
          { stepId },
        )
        return { ok: true, userProgress: data.userProgress }
      } catch {
        await http.post("/points/checkin")
        return { ok: true }
      }
    },
  },

  messages: {
    async listChats(): Promise<ChatItem[]> {
      const data = await http.get<{ list: BackendChatSession[] }>("/chat/sessions")
      return data.list.map(sessionToChat)
    },

    async getChat(chatId: string): Promise<ChatItem | undefined> {
      const data = await http.get<{ list: BackendChatSession[] }>("/chat/sessions")
      const session = data.list.find((s) => s.sessionId === chatId)
      return session ? sessionToChat(session) : undefined
    },

    async sendMessage(payload: SendMessagePayload): Promise<{ ok: true }> {
      await http.post(`/chat/sessions/${payload.chatId}/messages`, {
        content: payload.content,
        type: "text",
      })
      return { ok: true }
    },

    async markRead(chatId: string): Promise<{ ok: true }> {
      try {
        await http.post(`/chat/sessions/${chatId}/read`)
      } catch { /* fallback */ }
      return { ok: true }
    },
  },

  profile: {
    async getMe(): Promise<DiscoverProfile> {
      const data = await http.get<BackendUser>("/users/me")
      return {
        id: data.id,
        name: data.nickname,
        age: 20,
        gender: data.gender === "male" ? "♂" : data.gender === "female" ? "♀" : data.gender,
        school: `${data.college} · ${data.grade} · ${data.campus}`,
        verified: `信用分 ${data.creditScore}`,
        post: data.bio ?? "",
        reason: "",
        safety: "",
        interests: data.tags,
        photos: data.avatar ? [data.avatar] : [],
      }
    },

    async updateMe(payload: UpdateProfilePayload): Promise<DiscoverProfile> {
      if (payload.interests !== undefined) {
        await http.put("/users/me/tags", { tags: payload.interests })
      }
      if (payload.post !== undefined || payload.reason !== undefined || payload.safety !== undefined) {
        await http.put("/users/me", { bio: payload.post })
      }
      return this.getMe()
    },
  },
}
