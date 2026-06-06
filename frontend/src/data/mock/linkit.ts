import { Award, BookOpen, Compass, ShieldCheck } from "lucide-react"
import type {
  BadgeItem,
  CampusRoute,
  ChatItem,
  DiscoverProfile,
  PartnerPost,
  Person,
  RouteStep
} from "../../types/linkit"

export const people: Person[] = [
  {
    id: "lin",
    name: "小澄同学",
    school: "计算机学院 · 大二",
    status: "已认证",
    tags: ["羽毛球", "写代码", "音乐"],
    intro: "想找一起刷题的伙伴，也可以一起打球放松。",
    color: "linear-gradient(135deg,#dbeafe,#86efac)",
    avatar: "澄"
  },
  {
    id: "xinghe",
    name: "星河漫游者",
    school: "人文学院 · 大三",
    status: "已认证",
    tags: ["摄影", "骑行", "电影"],
    intro: "喜欢校园探索和胶片，周末常在老校区拍照。",
    color: "linear-gradient(135deg,#fef3c7,#bae6fd)",
    avatar: "星"
  },
  {
    id: "morning",
    name: "早睡早起",
    school: "经济学院 · 大一",
    status: "已认证",
    tags: ["自习", "跑步", "咖啡"],
    intro: "早八互相叫醒，一起自律打卡。",
    color: "linear-gradient(135deg,#fce7f3,#dcfce7)",
    avatar: "早"
  }
]

export const discoverProfiles: DiscoverProfile[] = [
  {
    id: "sisi",
    name: "梓宁",
    age: 20,
    gender: "♀",
    school: "人文学院 · 大二 · 四牌楼校区",
    verified: "东大学生已认证",
    post: "周末想去四牌楼拍老建筑和梧桐树影，找一个轻松同行的摄影搭子。",
    reason: "你们都收藏了四牌楼文化同行路线，也都喜欢校园摄影。",
    safety: "建议从校园公共空间集合，先完成一次短路线同行。",
    interests: ["摄影", "CityWalk", "咖啡", "博物馆"],
    photos: [
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "anyi",
    name: "安屿",
    age: 21,
    gender: "♂",
    school: "计算机学院 · 大三 · 九龙湖校区",
    verified: "统一身份认证",
    post: "今晚在李文正图书馆刷算法题，希望找一个安静自习搭子，结束后可以湖边走走。",
    reason: "你们都参加过九龙湖学习路线，学习时间也比较接近。",
    safety: "自习搭子建议选择图书馆、教学楼等公共空间。",
    interests: ["算法", "羽毛球", "音乐", "夜跑"],
    photos: [
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=600&q=80"
    ]
  },
  {
    id: "muxi",
    name: "慕溪",
    age: 19,
    gender: "♀",
    school: "建筑学院 · 大一 · 九龙湖校区",
    verified: "东大学生已认证",
    post: "想找人一起完成校园速写练习，顺便交换一些跨专业选课经验。",
    reason: "你关注了建筑与信息交流，本周也浏览过校园路线。",
    safety: "先从白天路线开始，保持低压力沟通。",
    interests: ["速写", "展览", "骑行", "手作"],
    photos: [
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80"
    ]
  }
]

const _myProfile: DiscoverProfile = {
  id: "me",
  name: "林岚",
  age: 20,
  gender: "♀",
  school: "信息学院 · 大二 · 九龙湖校区",
  verified: "东大学生已认证",
  post: "最近想找一个可以一起自习、散步、探索校园路线的同行搭子。喜欢轻松聊天，也喜欢各自专注。",
  reason: "你们都关注了学习搭子和九龙湖校园路线，适合从一次公共空间同行开始。",
  safety: "我的主页对外只展示昵称、学院大类、校区和兴趣，不展示真实姓名、学号和手机号。",
  interests: ["自习", "摄影", "路线打卡", "咖啡"],
  photos: [
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
  ]
}

/** 可变副本，供编辑页面修改后全页面即时生效 */
export const myProfile: DiscoverProfile = { ..._myProfile }

/** 直接在内存中更新 mock 资料（接入后端前使用） */
export function updateMockProfile(patch: Partial<DiscoverProfile>) {
  Object.assign(myProfile, patch)
}

export const partnerPosts: PartnerPost[] = [
  {
    id: "library-night",
    title: "今晚图书馆自习搭子",
    status: "进行中",
    time: "今天 19:00-22:00",
    place: "九龙湖图书馆 · 研习区",
    joined: 4,
    total: 6,
    note: "一起专注学习，互相监督，效率翻倍。",
    tone: "green"
  },
  {
    id: "sipaifang-walk",
    title: "四牌楼文化路线同行",
    status: "招募中",
    time: "本周六 14:00-17:00",
    place: "四牌楼校区",
    joined: 5,
    total: 8,
    note: "一起逛校园历史建筑，拍照打卡。",
    tone: "orange"
  },
  {
    id: "badminton",
    title: "羽毛球搭子（周三晚）",
    status: "招募中",
    time: "周三 18:30-20:30",
    place: "九龙湖体育馆 · 羽毛球馆",
    joined: 3,
    total: 6,
    note: "双打新手也欢迎，快乐运动最重要。",
    tone: "purple"
  }
]

export const routes: CampusRoute[] = [
  {
    id: "jiulonghu",
    title: "九龙湖学习搭子路线",
    badge: "官方路线",
    campus: "九龙湖",
    duration: "约 1 天",
    difficulty: "轻松",
    people: "1.2k",
    nodes: 8,
    progress: 3,
    image:
      "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
    intro: "从图书馆到教学楼，串起一次温和的共同学习行动。",
    tags: ["自习", "图书馆", "守约"]
  },
  {
    id: "sipaifang",
    title: "四牌楼文化同行路线",
    badge: "人文探索",
    campus: "四牌楼",
    duration: "约 3 小时",
    difficulty: "轻松",
    people: "860",
    nodes: 6,
    progress: 1,
    image:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=900&q=80",
    intro: "一起走过老校区建筑与树影，认识校园里的另一面。",
    tags: ["文化", "摄影", "历史"]
  },
  {
    id: "dingjiaqiao",
    title: "丁家桥医工交流路线",
    badge: "跨专业",
    campus: "丁家桥",
    duration: "约 2 小时",
    difficulty: "适中",
    people: "420",
    nodes: 5,
    progress: 0,
    image:
      "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=900&q=80",
    intro: "在医学与工程之间，找到一次低压力的交流机会。",
    tags: ["医工", "交流", "公益"]
  }
]

export const chats: ChatItem[] = [
  {
    id: "xiaocheng",
    name: "小澄同学",
    tag: "搭子请求",
    message: "想和你一起做算法题。",
    time: "10:25",
    unread: 2,
    avatar: "澄"
  },
  {
    id: "badminton-team",
    name: "羽毛球搭子群（6）",
    tag: "路线小队",
    message: "明天场地已订，记得带拍！",
    time: "昨天 22:38",
    unread: 4,
    avatar: "羽"
  },
  {
    id: "safety",
    name: "安全中心",
    tag: "系统提醒",
    message: "首次见面建议选择校园公共空间。",
    time: "昨天 13:00",
    unread: 0,
    avatar: "安"
  }
]

export const routeSteps: RouteStep[] = [
  {
    title: "图书馆入口集合",
    desc: "在公共空间完成队伍确认，开启路线。",
    method: "扫码打卡",
    status: "已完成"
  },
  {
    title: "研习区专注时段",
    desc: "完成 45 分钟共同学习，互相保持低打扰。",
    method: "计时打卡",
    status: "已完成"
  },
  {
    title: "教学楼讨论角",
    desc: "分享一个今日学习收获或困难。",
    method: "文字打卡",
    status: "进行中"
  },
  {
    title: "湖边复盘散步",
    desc: "完成路线反馈，确认守约状态。",
    method: "位置打卡",
    status: "未开始"
  }
]

export const badges: BadgeItem[] = [
  { name: "图书馆同行者", level: "已获得", icon: BookOpen },
  { name: "九龙湖探索者", level: "2/3", icon: Compass },
  { name: "守约搭子", level: "已获得", icon: ShieldCheck },
  { name: "路线主理人", level: "未解锁", icon: Award }
]
