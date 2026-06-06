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
    unread: 0,
    avatar: s.targetUser?.nickname?.charAt(0) ?? "?",
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
      const actionMap: Record<string, string> = { like: "like", dislike: "pass", skip: "pass" }
      await http.post(`/match/${payload.profileId}/action`, { action: actionMap[payload.action] ?? "pass" })
      return { ok: true }
    },
  },

  partners: {
    async listPosts(): Promise<PartnerPost[]> {
      // 后端暂无广场接口，保留 mock 兜底
      const { partnerPosts } = await import("../data/mock/linkit")
      return partnerPosts
    },

    async createPost(payload: CreatePartnerPostPayload): Promise<PartnerPost> {
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
    },

    async submitAction(): Promise<{ ok: true }> {
      return { ok: true }
    },
  },

  routes: {
    async listRoutes(): Promise<CampusRoute[]> {
      // 后端暂无路线接口，保留 mock 兜底
      const { routes } = await import("../data/mock/linkit")
      return routes
    },

    async getRoute(routeId: string): Promise<CampusRoute | undefined> {
      const { routes } = await import("../data/mock/linkit")
      return routes.find((r) => r.id === routeId)
    },

    async listSteps(): Promise<RouteStep[]> {
      const { routeSteps } = await import("../data/mock/linkit")
      return routeSteps
    },

    async listBadges(): Promise<BadgeItem[]> {
      const { badges } = await import("../data/mock/linkit")
      return badges
    },

    async checkIn(): Promise<{ ok: true }> {
      await http.post("/points/checkin")
      return { ok: true }
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
