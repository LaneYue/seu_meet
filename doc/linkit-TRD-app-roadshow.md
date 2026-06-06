# linkit 前端路演版 TRD（比赛快速开发）

> 目标：~10 天可 Demo。Web 优先，桌面模拟手机，手机直接使用。AI 友好。
>
> 📐 页面设计与交互详见 [design.md](./design.md)

---

## 1. 技术栈

| 层        | 选型                           | 理由                       |
| --------- | ------------------------------ | -------------------------- |
| 脚手架    | **Vite**                       | 秒级 HMR，零配置起步       |
| UI 框架   | **React 18**                   | 生态最大，AI 生成质量最高  |
| 样式      | **Tailwind CSS**               | 原子化，不用写 CSS 文件    |
| 组件库    | **MUI (Material UI)**          | 开箱即用的 Mobile 友好组件 |
| 路由      | **React Router v6**            | 标配                       |
| HTTP      | **fetch + 薄封装**             | 不引入 axios，减少依赖     |
| WebSocket | **socket.io-client**           | 对接后端 Socket.IO         |
| 状态管理  | **React Context + useReducer** | 不引入 Redux/Zustand       |
| 动画      | **framer-motion**              | 卡片拖拽、页面转场         |
| 图标      | **MUI Icons**                  | 随 MUI 自带                |

> **砍掉:** axios → fetch / TanStack Query → useState+useEffect / Redux → Context / 任何需要代码生成的库

---

## 2. 双端适配

- **桌面端**：`max-w-[375px]` 手机框居中，紫色渐变背景，`border-8 border-gray-900 rounded-[40px]`
- **移动端**：全屏，`window.innerWidth ≤ 768` 时移除手机框
- 实现：`AppShell` 组件用 `useMediaQuery('(max-width: 768px)')` 检测

---

## 3. 目录结构

```
app/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── package.json
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx                              # AppShell + Router
│   ├── index.css                            # Tailwind 指令
│   ├── config/
│   │   └── api.ts                           # API_BASE, WS_BASE
│   ├── lib/
│   │   ├── api.ts                           # fetch 封装 (get/post)
│   │   ├── socket.ts                        # Socket.IO 客户端单例
│   │   ├── auth.ts                          # Token 存取 + AuthContext
│   │   └── types.ts                         # 共享 TS 类型
│   ├── components/
│   │   ├── PhoneFrame.tsx                   # 桌面手机框壳
│   │   ├── BottomNav.tsx                    # 底部3Tab导航
│   │   ├── PlazaTabs.tsx                    # 广场顶部多分区Tab
│   │   ├── ActivityCard.tsx                 # 活动卡片
│   │   ├── GuideCard.tsx                    # 攻略卡片
│   │   ├── FeedCard.tsx                     # 动态卡片
│   │   ├── PlayCard.tsx                     # 约玩卡片
│   │   ├── MatchCard.tsx                    # 可拖拽滑动卡片
│   │   ├── UserFullProfile.tsx              # 全屏用户资料
│   │   ├── PhotoCarousel.tsx                # 照片轮播
│   │   ├── ChatBubble.tsx                   # 聊天气泡
│   │   ├── RatingStars.tsx                  # 五星评分
│   │   ├── TagChip.tsx                      # 标签
│   │   ├── CreditBadge.tsx                  # 信用分徽章
│   │   ├── UserAvatar.tsx                   # 头像
│   │   ├── EmptyState.tsx                   # 空状态
│   │   └── SkeletonCard.tsx                 # 骨架屏
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── PlazaPage.tsx                    # Tab1 - 广场
│   │   ├── ActivityDetailPage.tsx           # /plaza/activity/:id
│   │   ├── GuideDetailPage.tsx              # /plaza/guide/:id
│   │   ├── GuideCreatePage.tsx              # /plaza/guide/create
│   │   ├── DiscoverPage.tsx                 # Tab2 - 发现
│   │   ├── ChatListPage.tsx                 # Tab3 - 消息列表
│   │   ├── ChatDetailPage.tsx               # /chats/:sessionId
│   │   ├── IcebreakAnswerPage.tsx           # 破冰答题（申请者视角）
│   │   ├── IcebreakReviewPage.tsx           # 答案审核（被申请者视角）
│   │   ├── IcebreakResultPage.tsx           # 破冰结果通知
│   │   ├── MyProfilePage.tsx                # /profile/me
│   │   ├── UserProfilePage.tsx              # /profile/:userId
│   │   └── LeaderboardPage.tsx              # /leaderboard
│   └── hooks/
│       ├── useApi.ts
│       ├── useSocket.ts
│       ├── useAuth.ts
│       └── useMediaQuery.ts
```

---

## 4. 路由表

```tsx
<Routes>
  {/* 认证 - 无底部Tab */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />

  {/* 主页 - 有底部Tab */}
  <Route element={<BottomNavLayout />}>
    <Route path="/plaza" element={<PlazaPage />} />
    <Route path="/discover" element={<DiscoverPage />} />
    <Route path="/chats" element={<ChatListPage />} />
  </Route>

  {/* 子页面 */}
  <Route path="/plaza/activity/:id" element={<ActivityDetailPage />} />
  <Route path="/plaza/guide/:id" element={<GuideDetailPage />} />
  <Route path="/plaza/guide/create" element={<GuideCreatePage />} />
  <Route path="/chats/:sessionId" element={<ChatDetailPage />} />
  <Route path="/icebreak/answer/:userId" element={<IcebreakAnswerPage />} />
  <Route path="/icebreak/review/:requestId" element={<IcebreakReviewPage />} />
  <Route path="/icebreak/result/:requestId" element={<IcebreakResultPage />} />
  <Route path="/profile/me" element={<MyProfilePage />} />
  <Route path="/profile/:userId" element={<UserProfilePage />} />
  <Route path="/leaderboard" element={<LeaderboardPage />} />

  <Route path="*" element={<Navigate to="/plaza" />} />
</Routes>
```

**路由守卫：** `BottomNavLayout` 内用 `useAuth()` 检查登录态，未登录 → `/login`。

---

## 5. 核心 API 封装

```tsx
// src/lib/api.ts

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api/v1";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: authHeaders() });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  if (json.code !== 0) throw json;
  return json.data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  if (json.code !== 0) throw json;
  return json.data;
}

export async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  if (json.code !== 0) throw json;
  return json.data;
}
```

---

## 6. 状态管理（Context 极简方案）

```tsx
// src/lib/auth.ts
const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  login: (sid: string, pw: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
} | null>(null);
```

> **原则：** AuthContext 只管认证。各页面各自 `useState` + `useEffect`。不过度抽象。

**页面级状态模式：**

```tsx
// 每个页面标准结构
function SomePage() {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    get<{ list: DataType[] }>('/some/api')
      .then(d => setData(d.list))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCard />;
  if (error) return <ErrorState message={error} onRetry={...} />;
  if (data.length === 0) return <EmptyState message="..." />;
  return <>{/* data */}</>;
}
```

---

## 7. 核心组件接口

| 组件              | Props                                          | 说明                       |
| ----------------- | ---------------------------------------------- | -------------------------- |
| `PhoneFrame`      | `children`                                     | 桌面端手机框壳，移动端透传 |
| `BottomNav`       | `value, onChange, badge?`                      | 3 Tab 底部导航             |
| `PlazaTabs`       | `tabs, active, onChange`                       | 广场顶部水平滚动分区       |
| `ActivityCard`    | `activity, onClick`                            | 活动卡片                   |
| `GuideCard`       | `guide, onClick`                               | 攻略卡片                   |
| `FeedCard`        | `feed, onClick, onLike, onComment`             | 好友动态卡片               |
| `PlayCard`        | `play, onClick`                                | 约玩卡片                   |
| `MatchCard`       | `card, onSwipeLeft, onSwipeRight, onSwipeDown` | 发现页可拖拽滑动卡片       |
| `UserFullProfile` | `user, onBack, onInterest`                     | 全屏用户资料               |
| `PhotoCarousel`   | `photos`                                       | 照片轮播，左右滑动         |
| `ChatBubble`      | `isMe, content, type, time, read`              | QQ 风格聊天气泡            |
| `RatingStars`     | `value, onChange`                              | 1-5 星评分                 |
| `TagChip`         | `label, highlighted?`                          | 标签（支持高亮共同标签）   |
| `CreditBadge`     | `score`                                        | 信用分颜色徽章             |
| `UserAvatar`      | `src, size`                                    | 头像+默认 fallback         |
| `EmptyState`      | `message, action?`                             | 空数据插画+引导            |
| `SkeletonCard`    | `lines?`                                       | 骨架屏                     |

---

## 8. 依赖清单

```json
{
  "dependencies": {
    "react": "^18.3",
    "react-dom": "^18.3",
    "react-router-dom": "^6.23",
    "@mui/material": "^5.15",
    "@mui/icons-material": "^5.15",
    "@emotion/react": "^11",
    "@emotion/styled": "^11",
    "socket.io-client": "^4.7",
    "framer-motion": "^11.0"
  },
  "devDependencies": {
    "vite": "^5.4",
    "@vitejs/plugin-react": "^4.3",
    "tailwindcss": "^3.4",
    "postcss": "^8.4",
    "autoprefixer": "^10.4",
    "typescript": "^5.5",
    "@types/react": "^18.3",
    "@types/react-dom": "^18.3"
  }
}
```

---

## 9. 开发顺序（10 天计划）

| 天           | 任务                                                                                                    | 产出                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **Day 1**    | Vite + React + Tailwind + MUI 初始化，PhoneFrame 桌面壳，Router + 3Tab 骨架                             | AppShell, BottomNav                                        |
| **Day 2**    | 登录 + 注册页 + API 封装 + AuthContext                                                                  | LoginPage, RegisterPage, useAuth                           |
| **Day 3**    | Tab1 广场主框架 + PlazaTabs + 各分区卡片组件 (ActivityCard/GuideCard/FeedCard/PlayCard) + 攻略详情+发布 | PlazaPage, PlazaTabs, 4种卡片组件                          |
| **Day 4**    | Tab2 发现页 MatchCard + 全屏资料 UserFullProfile + 下滑展开 + 左右滑动                                  | DiscoverPage, MatchCard, UserFullProfile, PhotoCarousel    |
| **Day 5**    | 破冰问答 3 页面（答题/审核/结果）                                                                       | IcebreakAnswerPage, IcebreakReviewPage, IcebreakResultPage |
| **Day 6**    | Tab3 会话列表 + 聊天详情 QQ 风格 + Socket 集成                                                          | ChatListPage, ChatDetailPage, ChatBubble                   |
| **Day 7**    | 个人资料 + 他人资料 + 破冰问题设置                                                                      | MyProfilePage, UserProfilePage                             |
| **Day 8**    | 排行榜 + 积分签到 + 空状态 + 骨架屏 + ErrorState                                                        | LeaderboardPage, EmptyState, SkeletonCard                  |
| **Day 9-10** | 联调 + Bug 修复 + 动画打磨 + 桌面手机框美化                                                             | 完整可演示                                                 |

---

## 10. 开发联调

```bash
pnpm dev          # Vite → localhost:5173
# Vite proxy → /api + /socket.io → localhost:3000

# 手机测试: 同 WiFi
# http://192.168.x.x:5173 → 自动全屏模式

pnpm build        # → dist/
```
