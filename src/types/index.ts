export type Campus = "九龙湖" | "四牌楼" | "丁家桥"
export type CampusFilter = Campus | "不限"
export type GradeRange = "本科低年级" | "本科高年级" | "硕士" | "博士"
export type DepartmentCategory =
  | "信息/计算机"
  | "建筑/设计"
  | "电子/自动化"
  | "医学"
  | "经管"
  | "人文"
  | "交通"
  | "土木"

export type SocialGoal =
  | "兴趣交友"
  | "学习搭子"
  | "饭搭子"
  | "运动搭子"
  | "活动搭子"
  | "竞赛组队"
  | "认真关系意向"

export type MockIdentity = {
  id: string
  realName: string
  studentId: string
  school: "东南大学"
  campus: Campus
  schoolOrDepartment: string
  gradeRange: GradeRange
}

export type ProfileVisibility = {
  showCampus: boolean
  showDepartmentCategory: boolean
  showGradeRange: boolean
  showInterests: boolean
}

export type UserProfile = {
  id: string
  userId: string
  nickname: string
  avatarUrl?: string
  campus: Campus
  departmentCategory: DepartmentCategory
  gradeRange: GradeRange
  bio?: string
  interests: string[]
  socialGoals: SocialGoal[]
  visibility: ProfileVisibility
  createdAt: string
  updatedAt: string
}

export type PublicProfile = Omit<UserProfile, "userId" | "createdAt" | "updatedAt">

export type PartnerType =
  | "学习搭子"
  | "图书馆搭子"
  | "饭搭子"
  | "运动搭子"
  | "讲座搭子"
  | "展览搭子"
  | "跨校区同行"
  | "竞赛组队"
  | "项目开发"

export type PartnerPost = {
  id: string
  authorId: string
  type: PartnerType
  title: string
  description: string
  campus: CampusFilter
  locationText?: string
  startTime: string
  endTime?: string
  maxParticipants: number
  currentParticipants: string[]
  requirements?: string[]
  status: "open" | "matched" | "closed" | "cancelled"
  createdAt: string
  updatedAt: string
}

export type RelationshipPreference = {
  userId: string
  enabled: boolean
  relationshipGoal: "慢慢了解" | "认真关系" | "暂时观望"
  preferredCampuses: Campus[]
  preferredAgeStage?: GradeRange[]
  communicationStyle: string[]
  activityPreference: string[]
  dealbreakers?: string[]
  dailyRecommendationLimit: number
}

export type RouteType = "学习" | "运动" | "文化" | "公益" | "跨专业" | "跨校区"

export type RouteStop = {
  id: string
  title: string
  description: string
  checkinMethod: "manual" | "qr_mock" | "photo_optional"
  taskPrompt?: string
}

export type CampusRoute = {
  id: string
  title: string
  campus: Campus
  description: string
  routeType: RouteType
  stops: RouteStop[]
  estimatedMinutes: number
  recommendedGroupSize: string
  suitableGoals: SocialGoal[]
  status: "official" | "community_pending" | "community_approved" | "rejected"
  createdBy?: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

export type RouteCheckin = {
  id: string
  routeId: string
  userId: string
  groupId?: string
  stopId: string
  status: "completed"
  proofType: "manual" | "qr_mock" | "photo_optional"
  note?: string
  createdAt: string
}

export type Badge = {
  id: string
  title: string
  description: string
  category: "学习" | "运动" | "文化" | "公益" | "跨专业" | "路线贡献" | "守约"
  icon: string
  unlockRule: string
  rarity: "common" | "rare" | "epic"
}

export type UserBadge = {
  id: string
  userId: string
  badgeId: string
  unlockedAt: string
}

export type CompanionScoreLog = {
  id: string
  userId: string
  sourceType:
    | "route_checkin"
    | "partner_activity"
    | "badge_unlock"
    | "route_contribution"
    | "positive_feedback"
    | "penalty"
  points: number
  reason: string
  createdAt: string
}

export type TrustProfile = {
  userId: string
  trustScore: number
  status: "normal" | "limited" | "frozen" | "banned"
  noShowCount: number
  validReportCount: number
  positiveFeedbackCount: number
  updatedAt: string
}

export type ChatRoom = {
  id: string
  participantIds: string[]
  matchType: "friend" | "partner" | "relationship"
  status: "active" | "closed" | "reported"
  createdAt: string
  updatedAt: string
}

export type Message = {
  id: string
  roomId: string
  senderId: string
  content: string
  moderationStatus: "clean" | "flagged" | "blocked"
  createdAt: string
}

export type Report = {
  id: string
  reporterId: string
  targetUserId?: string
  targetPostId?: string
  targetMessageId?: string
  category:
    | "骚扰"
    | "虚假信息"
    | "爽约"
    | "攻击性内容"
    | "诱导不安全见面"
    | "刷分"
    | "其他"
  description: string
  status: "pending" | "reviewing" | "resolved" | "rejected"
  adminNote?: string
  createdAt: string
  updatedAt: string
}

export type Recommendation<T> = {
  item: T
  score: number
  reasons: string[]
}
