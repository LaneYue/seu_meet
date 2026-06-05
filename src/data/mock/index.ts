import type {
  Badge,
  CampusRoute,
  ChatRoom,
  CompanionScoreLog,
  Message,
  MockIdentity,
  PartnerPost,
  RelationshipPreference,
  Report,
  TrustProfile,
  UserBadge,
  UserProfile
} from "@/types"

const now = "2026-06-06T09:00:00.000+08:00"

export const currentUserId = "u01"

export const identities: MockIdentity[] = [
  { id: "u01", realName: "林澜", studentId: "220256389", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "计算机科学与工程学院", gradeRange: "本科高年级" },
  { id: "u02", realName: "周航", studentId: "220200102", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "建筑学院", gradeRange: "硕士" },
  { id: "u03", realName: "沈溪", studentId: "230100233", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "自动化学院", gradeRange: "本科低年级" },
  { id: "u04", realName: "陈予", studentId: "210340443", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "经济管理学院", gradeRange: "本科高年级" },
  { id: "u05", realName: "顾然", studentId: "240121561", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "交通学院", gradeRange: "本科低年级" },
  { id: "u06", realName: "韩青", studentId: "220734889", school: "东南大学", campus: "九龙湖", schoolOrDepartment: "土木工程学院", gradeRange: "硕士" },
  { id: "u07", realName: "何屿", studentId: "210899018", school: "东南大学", campus: "四牌楼", schoolOrDepartment: "建筑学院", gradeRange: "博士" },
  { id: "u08", realName: "袁之", studentId: "230668091", school: "东南大学", campus: "四牌楼", schoolOrDepartment: "人文学院", gradeRange: "硕士" },
  { id: "u09", realName: "赵宁", studentId: "220449301", school: "东南大学", campus: "四牌楼", schoolOrDepartment: "电子科学与工程学院", gradeRange: "本科高年级" },
  { id: "u10", realName: "苏棠", studentId: "230998771", school: "东南大学", campus: "丁家桥", schoolOrDepartment: "医学院", gradeRange: "硕士" },
  { id: "u11", realName: "魏知", studentId: "240553210", school: "东南大学", campus: "丁家桥", schoolOrDepartment: "公共卫生学院", gradeRange: "本科低年级" },
  { id: "u12", realName: "陆遥", studentId: "220780333", school: "东南大学", campus: "丁家桥", schoolOrDepartment: "生物科学与医学工程学院", gradeRange: "博士" }
]

export const profiles: UserProfile[] = [
  {
    id: "p01",
    userId: "u01",
    nickname: "湖畔编译器",
    campus: "九龙湖",
    departmentCategory: "信息/计算机",
    gradeRange: "本科高年级",
    bio: "想找稳定学习搭子，也喜欢用路线把校园重新走一遍。",
    interests: ["摄影", "夜跑", "算法", "咖啡", "展览"],
    socialGoals: ["学习搭子", "运动搭子", "兴趣交友"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p02",
    userId: "u02",
    nickname: "拱门观察员",
    campus: "九龙湖",
    departmentCategory: "建筑/设计",
    gradeRange: "硕士",
    bio: "会讲一点建筑和城市的小故事。",
    interests: ["建筑", "摄影", "城市漫步", "展览"],
    socialGoals: ["兴趣交友", "活动搭子", "认真关系意向"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: false, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p03",
    userId: "u03",
    nickname: "自动控制小队员",
    campus: "九龙湖",
    departmentCategory: "电子/自动化",
    gradeRange: "本科低年级",
    interests: ["机器人", "羽毛球", "自习", "竞赛"],
    socialGoals: ["竞赛组队", "学习搭子", "运动搭子"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p04",
    userId: "u04",
    nickname: "会计与晚饭",
    campus: "九龙湖",
    departmentCategory: "经管",
    gradeRange: "本科高年级",
    interests: ["羽毛球", "食堂探索", "读书会"],
    socialGoals: ["饭搭子", "活动搭子", "兴趣交友"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p05",
    userId: "u05",
    nickname: "地铁线研究员",
    campus: "九龙湖",
    departmentCategory: "交通",
    gradeRange: "本科低年级",
    interests: ["骑行", "地图", "校园路线", "志愿服务"],
    socialGoals: ["活动搭子", "兴趣交友"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: false, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p06",
    userId: "u06",
    nickname: "结构力学慢慢来",
    campus: "九龙湖",
    departmentCategory: "土木",
    gradeRange: "硕士",
    interests: ["晨跑", "考研答疑", "模型制作"],
    socialGoals: ["学习搭子", "运动搭子", "竞赛组队"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p07",
    userId: "u07",
    nickname: "老校区慢行",
    campus: "四牌楼",
    departmentCategory: "建筑/设计",
    gradeRange: "博士",
    interests: ["校史", "建筑", "散步", "讲座"],
    socialGoals: ["兴趣交友", "活动搭子"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: false, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p08",
    userId: "u08",
    nickname: "人文冷知识",
    campus: "四牌楼",
    departmentCategory: "人文",
    gradeRange: "硕士",
    interests: ["校史", "阅读", "播客", "展览"],
    socialGoals: ["兴趣交友", "活动搭子", "学习搭子"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p09",
    userId: "u09",
    nickname: "信号与咖啡",
    campus: "四牌楼",
    departmentCategory: "电子/自动化",
    gradeRange: "本科高年级",
    interests: ["电路", "咖啡", "夜跑", "摄影"],
    socialGoals: ["学习搭子", "运动搭子", "兴趣交友"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p10",
    userId: "u10",
    nickname: "白大褂和代码",
    campus: "丁家桥",
    departmentCategory: "医学",
    gradeRange: "硕士",
    interests: ["医学科普", "AI", "跑步", "读书"],
    socialGoals: ["竞赛组队", "兴趣交友", "认真关系意向"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p11",
    userId: "u11",
    nickname: "健康科普站",
    campus: "丁家桥",
    departmentCategory: "医学",
    gradeRange: "本科低年级",
    interests: ["公益", "健康科普", "手帐", "羽毛球"],
    socialGoals: ["活动搭子", "兴趣交友", "运动搭子"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: true, showInterests: true },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "p12",
    userId: "u12",
    nickname: "医工交叉笔记",
    campus: "丁家桥",
    departmentCategory: "医学",
    gradeRange: "博士",
    interests: ["科研", "医工交叉", "讲座", "项目开发"],
    socialGoals: ["竞赛组队", "学习搭子", "兴趣交友"],
    visibility: { showCampus: true, showDepartmentCategory: true, showGradeRange: false, showInterests: true },
    createdAt: now,
    updatedAt: now
  }
]

export const partnerPosts: PartnerPost[] = [
  { id: "pp01", authorId: "u08", type: "图书馆搭子", title: "今晚图书馆自习搭子", description: "19:00 到 22:00，互相提醒专注，结束后各自复盘 3 行。", campus: "九龙湖", locationText: "九龙湖图书馆公共自习区", startTime: "2026-06-06T19:00:00.000+08:00", endTime: "2026-06-06T22:00:00.000+08:00", maxParticipants: 4, currentParticipants: ["u08"], requirements: ["守时", "安静自习"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp02", authorId: "u04", type: "饭搭子", title: "周六晚饭搭子", description: "想试试新开的窗口，轻松聊学习和社团。", campus: "九龙湖", locationText: "桃园食堂", startTime: "2026-06-06T17:40:00.000+08:00", maxParticipants: 3, currentParticipants: ["u04"], requirements: ["公共场所见面"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp03", authorId: "u03", type: "运动搭子", title: "九龙湖夜跑搭子", description: "操场慢跑 3 公里，不卷配速，跑前确认身体状态。", campus: "九龙湖", locationText: "九龙湖操场", startTime: "2026-06-07T20:00:00.000+08:00", maxParticipants: 6, currentParticipants: ["u03"], requirements: ["量力而行"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp04", authorId: "u07", type: "展览搭子", title: "四牌楼文化路线同行", description: "一起看老校区建筑，结束后分享一个专业冷知识。", campus: "四牌楼", locationText: "四牌楼校区入口", startTime: "2026-06-08T15:00:00.000+08:00", maxParticipants: 5, currentParticipants: ["u07"], requirements: ["尊重安静教学区"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp05", authorId: "u10", type: "讲座搭子", title: "丁家桥医工交流", description: "医学和工科同学都欢迎，讨论一个真实问题的跨学科解法。", campus: "丁家桥", locationText: "丁家桥公共教学楼", startTime: "2026-06-09T14:00:00.000+08:00", maxParticipants: 8, currentParticipants: ["u10", "u12"], requirements: ["不公开个人病历信息"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp06", authorId: "u12", type: "项目开发", title: "黑客松项目组队", description: "找前端、产品和医学背景同学，一起做校园健康互助小工具。", campus: "不限", locationText: "线上同步 + 校内公共空间", startTime: "2026-06-10T19:30:00.000+08:00", maxParticipants: 5, currentParticipants: ["u12"], requirements: ["每晚 30 分钟同步"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp07", authorId: "u06", type: "学习搭子", title: "考研复习搭子", description: "数学和专业课打卡，周末统一复盘，拒绝焦虑输出。", campus: "九龙湖", locationText: "教学楼公共自习区", startTime: "2026-06-11T08:30:00.000+08:00", maxParticipants: 4, currentParticipants: ["u06"], requirements: ["每次结束写学习总结"], status: "open", createdAt: now, updatedAt: now },
  { id: "pp08", authorId: "u05", type: "跨校区同行", title: "跨校区同行搭子", description: "九龙湖到四牌楼办事，公共交通同行，路上交流学院信息。", campus: "不限", locationText: "九龙湖校门公共集合点", startTime: "2026-06-12T09:00:00.000+08:00", maxParticipants: 3, currentParticipants: ["u05"], requirements: ["不共享实时定位"], status: "open", createdAt: now, updatedAt: now }
]

export const campusRoutes: CampusRoute[] = [
  {
    id: "r01",
    title: "九龙湖学习搭子路线",
    campus: "九龙湖",
    description: "从公共集合点出发，完成自习、散步和学习总结，把线上认识转成低压力共同行动。",
    routeType: "学习",
    stops: [
      { id: "r01s01", title: "橘园/梅园/桃园附近集合", description: "只在公共空间集合，不显示宿舍楼栋。", checkinMethod: "manual", taskPrompt: "确认今日学习目标" },
      { id: "r01s02", title: "教学楼或图书馆自习", description: "共同专注 60 分钟，可分区就坐。", checkinMethod: "qr_mock", taskPrompt: "写下一个已完成小任务" },
      { id: "r01s03", title: "休息散步", description: "沿校园公共道路慢走，避免私密场所。", checkinMethod: "manual" },
      { id: "r01s04", title: "晚饭复盘", description: "用三句话复盘今日收获。", checkinMethod: "manual", taskPrompt: "提交今日学习总结" }
    ],
    estimatedMinutes: 150,
    recommendedGroupSize: "2-4 人",
    suitableGoals: ["学习搭子", "兴趣交友"],
    status: "official",
    usageCount: 126,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "r02",
    title: "四牌楼文化同行路线",
    campus: "四牌楼",
    description: "围绕老校区历史建筑、校史问答和成贤街轻社交，适合跨专业交流。",
    routeType: "文化",
    stops: [
      { id: "r02s01", title: "四牌楼校区公共集合点", description: "确认同行成员与安全提醒。", checkinMethod: "manual" },
      { id: "r02s02", title: "校园历史建筑打卡", description: "分享一个建筑或校史观察。", checkinMethod: "photo_optional" },
      { id: "r02s03", title: "专业冷知识交换", description: "每人分享一个本专业小知识。", checkinMethod: "manual" },
      { id: "r02s04", title: "校史问答", description: "完成 3 题 mock 校史问答。", checkinMethod: "qr_mock" }
    ],
    estimatedMinutes: 100,
    recommendedGroupSize: "2-5 人",
    suitableGoals: ["兴趣交友", "活动搭子"],
    status: "official",
    usageCount: 88,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "r03",
    title: "丁家桥医工交流路线",
    campus: "丁家桥",
    description: "用医学科普任务和跨学科交流，生成一个医工交叉想法卡片。",
    routeType: "跨专业",
    stops: [
      { id: "r03s01", title: "丁家桥校区公共集合点", description: "确认成员与公共空间原则。", checkinMethod: "manual" },
      { id: "r03s02", title: "医学主题打卡", description: "选择一个健康科普主题。", checkinMethod: "qr_mock" },
      { id: "r03s03", title: "健康科普小任务", description: "把一个专业概念解释给非本专业同学。", checkinMethod: "manual" },
      { id: "r03s04", title: "医工想法卡", description: "共同生成一个医工交叉项目想法。", checkinMethod: "manual" }
    ],
    estimatedMinutes: 120,
    recommendedGroupSize: "3-6 人",
    suitableGoals: ["竞赛组队", "学习搭子", "兴趣交友"],
    status: "official",
    usageCount: 64,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "r04",
    title: "九龙湖晨跑互助路线",
    campus: "九龙湖",
    description: "学生投稿，围绕操场和公共绿道的低强度晨跑。",
    routeType: "运动",
    stops: [{ id: "r04s01", title: "操场公共入口", description: "热身并确认身体状态。", checkinMethod: "manual" }],
    estimatedMinutes: 45,
    recommendedGroupSize: "2-6 人",
    suitableGoals: ["运动搭子"],
    status: "community_pending",
    createdBy: "u03",
    usageCount: 0,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "r05",
    title: "跨校区公共交通同行路线",
    campus: "九龙湖",
    description: "学生投稿，强调不共享实时定位，只约定公开集合点。",
    routeType: "跨校区",
    stops: [{ id: "r05s01", title: "校门公共集合点", description: "确认目的校区与公共交通方案。", checkinMethod: "manual" }],
    estimatedMinutes: 80,
    recommendedGroupSize: "2-3 人",
    suitableGoals: ["活动搭子", "兴趣交友"],
    status: "community_pending",
    createdBy: "u05",
    usageCount: 0,
    createdAt: now,
    updatedAt: now
  }
]

export const badges: Badge[] = [
  { id: "b01", title: "图书馆同行者", description: "完成 1 次学习搭子路线。", category: "学习", icon: "BookOpen", unlockRule: "complete_route:r01", rarity: "common" },
  { id: "b02", title: "九龙湖探索者", description: "完成九龙湖路线。", category: "路线贡献", icon: "Map", unlockRule: "complete_campus:九龙湖", rarity: "common" },
  { id: "b03", title: "四牌楼文化同行者", description: "完成四牌楼文化路线。", category: "文化", icon: "Landmark", unlockRule: "complete_route:r02", rarity: "rare" },
  { id: "b04", title: "医工交流初体验", description: "完成丁家桥医工路线。", category: "跨专业", icon: "HeartPulse", unlockRule: "complete_route:r03", rarity: "rare" },
  { id: "b05", title: "守约搭子", description: "完成 3 次无爽约活动。", category: "守约", icon: "ShieldCheck", unlockRule: "partner_activity:3", rarity: "rare" },
  { id: "b06", title: "路线主理人", description: "提交 1 条被审核通过的校园路线。", category: "路线贡献", icon: "Route", unlockRule: "approved_route:1", rarity: "epic" },
  { id: "b07", title: "跨专业连接者", description: "与 3 个不同学院大类同学完成活动。", category: "跨专业", icon: "Network", unlockRule: "cross_department:3", rarity: "epic" }
]

export const userBadges: UserBadge[] = [
  { id: "ub01", userId: "u01", badgeId: "b01", unlockedAt: "2026-06-01T20:10:00.000+08:00" },
  { id: "ub02", userId: "u01", badgeId: "b02", unlockedAt: "2026-06-02T18:20:00.000+08:00" },
  { id: "ub03", userId: "u08", badgeId: "b03", unlockedAt: "2026-06-03T18:20:00.000+08:00" }
]

export const scoreLogs: CompanionScoreLog[] = [
  { id: "s01", userId: "u01", sourceType: "route_checkin", points: 20, reason: "完成九龙湖学习搭子路线", createdAt: "2026-06-02T18:20:00.000+08:00" },
  { id: "s02", userId: "u01", sourceType: "badge_unlock", points: 15, reason: "获得图书馆同行者徽章", createdAt: "2026-06-02T18:21:00.000+08:00" },
  { id: "s03", userId: "u01", sourceType: "partner_activity", points: 10, reason: "完成图书馆自习搭子活动", createdAt: "2026-06-03T22:00:00.000+08:00" },
  { id: "s04", userId: "u01", sourceType: "positive_feedback", points: 5, reason: "收到正向互评", createdAt: "2026-06-03T22:10:00.000+08:00" },
  { id: "s05", userId: "u01", sourceType: "route_checkin", points: 70, reason: "今日多条路线计入上限测试", createdAt: "2026-06-06T12:00:00.000+08:00" },
  { id: "s06", userId: "u01", sourceType: "badge_unlock", points: 30, reason: "今日徽章计入上限测试", createdAt: "2026-06-06T12:10:00.000+08:00" }
]

export const trustProfiles: TrustProfile[] = [
  { userId: "u01", trustScore: 96, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 7, updatedAt: now },
  { userId: "u02", trustScore: 92, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 4, updatedAt: now },
  { userId: "u03", trustScore: 89, status: "normal", noShowCount: 1, validReportCount: 0, positiveFeedbackCount: 3, updatedAt: now },
  { userId: "u04", trustScore: 86, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 2, updatedAt: now },
  { userId: "u05", trustScore: 84, status: "normal", noShowCount: 1, validReportCount: 0, positiveFeedbackCount: 2, updatedAt: now },
  { userId: "u06", trustScore: 91, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 5, updatedAt: now },
  { userId: "u07", trustScore: 94, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 6, updatedAt: now },
  { userId: "u08", trustScore: 97, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 8, updatedAt: now },
  { userId: "u09", trustScore: 88, status: "normal", noShowCount: 1, validReportCount: 0, positiveFeedbackCount: 3, updatedAt: now },
  { userId: "u10", trustScore: 93, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 4, updatedAt: now },
  { userId: "u11", trustScore: 90, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 2, updatedAt: now },
  { userId: "u12", trustScore: 95, status: "normal", noShowCount: 0, validReportCount: 0, positiveFeedbackCount: 5, updatedAt: now }
]

export const relationshipPreferences: RelationshipPreference[] = [
  { userId: "u01", enabled: true, relationshipGoal: "慢慢了解", preferredCampuses: ["九龙湖", "四牌楼"], preferredAgeStage: ["本科高年级", "硕士"], communicationStyle: ["慢热", "文字沟通", "边做事边聊天"], activityPreference: ["自习", "散步", "展览"], dailyRecommendationLimit: 3 },
  { userId: "u02", enabled: true, relationshipGoal: "慢慢了解", preferredCampuses: ["九龙湖"], preferredAgeStage: ["本科高年级", "硕士"], communicationStyle: ["慢热", "线下公共活动"], activityPreference: ["散步", "展览", "咖啡"], dailyRecommendationLimit: 3 },
  { userId: "u10", enabled: true, relationshipGoal: "认真关系", preferredCampuses: ["丁家桥", "九龙湖"], preferredAgeStage: ["硕士", "博士"], communicationStyle: ["真诚直接", "低频沟通"], activityPreference: ["跑步", "读书", "讲座"], dailyRecommendationLimit: 3 },
  { userId: "u08", enabled: true, relationshipGoal: "暂时观望", preferredCampuses: ["四牌楼", "九龙湖"], communicationStyle: ["文字沟通", "慢热"], activityPreference: ["阅读", "展览"], dailyRecommendationLimit: 3 }
]

export const chatRooms: ChatRoom[] = [
  { id: "c01", participantIds: ["u01", "u08"], matchType: "partner", status: "active", createdAt: now, updatedAt: now },
  { id: "c02", participantIds: ["u01", "u02"], matchType: "friend", status: "active", createdAt: now, updatedAt: now },
  { id: "c03", participantIds: ["u01", "u10"], matchType: "relationship", status: "active", createdAt: now, updatedAt: now }
]

export const messages: Message[] = [
  { id: "m01", roomId: "c01", senderId: "u08", content: "今晚图书馆还按 19:00 吗？我们就在公共自习区见。", moderationStatus: "clean", createdAt: "2026-06-06T10:00:00.000+08:00" },
  { id: "m02", roomId: "c01", senderId: "u01", content: "可以，结束后各自写三行复盘。", moderationStatus: "clean", createdAt: "2026-06-06T10:02:00.000+08:00" },
  { id: "m03", roomId: "c02", senderId: "u02", content: "你也喜欢摄影的话，四牌楼路线应该很合适。", moderationStatus: "clean", createdAt: "2026-06-06T10:10:00.000+08:00" }
]

export const reports: Report[] = [
  { id: "rep01", reporterId: "u01", targetUserId: "u05", category: "爽约", description: "对方两次确认后未到公共集合点。", status: "pending", createdAt: "2026-06-06T08:30:00.000+08:00", updatedAt: "2026-06-06T08:30:00.000+08:00" },
  { id: "rep02", reporterId: "u08", targetMessageId: "m03", category: "诱导不安全见面", description: "对方建议离开校园公共空间见面。", status: "reviewing", createdAt: "2026-06-05T21:30:00.000+08:00", updatedAt: "2026-06-05T22:00:00.000+08:00" },
  { id: "rep03", reporterId: "u10", targetPostId: "pp06", category: "虚假信息", description: "项目介绍与实际招募内容不一致，需要核查。", status: "pending", createdAt: "2026-06-05T19:20:00.000+08:00", updatedAt: "2026-06-05T19:20:00.000+08:00" }
]
