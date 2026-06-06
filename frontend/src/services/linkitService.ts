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

export type SwipeActionPayload = {
  profileId: string
  action: SwipeAction
}

export type PartnerActionPayload = {
  postId: string
  action: JoinPartnerAction
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
  listPosts(): Promise<PartnerPost[]>
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
  listChats(): Promise<ChatItem[]>
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

export const mockLinkitService: LinkitService = {
  discover: {
    listProfiles: () => resolveMock(discoverProfiles),
    getProfile: (profileId) => resolveMock(discoverProfiles.find((profile) => profile.id === profileId)),
    recordSwipe: () => resolveMock({ ok: true })
  },
  partners: {
    listPosts: () => resolveMock(partnerPosts),
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
    listChats: () => resolveMock(chats),
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
