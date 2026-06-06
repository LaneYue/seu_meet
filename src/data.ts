import type { Activity, ChatSession, Feed, Guide, Message, PlayPost, User } from "./types"

export const currentUser: User = {
  id: "me",
  nickname: "三三",
  college: "信息学院",
  grade: "大三",
  campus: "九龙湖",
  bio: "喜欢路线探索、篮球和安静自习，想认识靠谱同学。",
  tags: ["自习", "篮球", "摄影", "路线攻略"],
  creditScore: 92,
  points: 120,
  avatar: "三",
  gradient: "linear-gradient(135deg,#006e2f,#22c55e)"
}

export const users: User[] = [
  {
    id: "u1",
    nickname: "鹿鸣",
    college: "建筑学院",
    grade: "研一",
    campus: "四牌楼",
    bio: "画图之余想找人一起喝咖啡，探索南京和老校区建筑。",
    tags: ["建筑", "咖啡", "CityWalk", "摄影"],
    creditScore: 96,
    points: 88,
    avatar: "鹿",
    gradient: "linear-gradient(135deg,#22c55e,#0b1c30)"
  },
  {
    id: "u2",
    nickname: "小满",
    college: "医学院",
    grade: "大二",
    campus: "丁家桥",
    bio: "周末做健康科普，也想找人一起跑步和看讲座。",
    tags: ["医学", "跑步", "讲座", "公益"],
    creditScore: 89,
    points: 74,
    avatar: "满",
    gradient: "linear-gradient(135deg,#6063ee,#22c55e)"
  },
  {
    id: "u3",
    nickname: "阿舟",
    college: "经管学院",
    grade: "大四",
    campus: "九龙湖",
    bio: "准备保研复试，想找高质量自习搭子和靠谱饭搭子。",
    tags: ["自习", "保研", "羽毛球", "美食"],
    creditScore: 84,
    points: 132,
    avatar: "舟",
    gradient: "linear-gradient(135deg,#ff8e4d,#006e2f)"
  }
]

export const activities: Activity[] = [
  {
    id: "a1",
    title: "校园三人篮球赛现场观赛团",
    time: "6月15日 14:00",
    place: "九龙湖体育馆",
    host: "篮球社长小王",
    joined: 12,
    capacity: 20,
    tags: ["篮球", "体育", "观赛"],
    gradient: "linear-gradient(135deg,#006e2f,#22c55e)"
  },
  {
    id: "a2",
    title: "四牌楼建筑夜游",
    time: "今晚 19:30",
    place: "四牌楼大礼堂",
    host: "鹿鸣",
    joined: 5,
    capacity: 8,
    tags: ["建筑", "夜游", "摄影"],
    gradient: "linear-gradient(135deg,#9d4300,#ff8e4d)"
  }
]

export const guides: Guide[] = [
  {
    id: "g1",
    title: "九龙湖轻松同行一小时",
    author: "攻略达人",
    rating: 4.8,
    sales: 128,
    price: 5,
    tags: ["散步", "图书馆", "低压力"],
    description: "图书馆、湖边、食堂公共区域和傍晚散步路线，适合第一次轻松同行。",
    gradient: "linear-gradient(135deg,#22c55e,#dce9ff)"
  },
  {
    id: "g2",
    title: "跨校区探索全攻略",
    author: "校区通",
    rating: 4.7,
    sales: 76,
    price: 8,
    tags: ["跨校区", "公交", "拍照"],
    description: "九龙湖到四牌楼公共交通路线，包含安全集合点与返程建议。",
    gradient: "linear-gradient(135deg,#6063ee,#e5eeff)"
  }
]

export const feeds: Feed[] = [
  {
    id: "f1",
    user: "三三",
    meta: "信息学院 · 2小时前",
    content: "今天和搭子一起完成了九龙湖骑行路线，最后的晚霞真的很值。",
    likes: 12,
    comments: 3,
    gradient: "linear-gradient(135deg,#006e2f,#4ae176)"
  }
]

export const playPosts: PlayPost[] = [
  {
    id: "p1",
    user: "小明",
    college: "信息学院 大三",
    text: "今天下午5点有人一起去橘园吃饭吗？",
    place: "橘园食堂",
    time: "今天 17:00",
    limit: 2,
    joined: 1
  }
]

export const chatSessions: ChatSession[] = [
  {
    id: "c1",
    userId: "u1",
    stage: "ice_breaking",
    lastMessage: "破冰问题已发送，等待对方审核",
    unread: 1,
    updatedAt: "10:42"
  },
  {
    id: "c2",
    userId: "u3",
    stage: "normal",
    lastMessage: "今晚图书馆还按 19:00 吗？",
    unread: 0,
    updatedAt: "昨天"
  }
]

export const messages: Message[] = [
  { id: "m1", sessionId: "c2", sender: "other", content: "今晚图书馆还按 19:00 吗？", createdAt: "18:20" },
  { id: "m2", sessionId: "c2", sender: "me", content: "可以，结束后各自写三行复盘。", createdAt: "18:22" },
  { id: "m3", sessionId: "c2", sender: "other", content: "好，我带电脑和水杯。", createdAt: "18:24" }
]
