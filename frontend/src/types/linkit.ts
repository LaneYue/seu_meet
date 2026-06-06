import type { LucideIcon } from "lucide-react"

export type PillTone = "green" | "blue" | "orange" | "purple" | "gray" | string

export type Person = {
  id: string
  name: string
  school: string
  status: string
  tags: string[]
  intro: string
  color: string
  avatar: string
}

export type DiscoverProfile = {
  id: string
  name: string
  age: number
  gender: string
  school: string
  verified: string
  post: string
  reason: string
  safety: string
  interests: string[]
  photos: string[]
}

export type PartnerPost = {
  id: string
  title: string
  status: string
  time: string
  place: string
  joined: number
  total: number
  note: string
  tone: PillTone
}

export type CampusRoute = {
  id: string
  title: string
  badge: string
  campus: string
  duration: string
  difficulty: string
  people: string
  nodes: number
  progress: number
  image: string
  intro: string
  tags: string[]
}

export type ChatItem = {
  id: string
  name: string
  tag: string
  message: string
  time: string
  unread: number
  avatar: string
  sessionType?: string
}

export type RouteStep = {
  title: string
  desc: string
  method: string
  status: string
}

export type BadgeItem = {
  name: string
  level: string
  icon: LucideIcon
}
