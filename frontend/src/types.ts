export type Section = "全部" | "活动" | "攻略" | "动态" | "约玩"

export type User = {
  id: string
  nickname: string
  college: string
  grade: string
  campus: string
  bio: string
  tags: string[]
  creditScore: number
  points: number
  avatar: string
  gradient: string
}

export type Activity = {
  id: string
  title: string
  time: string
  place: string
  host: string
  joined: number
  capacity: number
  tags: string[]
  gradient: string
}

export type Guide = {
  id: string
  title: string
  author: string
  rating: number
  sales: number
  price: number
  tags: string[]
  description: string
  gradient: string
}

export type Feed = {
  id: string
  user: string
  meta: string
  content: string
  likes: number
  comments: number
  gradient: string
}

export type PlayPost = {
  id: string
  user: string
  college: string
  text: string
  place: string
  time: string
  limit: number
  joined: number
}

export type ChatSession = {
  id: string
  userId: string
  stage: "ice_breaking" | "normal" | "resonance"
  lastMessage: string
  unread: number
  updatedAt: string
}

export type Message = {
  id: string
  sessionId: string
  sender: "me" | "other"
  content: string
  createdAt: string
}
