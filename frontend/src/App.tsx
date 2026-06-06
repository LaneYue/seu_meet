import {
  ArrowLeft,
  Award,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coffee,
  Compass,
  Dumbbell,
  Flag,
  Heart,
  Home,
  Map,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Plus,
  Rocket,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  UserX,
  Users,
  X
} from "lucide-react"
import { useState, type PointerEvent, type ReactNode } from "react"
import { Link, Navigate, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom"

const people = [
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

const discoverProfiles = [
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

const partnerPosts = [
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

const routes = [
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

const chats = [
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

const routeSteps = [
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

const badges = [
  { name: "图书馆同行者", level: "已获得", icon: BookOpen },
  { name: "九龙湖探索者", level: "2/3", icon: Compass },
  { name: "守约搭子", level: "已获得", icon: ShieldCheck },
  { name: "路线主理人", level: "未解锁", icon: Award }
]

function PhoneFrame({ children }: { children: ReactNode }) {
  return <main className="desktop-stage"><section className="phone-shell">{children}</section></main>
}

function StatusBar() {
  return (
    <div className="status-bar">
      <span>9:41</span>
      <span className="signal">▮▮▮  5G  ▰</span>
    </div>
  )
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="底部导航">
      <NavLink to="/home" className={({ isActive }) => (isActive ? "active" : "")}>
        <Home size={20} />
        <span>同行</span>
      </NavLink>
      <NavLink to="/routes" className={({ isActive }) => (isActive ? "active" : "")}>
        <Map size={20} />
        <span>路线</span>
      </NavLink>
      <NavLink to="/chats" className={({ isActive }) => (isActive ? "active" : "")}>
        <span className="nav-badge-wrap">
          <MessageCircle size={20} />
          <i />
        </span>
        <span>消息</span>
      </NavLink>
    </nav>
  )
}

function TabLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-screen with-tabbar">
      <StatusBar />
      {children}
      <BottomNav />
    </div>
  )
}

function Pill({ children, tone = "green" }: { children: ReactNode; tone?: string }) {
  return <span className={`pill ${tone}`}>{children}</span>
}

function Avatar({ label, gradient }: { label: string; gradient?: string }) {
  return (
    <span className="avatar" style={{ background: gradient ?? "linear-gradient(135deg,#d1fae5,#bfdbfe)" }}>
      {label}
    </span>
  )
}

function DiscoverSwipePage() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [gestureLabel, setGestureLabel] = useState("左右滑动选择，上滑看详情")
  const navigate = useNavigate()
  const profile = discoverProfiles[activeIndex % discoverProfiles.length]
  const nextProfile = discoverProfiles[(activeIndex + 1) % discoverProfiles.length]

  const next = () => setActiveIndex((value) => (value + 1) % discoverProfiles.length)
  const openDetail = () => navigate(`/home/profile/${profile.id}`)

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    setTouchStart({ x: event.clientX, y: event.clientY })
  }

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    if (!touchStart) return

    const deltaX = event.clientX - touchStart.x
    const deltaY = event.clientY - touchStart.y
    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)
    const threshold = 56

    setTouchStart(null)

    if (Math.max(absX, absY) < threshold) return

    if (absX > absY) {
      if (deltaX > 0) {
        setGestureLabel("已喜欢，继续为你推荐")
        next()
      } else {
        setGestureLabel("已跳过，换一张名片")
        next()
      }
      return
    }

    if (deltaY < 0) {
      openDetail()
    } else {
      setGestureLabel("已下滑跳过")
      next()
    }
  }

  return (
    <TabLayout>
      <section className="discover-page">
        <div className="discover-stack" aria-label="同行推送名片">
          <article className="discover-card ghost two" aria-hidden="true">
            <img src={nextProfile.photos[0]} alt="" />
          </article>
          <article className="discover-card ghost one" aria-hidden="true">
            <img src={nextProfile.photos[1]} alt="" />
          </article>
          <article
            className="discover-card active-card"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            <img className="profile-cover" src={profile.photos[0]} alt="" />
            <div className="discover-scrim" />
            <div className="discover-card-top">
              <span />
              <Link to="/home/feed" className="home-toggle">主页</Link>
              <span />
            </div>
            <div className="photo-strip" aria-label="分享图片">
              {profile.photos.slice(1).map((photo) => (
                <img src={photo} alt="" key={photo} />
              ))}
            </div>
            <div className="profile-content">
              <Pill tone="green"><CheckCircle2 size={13} />{profile.verified}</Pill>
              <div className="discover-name">
                <h1>{profile.name}</h1>
                <span>{profile.gender} {profile.age}</span>
              </div>
              <p className="school-line"><BookOpen size={16} />{profile.school}</p>
              <p className="profile-post">{profile.post}</p>
              <div className="tag-row light">
                {profile.interests.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="match-reason">
                <Sparkles size={17} />
                <div>
                  <strong>推荐理由</strong>
                  <p>{profile.reason}</p>
                </div>
              </div>
              <p className="discover-safety"><ShieldCheck size={15} />{profile.safety}</p>
            </div>
          </article>
        </div>
        <p className="gesture-hint">{gestureLabel}</p>
      </section>
    </TabLayout>
  )
}

function ProfileDetailPage() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const profile = discoverProfiles.find((item) => item.id === profileId) ?? discoverProfiles[0]

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page profile-detail-page">
        <header className="profile-detail-hero">
          <img src={profile.photos[0]} alt="" />
          <div className="detail-hero-actions">
            <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
            <button aria-label="分享"><Share2 size={20} /></button>
          </div>
          <div className="profile-detail-title">
            <Pill tone="green"><CheckCircle2 size={13} />{profile.verified}</Pill>
            <h1>{profile.name}<span>{profile.gender} {profile.age}</span></h1>
            <p>{profile.school}</p>
          </div>
        </header>

        <section className="glass-card">
          <div className="section-title"><h2>发布的信息</h2></div>
          <p>{profile.post}</p>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>分享图片</h2></div>
          <div className="profile-photo-grid">
            {profile.photos.map((photo) => <img src={photo} alt="" key={photo} />)}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>爱好</h2></div>
          <div className="tag-row">
            {profile.interests.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </section>

        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>{profile.safety}</span>
        </section>

        <section className="detail-actions">
          <button className="primary-action">发同行请求</button>
          <button onClick={() => navigate("/home")}>返回推送</button>
        </section>
      </div>
    </div>
  )
}

function HomeFeedPage() {
  const quick = [
    { title: "学习搭子", desc: "自习 · 备考 · 课程", icon: BookOpen, tone: "mint" },
    { title: "饭搭子", desc: "午饭 · 探店 · 分享", icon: Coffee, tone: "peach" },
    { title: "运动搭子", desc: "跑步 · 球类 · 健身", icon: Dumbbell, tone: "green" },
    { title: "认真关系", desc: "兴趣 · 成长 · 陪伴", icon: Heart, tone: "lilac" },
    { title: "兴趣交友", desc: "摄影 · 音乐 · 阅读", icon: Sparkles, tone: "blue" },
    { title: "校园路线", desc: "打卡 · 徽章 · 探索", icon: Map, tone: "mint" },
    { title: "跨校区同行", desc: "九龙湖 · 四牌楼", icon: Compass, tone: "peach" },
    { title: "活动组队", desc: "讲座 · 社团 · 公益", icon: Users, tone: "lilac" }
  ]

  return (
    <TabLayout>
      <div className="scroll-page home-page">
        <header className="home-hero">
          <div className="identity-row">
            <Avatar label="L" gradient="linear-gradient(135deg,#dbeafe,#bbf7d0)" />
            <div>
              <strong>东大学生已认证</strong>
              <p>九龙湖校区 · 晴 22°C</p>
            </div>
            <button className="icon-button" aria-label="通知">
              <Bell size={19} />
            </button>
          </div>
          <label className="search-box">
            <Search size={18} />
            <input placeholder="搜索搭子、路线、活动" />
          </label>
        </header>

        <section className="quick-grid">
          {quick.map((item) => {
            const Icon = item.icon
            return (
              <Link to={item.title.includes("路线") ? "/routes" : "/partners"} className={`quick-card ${item.tone}`} key={item.title}>
                <span><Icon size={22} /></span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </Link>
            )
          })}
        </section>

        <section className="section-block">
          <div className="section-title">
            <h2>今日推荐</h2>
            <button>换一批</button>
          </div>
          <div className="people-list">
            {people.map((person) => (
              <article className="person-card" key={person.id}>
                <Avatar label={person.avatar} gradient={person.color} />
                <div className="person-main">
                  <div className="card-line">
                    <strong>{person.name}</strong>
                    <Pill>{person.status}</Pill>
                  </div>
                  <p>{person.school}</p>
                  <div className="tag-row">
                    {person.tags.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <p className="intro">{person.intro}</p>
                </div>
                <button className="soft-like" aria-label="想认识">
                  <Heart size={18} />
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-title">
            <h2>热门搭子需求</h2>
            <Link to="/partners">查看全部</Link>
          </div>
          {partnerPosts.slice(0, 2).map((post) => (
            <Link className="home-partner-card" to="/partners" key={post.id}>
              <div>
                <strong>{post.title}</strong>
                <p>{post.time} · {post.place}</p>
                <span>{post.joined} / {post.total} 人</span>
              </div>
              <button>加入</button>
            </Link>
          ))}
        </section>

        <section className="section-block">
          <div className="section-title">
            <h2>本周跨专业交流</h2>
          </div>
          <div className="cross-grid">
            {["建筑 × 信息", "医学 × 工科", "经管 × 设计"].map((item) => (
              <article className="cross-card" key={item}>
                <strong>{item}</strong>
                <p>从一次共同行动开始认识</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-title">
            <h2>推荐校园路线</h2>
          </div>
          {routes.slice(0, 1).map((route) => (
            <Link className="home-route-card" to={`/routes/${route.id}`} key={route.id}>
              <img src={route.image} alt="" />
              <div>
                <Pill tone="blue">{route.badge}</Pill>
                <strong>{route.title}</strong>
                <p>{route.campus} · {route.people} 人参与</p>
              </div>
              <ChevronRight size={20} />
            </Link>
          ))}
        </section>
      </div>
    </TabLayout>
  )
}

function SwipePage() {
  const navigate = useNavigate()
  const person = people[0]

  return (
    <div className="app-screen swipe-screen">
      <StatusBar />
      <img className="swipe-photo" src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80" alt="" />
      <div className="swipe-shade" />
      <header className="floating-top">
        <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={22} /></button>
        <button aria-label="分享"><Share2 size={20} /></button>
      </header>
      <section className="swipe-info">
        <div className="name-row">
          <h1>{person.name}</h1>
          <span>♀ 20</span>
        </div>
        <p>人文学院 · 大二 · 四牌楼校区</p>
        <div className="tag-row light">
          {person.tags.map((tag) => <span key={tag}>{tag}</span>)}
        </div>
        <p className="swipe-copy">喜欢文字与城市漫游，希望认识有趣的人，一起探索更多可能。</p>
        <small>推荐理由：你们都喜欢校园探索，并且都去过晚樱校区。</small>
      </section>
      <div className="swipe-actions">
        <button><X size={28} /><span>跳过</span></button>
        <button className="send"><Send size={26} /><span>发请求</span></button>
        <button className="heart"><Heart size={28} /><span>喜欢</span></button>
      </div>
      <BottomNav />
    </div>
  )
}

function PartnerSquarePage() {
  return (
    <TabLayout>
      <div className="scroll-page plaza-page">
        <header className="page-top">
          <div>
            <h1>同行广场</h1>
            <p>发布搭子需求，遇见合拍的人</p>
          </div>
          <Link className="post-button" to="/partners"><Plus size={18} />发布</Link>
        </header>
        <div className="filter-row">
          {["全部", "学习", "运动", "生活", "兴趣"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>
        <PartnerCards />
      </div>
    </TabLayout>
  )
}

function PartnerCards() {
  return (
    <div className="partner-list">
      {partnerPosts.map((post) => (
        <article className="partner-card" key={post.id}>
          <div className="card-line">
            <h2>{post.title}</h2>
            <Pill tone={post.tone}>{post.status}</Pill>
          </div>
          <p><CalendarDays size={14} />{post.time}</p>
          <p><MapPin size={14} />{post.place}</p>
          <div className="mini-avatars">
            <span />
            <span />
            <span />
            <b>{post.joined} / {post.total} 人</b>
          </div>
          <footer>
            <span>{post.note}</span>
            <button>{post.status === "进行中" ? "加入" : "申请加入"}</button>
          </footer>
        </article>
      ))}
    </div>
  )
}

function RoutesPage() {
  return (
    <TabLayout>
      <div className="scroll-page routes-page">
        <header className="page-top">
          <div>
            <h1>路线</h1>
            <p>一起探索东大校园</p>
          </div>
          <button className="icon-button" aria-label="路线通知"><Bell size={19} /></button>
        </header>
        <label className="search-box">
          <Search size={18} />
          <input placeholder="搜索路线、地点、主题" />
        </label>
        <div className="filter-row wrap">
          {["九龙湖", "四牌楼", "丁家桥", "学习", "文化", "运动", "公益", "徽章"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>

        <section className="section-block">
          <div className="section-title"><h2>精选路线</h2></div>
          {routes.map((route) => (
            <Link className="route-card" to={`/routes/${route.id}`} key={route.id}>
              <img src={route.image} alt="" />
              <div className="route-overlay">
                <Pill tone="blue">{route.badge}</Pill>
                <h2>{route.title}</h2>
                <p>{route.intro}</p>
                <div className="route-meta">
                  <span><Users size={14} />{route.people} 人参与</span>
                  <span><MapPin size={14} />{route.nodes} 个打卡点</span>
                  <span><Clock size={14} />{route.duration}</span>
                </div>
              </div>
              <div className="route-progress">
                <span>打卡进度</span>
                <b>{route.progress} / {route.nodes}</b>
              </div>
            </Link>
          ))}
        </section>

        <section className="section-block">
          <div className="section-title"><h2>我的徽章</h2><Link to="/routes/jiulonghu">徽章墙</Link></div>
          <div className="badge-grid">
            {badges.map((badge) => {
              const Icon = badge.icon
              return (
                <article className="badge-item" key={badge.name}>
                  <Icon size={24} />
                  <strong>{badge.name}</strong>
                  <span>{badge.level}</span>
                </article>
              )
            })}
          </div>
        </section>

        <section className="score-card">
          <div>
            <span>当前同行值</span>
            <strong>130</strong>
            <p>青禾 Lv.2 · 本周 +18</p>
          </div>
          <div className="score-bar"><i /></div>
          <small>距离下一等级还差 40 点</small>
        </section>

        <section className="badge-apply-card">
          <Award size={28} />
          <div>
            <strong>电子吧唧申请</strong>
            <p>已满足 2 项条件，完成一条官方路线即可申请。</p>
          </div>
          <button>查看</button>
        </section>
      </div>
    </TabLayout>
  )
}

function RouteDetailPage() {
  const { routeId } = useParams()
  const route = routes.find((item) => item.id === routeId) ?? routes[0]
  const navigate = useNavigate()

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <div className="scroll-page route-detail">
        <header className="detail-hero">
          <img src={route.image} alt="" />
          <div className="detail-hero-actions">
            <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
            <button aria-label="分享"><Share2 size={20} /></button>
          </div>
          <div>
            <Pill tone="blue">{route.badge}</Pill>
            <h1>{route.title}</h1>
            <p>{route.intro}</p>
          </div>
        </header>

        <section className="detail-meta">
          <span><MapPin size={16} />{route.campus}</span>
          <span><Clock size={16} />{route.duration}</span>
          <span><Flag size={16} />{route.difficulty}</span>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>路线步骤</h2><span>{routeSteps.length} 个节点</span></div>
          <div className="timeline">
            {routeSteps.map((step, index) => (
              <article className={`timeline-step ${step.status === "已完成" ? "done" : ""}`} key={step.title}>
                <span className="step-dot">{index + 1}</span>
                <div>
                  <div className="card-line">
                    <strong>{step.title}</strong>
                    <Pill tone={step.status === "已完成" ? "green" : step.status === "进行中" ? "orange" : "gray"}>{step.status}</Pill>
                  </div>
                  <p>{step.desc}</p>
                  <small>{step.method}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="glass-card">
          <div className="section-title"><h2>电子徽章</h2></div>
          <div className="badge-grid">
            {badges.slice(0, 3).map((badge) => {
              const Icon = badge.icon
              return (
                <article className="badge-item" key={badge.name}>
                  <Icon size={24} />
                  <strong>{badge.name}</strong>
                  <span>{badge.level}</span>
                </article>
              )
            })}
          </div>
        </section>

        <section className="detail-actions">
          <button className="primary-action">继续打卡</button>
          <button>邀请同行</button>
        </section>
      </div>
    </div>
  )
}

function MessagesPage() {
  return (
    <TabLayout>
      <div className="scroll-page messages-page">
        <header className="page-top">
          <div>
            <h1>消息</h1>
            <p>安全、友好、低压力地沟通</p>
          </div>
          <div className="top-actions">
            <button className="icon-button" aria-label="安全中心"><ShieldCheck size={19} /></button>
            <button className="icon-button" aria-label="新消息"><Plus size={19} /></button>
          </div>
        </header>
        <div className="filter-row">
          {["全部", "搭子", "路线", "认真关系", "系统"].map((item, index) => (
            <button className={index === 0 ? "selected" : ""} key={item}>{item}</button>
          ))}
        </div>
        <div className="chat-list">
          {chats.map((chat) => (
            <Link className="chat-card" to={`/chats/${chat.id}`} key={chat.id}>
              <Avatar label={chat.avatar} />
              <div>
                <div className="card-line">
                  <strong>{chat.name}</strong>
                  <span>{chat.time}</span>
                </div>
                <Pill tone={chat.tag.includes("系统") ? "orange" : "blue"}>{chat.tag}</Pill>
                <p>{chat.message}</p>
              </div>
              {chat.unread > 0 && <b className="unread">{chat.unread}</b>}
            </Link>
          ))}
        </div>
      </div>
    </TabLayout>
  )
}

function ChatDetailPage() {
  const { chatId } = useParams()
  const chat = chats.find((item) => item.id === chatId) ?? chats[0]
  const navigate = useNavigate()

  return (
    <div className="app-screen detail-screen">
      <StatusBar />
      <header className="chat-top">
        <button onClick={() => navigate(-1)} aria-label="返回"><ArrowLeft size={21} /></button>
        <div>
          <strong>{chat.name}</strong>
          <span>{chat.tag}</span>
        </div>
        <button aria-label="更多"><MoreHorizontal size={21} /></button>
      </header>
      <div className="scroll-page chat-detail-page">
        <section className="safe-notice">
          <ShieldCheck size={18} />
          <span>首次见面请选择校园公共空间，你可以随时举报或结束匹配。</span>
        </section>
        <section className="inline-action-card">
          <CalendarDays size={20} />
          <div>
            <strong>今晚 19:00 图书馆自习</strong>
            <p>确认活动时间后，将同步到路线小队。</p>
          </div>
          <button>确认</button>
        </section>
        <div className="message-thread">
          <p className="message-bubble">你好呀，我看到你也想找算法题搭子。</p>
          <p className="message-bubble mine">可以！我今晚在九龙湖图书馆。</p>
          <p className="message-bubble">那我们先从一小时刷题开始，轻松一点。</p>
        </div>
      </div>
      <div className="chat-actions">
        <button><Flag size={17} />举报</button>
        <button><UserX size={17} />拉黑</button>
        <button><X size={17} />结束匹配</button>
      </div>
      <form className="chat-composer">
        <input placeholder="友好地说点什么" />
        <button type="button"><Send size={18} /></button>
      </form>
    </div>
  )
}

export default function App() {
  return (
    <PhoneFrame>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<DiscoverSwipePage />} />
        <Route path="/home/feed" element={<HomeFeedPage />} />
        <Route path="/home/profile/:profileId" element={<ProfileDetailPage />} />
        <Route path="/swipe" element={<SwipePage />} />
        <Route path="/partners" element={<PartnerSquarePage />} />
        <Route path="/routes" element={<RoutesPage />} />
        <Route path="/routes/:routeId" element={<RouteDetailPage />} />
        <Route path="/chats" element={<MessagesPage />} />
        <Route path="/chats/:chatId" element={<ChatDetailPage />} />
      </Routes>
    </PhoneFrame>
  )
}
