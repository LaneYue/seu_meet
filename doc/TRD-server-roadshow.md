# IFLand 服务端路演版 TRD（比赛快速开发）

> 目标：2 周内可 Demo。砍掉一切非必需，保留核心差异化。AI 友好。

---

## 1. 技术栈（极简）

| 层 | 选型 | 理由 |
|----|------|------|
| 运行时 | Node.js + TypeScript | AI 生成效率最高 |
| 框架 | Express.js | 最小学习成本 |
| 数据库 | **SQLite** (better-sqlite3) | 零配置、单文件、无需 Docker |
| ORM | **Drizzle ORM** | 比 Prisma 轻，SQLite 原生支持好 |
| 即时通讯 | Socket.IO | 聊天实时推送 |
| 校验 | zod | 类型安全 |
| 跨域 | cors | 前端 Vite dev server 跨域请求 |

> **砍掉清单:** PostgreSQL → SQLite / Redis → 内存 Map / MinIO → 本地 public/ 目录 / 高德API → 纯坐标比较 / 定时任务 → 手动触发或setInterval / Docker → 直接 node .

**CORS 配置 (app.ts):**
```ts
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.*.*:5173'], // Vite dev + 局域网
  credentials: true,
}));
```

**Vite 代理 (vite.config.ts):**
```ts
// 开发环境前端代理，避免跨域问题
server: {
  proxy: { '/api': 'http://localhost:3000', '/socket.io': { target: 'http://localhost:3000', ws: true } }
}
```

---

## 2. 数据模型（5 张核心表）

```sql
-- 用户表
users: id, studentId(unique), realName, idCardLast6, passwordHash,
       nickname(unique), avatar, college, major, grade, campus, gender,
       bio, tags(json), creditScore(default:70), points(default:0),
       status(default:'active'), createdAt

-- 攻略表
guides: id, authorId(fk), title, description, category, coverImage,
        images(json), route(json), budget, suitableFor, tags(json),
        price(default:0), sales(default:0), status(default:'published'), createdAt

-- 购买记录
purchases: id, buyerId(fk), guideId(fk), price, refunded, createdAt
           unique(buyerId, guideId)

-- 匹配记录 (核心状态机)
matches: id, userId(fk), targetId(fk), action(left/right/super),
         status(pending/matched/rejected/expired), createdAt
         unique(userId, targetId)

-- 破冰问答
questions: id, category, content, active
answers:   id, matchId, userId(fk), questionId(fk), content, createdAt
ratings:   id, matchId, fromId(fk), toId(fk), score(1-5), createdAt
           unique(matchId, fromId)

-- 聊天
chat_sessions: id, matchId, user1Id, user2Id, stage(ice_breaking/normal/intimate),
               createdAt
messages:      id, sessionId(fk), senderId(fk), type, content, createdAt

-- 积分流水（可选，后期加）
point_logs: id, userId(fk), type, amount, balance, description, createdAt
```

---

## 3. API 接口（只保留核心闭环）

### 3.0 统一规范

```
Base: /api/v1
Auth: Bearer <token>
Response: { code:0, data:{} }
Error:   { code:非0, message:"" }
```

### 3.1 认证 (auth)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 注册（学号+身份证+昵称+密码） |
| POST | `/auth/login` | 登录 → 返回 token |

> 砍掉: refresh/logout/verify-student — Demo 阶段不需要

**注册 Request:**
```json
{
  "studentId": "213200001", "realName": "张三",
  "idCardLast6": "123456", "password": "123456",
  "nickname": "三三", "college": "信息学院",
  "major": "信息工程", "grade": "2024",
  "campus": "jiulonghu", "gender": "male"
}
```

**注册 Response:**
```json
{
  "code": 0,
  "data": {
    "user": { "id":"", "nickname":"", ... },
    "token": "eyJ..."
  }
}
```

**登录 Request:** `{ "studentId":"", "password":"" }`  
**登录 Response:** 同上

---

### 3.2 攻略市场 (guides)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/guides?category=&campus=&sort=&page=&pageSize=` | 列表 |
| GET | `/guides/:id` | 详情（已购买返回全部，未购买返回截断） |
| POST | `/guides` | 发布 |
| POST | `/guides/:id/purchase` | 购买（扣积分） |
| POST | `/guides/:id/refund` | 退款（24h内） |

**发布 Request:**
```json
{
  "title": "九龙湖一日游", "description": "...",
  "category": "date", "route": { "points": [{"lat":31.89,"lng":118.81,"name":"图书馆"}] },
  "budget": 50, "suitableFor": "couple", "tags": ["散步","美食"], "price": 5
}
```

---

### 3.3 匹配发现 (match) ⭐核心

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/match/discover?count=20` | **推荐算法** → 返回卡片列表 |
| POST | `/match/:targetId/action` | 左滑/右滑/超喜 → 检测双向匹配 |

**推荐算法（纯规则）：**
```
排除池: 自己 | 30天内操作过的 | 已匹配的 | 同性 | 信用分<70
排序:  共同标签数×3 + 不同校区×1 + 随机扰动
返回:  Top N 卡片
```

**卡片 Response:**
```json
{
  "code": 0,
  "data": {
    "cards": [{
      "id":"", "nickname":"", "avatar":"", "college":"",
      "grade":"", "campus":"", "bio":"", "tags":[],
      "photos":[], "commonTags":[], "mbti":"", "hometown":""
    }]
  }
}
```

**动作 Request:** `{ "action": "right" }`  
**双向匹配 Response:**
```json
{
  "code": 0,
  "data": {
    "matched": true,
    "matchId": "",
    "targetUser": { "id":"", "nickname":"", "avatar":"" },
    "needIceBreak": true
  }
}
```

---

### 3.4 破冰问答 (questions) ⭐核心差异化

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/questions/icebreak/:matchId` | 获取随机 3 题 |
| POST | `/questions/icebreak/:matchId/answer` | 提交答案 |
| GET | `/questions/icebreak/:matchId/result` | 查看双方答案对比 |
| POST | `/questions/icebreak/:matchId/rate` | 打分 (1-5) |

**破冰流程:**
```
匹配成功 → 拉 3 题 → 答题 → 双方提交 → 互看答案 → 盲评
  ├─ 双方≥3 → 解锁聊天 ✓
  └─ 一方<3 → 匹配解除 ✗
```

---

### 3.5 聊天 (chat)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/chat/sessions` | 会话列表 |
| GET | `/chat/sessions/:id/messages?before=&limit=30` | 历史消息 |
| POST | `/chat/sessions/:id/messages` | 发送消息（REST 兜底） |

**WebSocket 事件 (Socket.IO):**
```
C→S: chat:join {sessionId}
C→S: chat:message {sessionId, type:"text", content:""}
S→C: chat:message {sessionId, message:{id,senderId,content,createdAt}}
S→C: chat:typing {sessionId, userId}
S→C: icebreak:ready {matchId}
S→C: icebreak:result {matchId, result:"matched"|"rejected"}
```

---

### 3.6 用户资料 (users)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users/me` | 我的信息 |
| PUT | `/users/me` | 更新资料 |
| GET | `/users/me/profile` | 我的详细资料卡 |
| PUT | `/users/me/profile` | 更新身高/MBTI/家乡/兴趣/照片 |
| PUT | `/users/me/tags` | 更新标签 |
| GET | `/users/:id/profile` | 查看他人资料（需已解锁聊天） |

---

### 3.7 积分 (points)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/balance` | 余额 |
| GET | `/points/transactions` | 流水 |
| POST | `/points/checkin` | 每日签到 +5 |

---

## 4. 砍掉清单（比赛不开发）

| 砍掉 | 原因 |
|------|------|
| ❌ 打卡系统 + GPS | 开发量大，Demo 用不到 |
| ❌ 排行榜 | 第二周末尾再说 |
| ❌ 亲密度 | 同上 |
| ❌ 交叉验证评分 | 简化为盲评 + 双方互评即生效 |
| ❌ 图片上传 | Demo 用硬编码 URL 或 Base64 |
| ❌ 校园网 IP 校验 | Demo 用不到 |
| ❌ 学工系统对接 | 假数据 |
| ❌ 内容审核 | Demo 跳过 |
| ❌ 拉黑 / 举报 | 比赛不演示 |
| ❌ 退款逻辑 | 简化为一键退款 |
| ❌ 定时任务 | 手动触发 / setInterval |

---

## 5. 种子数据

> **重要: Demo 必须有可展示的数据。** 预置 20 个假用户 + 5 篇攻略 + 20 道破冰题。

```typescript
// seed.ts 核心内容
const users = [
  { studentId:'213200001', nickname:'三三', college:'信息学院', tags:['自习','跑步','王者'], ... },
  { studentId:'213200002', nickname:'思思', college:'建筑学院', tags:['咖啡','摄影','CityWalk'], ... },
  // ... 18 more
];

const guides = [
  { title:'九龙湖情侣一日游', category:'date', price:5, ... },
  { title:'四牌楼美食探店', category:'food', price:3, ... },
  // ... 3 more
];

const questions = [
  { category:'values', content:'你认为大学里最重要的是什么？' },
  { category:'lifestyle', content:'周末通常会怎么度过？' },
  // ... 18 more
];
```

---

## 6. 开发顺序（10 天计划）

| 天 | 后端 | 前端 |
|----|------|------|
| Day 1 | 项目骨架 + Drizzle Schema + seed | Vite + React + Tailwind + MUI 初始化，PhoneFrame + Router + 3Tab 骨架 |
| Day 2 | auth 模块 (注册/登录) | 登录/注册页面 |
| Day 3 | users 模块 (资料 CRUD) | Tab1 攻略列表+详情+发布 |
| Day 4 | guides 模块 (CRUD+购买) | Tab2 滑动卡片组件 (framer-motion) |
| Day 5 | match 模块 (推荐算法+动作) | 破冰答题+结果+评分页 |
| Day 6 | questions 模块 (破冰完整流程) | Tab3 会话列表+聊天页+Socket |
| Day 7 | chat (REST+Socket.IO) | 个人资料页 |
| Day 8 | points 模块 | 排行榜+积分签到+空状态+Loading |
| Day 9-10 | 联调+修复+动画打磨 | 联调+桌面手机框美化+Demo 预演 |
