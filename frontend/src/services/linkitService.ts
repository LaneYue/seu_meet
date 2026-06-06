import {
  badges,
  chats,
  discoverProfiles,
  myProfile,
  partnerPosts,
  routeSteps,
  routes
} from "../data/mock/linkit"
import type {
  BadgeItem,
  CampusRoute,
  ChatItem,
  DiscoverProfile,
  PartnerPost,
  RouteStep
} from "../types/linkit"

export type SwipeAction = "like" | "dislike" | "skip"
export type JoinPartnerAction = "join" | "request"
export type PartnerCategory = "all" | "study" | "sport" | "life" | "interest"
export type MessageCategory = "all" | "partners" | "routes" | "relationship" | "system"

export type SwipeActionPayload = {
  profileId: string
  action: SwipeAction
}

export type PartnerActionPayload = {
  postId: string
  action: JoinPartnerAction
}

export type CreatePartnerPostPayload = {
  title: string
  type: Exclude<PartnerCategory, "all">
  time: string
  place: string
  capacity: number
  note: string
}

export type CheckInPayload = {
  routeId: string
  stepTitle: string
}

export type SendMessagePayload = {
  chatId: string
  content: string
}

export type UpdateProfilePayload = Partial<Pick<DiscoverProfile, "post" | "interests" | "photos" | "reason" | "safety">>

export type DiscoverService = {
  listProfiles(): Promise<DiscoverProfile[]>
  getProfile(profileId: string): Promise<DiscoverProfile | undefined>
  recordSwipe(payload: SwipeActionPayload): Promise<{ ok: true }>
}

export type PartnerService = {
  listPosts(category?: PartnerCategory): Promise<PartnerPost[]>
  createPost(payload: CreatePartnerPostPayload): Promise<PartnerPost>
  submitAction(payload: PartnerActionPayload): Promise<{ ok: true }>
}

export type RouteService = {
  listRoutes(): Promise<CampusRoute[]>
  getRoute(routeId: string): Promise<CampusRoute | undefined>
  listSteps(routeId: string): Promise<RouteStep[]>
  listBadges(): Promise<BadgeItem[]>
  checkIn(payload: CheckInPayload): Promise<{ ok: true }>
}

export type MessageService = {
  listChats(category?: MessageCategory): Promise<ChatItem[]>
  getChat(chatId: string): Promise<ChatItem | undefined>
  sendMessage(payload: SendMessagePayload): Promise<{ ok: true }>
}

export type ProfileService = {
  getMe(): Promise<DiscoverProfile>
  updateMe(payload: UpdateProfilePayload): Promise<DiscoverProfile>
}

export type LinkitService = {
  discover: DiscoverService
  partners: PartnerService
  routes: RouteService
  messages: MessageService
  profile: ProfileService
}

const resolveMock = async <T>(value: T): Promise<T> => value

const partnerCategoryPostIds: Record<PartnerCategory, string[]> = {
  all: partnerPosts.map((post) => post.id),
  study: ["library-night"],
  sport: ["badminton"],
  life: ["library-night", "sipaifang-walk"],
  interest: ["sipaifang-walk"]
}

const messageCategoryChatIds: Record<MessageCategory, string[]> = {
  all: chats.map((chat) => chat.id),
  partners: ["xiaocheng"],
  routes: ["badminton-team"],
  relationship: [],
  system: ["safety"]
}

export const mockLinkitService: LinkitService = {
  discover: {
    listProfiles: () => resolveMock(discoverProfiles),
    getProfile: (profileId) => resolveMock(discoverProfiles.find((profile) => profile.id === profileId)),
    recordSwipe: () => resolveMock({ ok: true })
  },
  partners: {
    listPosts: (category = "all") => resolveMock(partnerPosts.filter((post) => partnerCategoryPostIds[category].includes(post.id))),
    createPost: (payload) => resolveMock({
      id: `mock-${Date.now()}`,
      title: payload.title,
      status: "招募中",
      time: payload.time,
      place: payload.place,
      joined: 1,
      total: payload.capacity,
      note: payload.note,
      tone: payload.type === "sport" ? "purple" : payload.type === "life" ? "orange" : "green"
    }),
    submitAction: () => resolveMock({ ok: true })
  },
  routes: {
    listRoutes: () => resolveMock(routes),
    getRoute: (routeId) => resolveMock(routes.find((route) => route.id === routeId)),
    listSteps: () => resolveMock(routeSteps),
    listBadges: () => resolveMock(badges),
    checkIn: () => resolveMock({ ok: true })
  },
  messages: {
    listChats: (category = "all") => resolveMock(chats.filter((chat) => messageCategoryChatIds[category].includes(chat.id))),
    getChat: (chatId) => resolveMock(chats.find((chat) => chat.id === chatId)),
    sendMessage: () => resolveMock({ ok: true })
  },
  profile: {
    getMe: () => resolveMock(myProfile),
    updateMe: (payload) => resolveMock({ ...myProfile, ...payload })
  }
}

// Swap this export to a real HTTP implementation when the backend is ready.
export const linkitService: LinkitService = mockLinkitService
