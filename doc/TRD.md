# IFLand 技术需求文档（TRD）

---

## 第一部分：后端技术规范

---

### 1. 技术栈

| 层 | 选型 | 版本 |
|----|------|------|
| 运行时 | Node.js | ≥18 LTS |
| 语言 | TypeScript | ≥5.0 |
| 框架 | Express.js | 4.x |
| ORM | Prisma | 5.x |
| 数据库 | PostgreSQL + PostGIS | 15+ |
| 缓存 | Redis | 7.x |
| 对象存储 | MinIO（开发）/ 阿里云 OSS（生产） | — |
| 即时通讯 | Socket.IO | 4.x |
| 地图 | 高德地图 Web API | — |
| 容器 | Docker + Docker Compose | — |
| 日志 | pino | — |
| 校验 | zod | — |

---

### 2. 目录结构

```
server/
├── src/
│   ├── index.ts                  # 入口
│   ├── app.ts                    # Express 配置
│   ├── config/
│   │   ├── env.ts                # 环境变量
│   │   └── database.ts           # Prisma 客户端
│   ├── middleware/
│   │   ├── auth.ts               # JWT 认证
│   │   ├── campusGuard.ts        # 校园网校验
│   │   ├── validate.ts           # zod 请求校验
│   │   └── errorHandler.ts       # 全局错误处理
│   ├── modules/
│   │   ├── auth/                 # 认证模块
│   │   ├── user/                 # 用户模块
│   │   ├── guide/                # 攻略模块
│   │   ├── match/                # 匹配模块
│   │   ├── question/             # 破冰问答模块
│   │   ├── chat/                 # 聊天模块
│   │   ├── rating/               # 评分信用模块
│   │   ├── intimacy/             # 亲密度模块
│   │   ├── checkin/              # 打卡模块
│   │   ├── points/               # 积分模块
│   │   └── leaderboard/          # 排行榜模块
│   ├── shared/
│   │   ├── errors.ts             # 自定义错误类
│   │   ├── response.ts           # 统一响应格式
│   │   └── constants.ts          # 全局常量
│   └── types/
│       └── index.ts              # 共享类型
├── prisma/
│   ├── schema.prisma             # 数据模型
│   └── seed.ts                   # 种子数据
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

### 3. 数据模型（Prisma Schema）

```prisma
// ==================== 用户与认证 ====================

model User {
  id               String    @id @default(uuid())
  studentId        String    @unique        // 学号
  realName         String                    // 真实姓名（后台可见）
  idCardLast6      String                    // 身份证后6位
  nickname         String    @unique        // 昵称（公开展示）
  avatar           String?                   // 头像 URL
  college          String                    // 学院
  major            String                    // 专业
  grade            String                    // 年级（如 2024）
  campus           Campus                    // 校区
  gender           Gender                    // 性别
  bio              String?                   // 个性签名
  tags             String[]                  // 兴趣标签数组
  creditScore      Int       @default(70)   // 信用分 (0-100)
  points           Int       @default(0)    // 积分
  status           UserStatus @default(ACTIVE)
  lastLoginAt      DateTime?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  // 关系
  profile          Profile?
  guides           Guide[]
  purchases        Purchase[]
  matchesAsMe      Match[]    @relation("MatchMe")
  matchesAsOther   Match[]    @relation("MatchOther")
  answers          Answer[]
  ratingsGiven     Rating[]   @relation("RatingFrom")
  ratingsReceived  Rating[]   @relation("RatingTo")
  sentMessages     Message[]
  checkins         Checkin[]
  intimacyAsMe     Intimacy[] @relation("IntimacyMe")
  intimacyAsOther  Intimacy[] @relation("IntimacyOther")
  blockedUsers     BlockedUser[] @relation("Blocker")
  blockedByUsers   BlockedUser[] @relation("Blocked")

  @@index([campus])
  @@index([creditScore])
  @@index([tags])
}

enum Campus {
  JIULONGHU    // 九龙湖
  SIPAILOU     // 四牌楼
  DINGJIAQIAO  // 丁家桥
}

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  GRADUATED
  DELETED
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  photos    String[]                 // 照片 URL 数组（最多6张）
  height    Int?                     // 身高 cm
  mbti      String?                  // MBTI
  hometown  String?                  // 家乡
  interests String[]                 // 更详细的兴趣描述
  updatedAt DateTime @updatedAt
}

// ==================== 攻略市场 ====================

model Guide {
  id          String       @id @default(uuid())
  authorId    String
  author      User         @relation(fields: [authorId], references: [id])
  title       String
  description String                    // 详细说明
  category    GuideCategory
  coverImage  String?                   // 封面图
  images      String[]                  // 图片 URL 数组
  route       Json                      // { points: [{lat,lng,name,desc}] }
  budget      Int?                      // 人均预算（元）
  suitableFor GuideSuitable
  tags        String[]
  price       Int          @default(0) // 定价（积分）
  sales       Int          @default(0) // 销量
  avgRating   Float        @default(0) // 平均评分
  status      GuideStatus  @default(PENDING)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  purchases  Purchase[]
  reviews    GuideReview[]

  @@index([status, createdAt])
  @@index([category])
  @@index([tags])
}

enum GuideCategory {
  DATE          // 约会路线
  CROSS_CAMPUS  // 跨校区探索
  FOOD          // 美食探店
  STUDY         // 自习路线
  OUTING        // 周边出行
  ACTIVITY      // 活动攻略
  OTHER
}

enum GuideSuitable {
  SOLO
  COUPLE
  GROUP
  ANY
}

enum GuideStatus {
  PENDING   // 待审核
  PUBLISHED // 已发布
  REMOVED   // 已下架
}

model Purchase {
  id        String   @id @default(uuid())
  buyerId   String
  buyer     User     @relation(fields: [buyerId], references: [id])
  guideId   String
  guide     Guide    @relation(fields: [guideId], references: [id])
  price     Int                      // 购买时价格（快照）
  refunded  Boolean  @default(false)
  createdAt DateTime @default(now())

  @@unique([buyerId, guideId])
}

model GuideReview {
  id        String   @id @default(uuid())
  guideId   String
  guide     Guide    @relation(fields: [guideId], references: [id])
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  rating    Int                      // 1-5
  comment   String?
  createdAt DateTime @default(now())

  @@unique([userId, guideId])
}

// ==================== 匹配系统 ====================

model Match {
  id        String      @id @default(uuid())
  userId    String
  user      User        @relation("MatchMe", fields: [userId], references: [id])
  targetId  String
  target    User        @relation("MatchOther", fields: [targetId], references: [id])
  direction MatchAction              // 发起方的动作
  status    MatchStatus @default(PENDING)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  @@unique([userId, targetId])
  @@index([userId, status])
  @@index([targetId, status])
}

enum MatchAction {
  LEFT     // 不感兴趣
  RIGHT    // 感兴趣
  SUPER    // 超级感兴趣
}

enum MatchStatus {
  PENDING  // 单向喜欢，等待对方
  MATCHED  // 双向匹配，进入破冰
  REJECTED // 已拒绝
  EXPIRED  // 超时失效
}

// ==================== 破冰问答 ====================

model Question {
  id       String         @id @default(uuid())
  category QuestionCategory
  content  String
  active   Boolean        @default(true)
  answers  Answer[]

  @@index([category, active])
}

enum QuestionCategory {
  VALUES      // 价值观
  LIFESTYLE   // 生活方式
  INTEREST    // 兴趣爱好
  FUN         // 趣味脑洞
  SEU         // 东大专享
  EXPECTATION // 社交期待
}

model Answer {
  id         String       @id @default(uuid())
  matchId    String
  userId     String
  user       User         @relation(fields: [userId], references: [id])
  questionId String
  question   Question     @relation(fields: [questionId], references: [id])
  content    String                    // 答案内容
  createdAt  DateTime     @default(now())

  @@unique([matchId, userId])
  @@index([matchId])
}

// ==================== 聊天 ====================

model ChatSession {
  id         String       @id @default(uuid())
  matchId    String
  user1Id    String
  user2Id    String
  stage      ChatStage    @default(ICE_BREAKING)
  startedAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  messages    Message[]
  ratingGiven Rating?     @relation("SessionRating")

  @@unique([user1Id, user2Id])
  @@index([user1Id, user2Id])
}

enum ChatStage {
  ICE_BREAKING // 破冰期（72h，仅文字）
  NORMAL       // 正式聊天（可发图片+语音）
  INTIMATE     // 亲密聊天（全功能）
}

model Message {
  id         String      @id @default(uuid())
  sessionId  String
  session    ChatSession @relation(fields: [sessionId], references: [id])
  senderId   String
  sender     User        @relation(fields: [senderId], references: [id])
  type       MessageType
  content    String
  createdAt  DateTime    @default(now())
  readAt     DateTime?

  @@index([sessionId, createdAt])
}

enum MessageType {
  TEXT
  IMAGE
  VOICE
  LOCATION
  SYSTEM      // 系统消息
}

// ==================== 评分与信用 ====================

model Rating {
  id         String       @id @default(uuid())
  sessionId  String       @unique
  session    ChatSession  @relation("SessionRating", fields: [sessionId], references: [id])
  fromId     String
  fromUser   User         @relation("RatingFrom", fields: [fromId], references: [id])
  toId       String
  toUser     User         @relation("RatingTo", fields: [toId], references: [id])
  score      Int                       // 1-5
  blind      Boolean      @default(true) // 盲评标记
  createdAt  DateTime     @default(now())
  // 交叉验证信号
  chatMsgCount Int?                   // 聊天消息数
  hasRealChat  Boolean?               // 是否有实质性对话（>20条）
  verifiedAt   DateTime?              // 交叉验证通过时间

  @@index([fromId, toId])
}

// ==================== 亲密度 ====================

model Intimacy {
  id         String   @id @default(uuid())
  user1Id    String
  user1      User     @relation("IntimacyMe", fields: [user1Id], references: [id])
  user2Id    String
  user2      User     @relation("IntimacyOther", fields: [user2Id], references: [id])
  score      Int      @default(0)   // 亲密度分值
  msgCount   Int      @default(0)   // 互发消息数
  streakDays Int      @default(0)   // 连续互动天数
  rating4Count Int    @default(0)   // 互评4星以上次数
  guideBuyCount Int   @default(0)   // 互相购买攻略次数
  checkinTogether Int @default(0)   // 共同打卡次数
  lastInteractionAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@unique([user1Id, user2Id])
  @@index([score])
}

// ==================== 打卡 ====================

model Checkin {
  id        String       @id @default(uuid())
  userId    String
  user      User         @relation(fields: [userId], references: [id])
  type      CheckinType
  target    String                    // 打卡目标 ID / 名称
  location  Json                      // { lat, lng, name }
  photo     String?                   // 打卡照片 URL
  duration  Int?                      // 停留时长（分钟）
  withUserId String?                  // 同行用户
  points    Int        @default(0)    // 获得积分
  verified  Boolean    @default(false)// GPS 验证通过
  createdAt DateTime  @default(now())

  @@index([userId, createdAt])
}

enum CheckinType {
  LOCATION  // 地点打卡
  ROUTE     // 路线打卡
  DATE      // 双人打卡
  EVENT     // 活动打卡
}

// ==================== 排行榜 ====================

model Leaderboard {
  id        String          @id @default(uuid())
  month     String                      // "2026-06"
  type      LeaderboardType
  entries   Json                        // [{userId, nickname, score, rank}]
  createdAt DateTime @default(now())

  @@unique([month, type])
}

enum LeaderboardType {
  CP       // CP甜蜜榜
  BUDDY    // 搭子默契榜
  GUIDE    // 攻略达人榜
  ICEBREAK // 破冰高手榜
}

// ==================== 其他 ====================

model BlockedUser {
  id        String   @id @default(uuid())
  blockerId String
  blocker   User     @relation("Blocker", fields: [blockerId], references: [id])
  blockedId String
  blocked   User     @relation("Blocked", fields: [blockedId], references: [id])
  createdAt DateTime @default(now())

  @@unique([blockerId, blockedId])
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

---

### 4. API 设计

#### 4.0 统一规范

```
Base URL: /api/v1

请求头:
  Authorization: Bearer <jwt_token>
  Content-Type: application/json

统一响应:
{
  "code": 0,          // 0=成功 非0=错误
  "message": "ok",
  "data": {}           // 业务数据
}

分页请求:
  ?page=1&pageSize=20

分页响应:
{
  "code": 0,
  "data": {
    "list": [],
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}

错误码:
  0       成功
  10001   参数错误
  10002   未登录
  10003   无权限
  10004   资源不存在
  10005   资源冲突（重复操作）
  10010   信用分不足
  10011   积分不足
  10020   校园网验证失败
  10021   认证信息不匹配
  10030   匹配超时
  10031   破冰问题未完成
  10040   聊天未解锁
```

---

#### 4.1 认证模块 `POST /api/v1/auth`

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/register` | 注册（学号+身份证+校园网验证） |
| POST | `/auth/login` | 登录（学号+密码） |
| POST | `/auth/refresh` | 刷新 token |
| POST | `/auth/logout` | 登出 |
| POST | `/auth/verify-student` | 校验学号+身份证是否匹配 |

**注册请求体：**
```json
{
  "studentId": "213200001",
  "realName": "张三",
  "idCardLast6": "123456",
  "password": "********",
  "nickname": "三三",
  "college": "信息科学与工程学院",
  "major": "信息工程",
  "grade": "2024",
  "campus": "JIULONGHU",
  "gender": "MALE"
}
```

**校园网校验逻辑：**
```
注册时检测请求 IP：
  ├── 10.0.0.0/8       → 校内网段 ✓
  ├── 58.192.0.0/12    → 东大教育网段 ✓
  ├── 172.16.0.0/12    → 校内虚拟网 ✓
  └── 其他              → 拒绝 ✗（后期可加学工系统 Token 验证）
```

---

#### 4.2 用户模块 `GET/PUT /api/v1/users`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/users/me` | 获取当前用户信息 |
| PUT | `/users/me` | 更新个人资料 |
| GET | `/users/me/profile` | 获取详细资料卡 |
| PUT | `/users/me/profile` | 更新详细资料卡 |
| PUT | `/users/me/tags` | 更新兴趣标签（全量替换） |
| PUT | `/users/me/photos` | 上传/管理照片 |
| GET | `/users/:id/card` | 查看他人卡片（滑动匹配用） |
| GET | `/users/:id/profile` | 查看他人公开资料 |

**获取他人卡片响应（匹配用）：**
```json
{
  "id": "uuid",
  "nickname": "三三",
  "avatar": "url",
  "college": "信息科学与工程学院",
  "grade": "2024",
  "campus": "JIULONGHU",
  "bio": "寻找一起自习的搭子~",
  "tags": ["自习", "跑步", "王者荣耀"],
  "photos": ["url1", "url2"],
  "commonTags": ["自习", "跑步"],
  "intimacyRank": null
}
```

---

#### 4.3 攻略模块 `GET/POST /api/v1/guides`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/guides` | 攻略列表（筛选+分页+排序） |
| GET | `/guides/:id` | 攻略详情 |
| POST | `/guides` | 发布攻略 |
| PUT | `/guides/:id` | 编辑攻略（仅作者） |
| DELETE | `/guides/:id` | 下架攻略 |
| POST | `/guides/:id/purchase` | 购买攻略 |
| POST | `/guides/:id/review` | 评价攻略 |
| GET | `/guides/my` | 我发布的攻略 |
| GET | `/guides/purchased` | 我购买的攻略 |

**攻略列表查询参数：**
```
?category=DATE          # 按分类筛选
&campus=JIULONGHU       # 按校区筛选
&tags=散步,美食          # 标签（逗号分隔）
&sort=popular           # popular=销量 new=最新 rating=评分
&search=九龙湖           # 标题搜索
&page=1&pageSize=20
```

**发布攻略请求体：**
```json
{
  "title": "九龙湖情侣限定一日游",
  "description": "从图书馆出发...",
  "category": "DATE",
  "coverImage": "url",
  "images": ["url1", "url2"],
  "route": {
    "points": [
      {"lat": 31.89, "lng": 118.81, "name": "李文正图书馆", "desc": "起点，一起看书1h"},
      {"lat": 31.90, "lng": 118.82, "name": "橘园食堂", "desc": "吃午饭"}
    ]
  },
  "budget": 50,
  "suitableFor": "COUPLE",
  "tags": ["散步", "美食", "图书馆"],
  "price": 5
}
```

**购买攻略逻辑：**
```
1. 检查积分余额
   ├── 不足 → 返回 10011 积分不足
   └── 充足 → 继续
2. 检查是否已购买
   ├── 已购买且未退款 → 返回 10005 重复操作
   └── 未购买 → 继续
3. 扣减积分 → 创建购买记录
4. 更新攻略销量 +1
5. 给作者 +价格 积分
```

---

#### 4.4 匹配模块 `GET/POST /api/v1/match`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/match/discover` | 获取推荐用户卡片列表 |
| POST | `/match/:targetId/action` | 对用户操作（左滑/右滑/超级喜欢） |
| GET | `/match/list` | 我的匹配列表 |
| GET | `/match/:matchId` | 匹配详情 |

**动作请求体：**
```json
{
  "action": "RIGHT"
}
```

**推荐卡片逻辑（纯规则引擎）：**
```
1. 排除池：
   ├── 已操作过的用户（30天内）
   ├── 已匹配的用户
   ├── 已拉黑的用户
   ├── 同性（除非用户设置允许同性）
   └── 信用分 < 70

2. 排序权重：
   ├── 共同标签数 × 3
   ├── 不同校区 +2
   ├── 活跃度（7天内登录） +1
   └── 随机扰动 ±1（防止结果固定）

3. 分页：每次返回 20 个，缓存当次推荐列表
4. 上滑超级喜欢 → 消耗 5 积分
```

**双向匹配判定：**
```
A 右滑 B → 查询 B 是否右滑过 A
  ├── 是 → 创建 ChatSession，双方进入破冰阶段
  └── 否 → 仅记录 A 的动作，等待 B
```

---

#### 4.5 破冰问答模块 `GET/POST /api/v1/questions`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/questions/icebreak/:matchId` | 获取该匹配的破冰问题（3题） |
| POST | `/questions/icebreak/:matchId/answer` | 提交答案 |
| GET | `/questions/icebreak/:matchId/result` | 查看双方答案对比 |
| POST | `/questions/icebreak/:matchId/rate` | 给对方打分（1-5） |

**获取问题逻辑：**
```
1. 检查该匹配是否已进入破冰
2. 检查是否已超过 48 小时
   ├── 超时 → 匹配失效 → 返回 10030
   └── 未超时 → 继续
3. 从问题池随机抽取 3 题（确保不同类别）
4. 返回问题，记录已分配
```

**提交答案请求体：**
```json
{
  "questionId": "uuid",
  "content": "我最喜欢李文正图书馆三楼靠窗的位置..."
}
```

**评分请求体：**
```json
{
  "score": 4
}
```

**破冰结果判定逻辑：**
```
双方提交 + 双方评分后：
  双方都 ≥3 星 → 解锁聊天，ChatSession.stage → ICE_BREAKING
  双方都 ≥4 星 → 解锁聊天 + 标记"灵魂共鸣"
  一方 <3 星 → 匹配解除
```

---

#### 4.6 聊天模块 `GET/POST /api/v1/chat`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/chat/sessions` | 我的会话列表 |
| GET | `/chat/sessions/:sessionId/messages` | 历史消息 |
| POST | `/chat/sessions/:sessionId/messages` | 发送消息 |
| GET | `/chat/sessions/:sessionId/info` | 会话信息（阶段、对方信息） |
| POST | `/chat/sessions/:sessionId/rate` | 对本次聊天评分 |
| POST | `/chat/sessions/:sessionId/block` | 拉黑用户 |

**WebSocket 事件：**
```
客户端 → 服务端:
  chat:join      加入会话房间
  chat:message   发送消息
  chat:typing    正在输入
  chat:read      已读

服务端 → 客户端:
  chat:message   收到新消息
  chat:typing    对方正在输入
  chat:read      对方已读
  chat:upgrade   聊天升级通知
  chat:rate      请评价对方（聊天结束后）
```

**聊天阶段自动升级逻辑：**
```
定时任务（每小时）：
  阶段 1 → 阶段 2：创建 >72h，自动升级
  阶段 2 → 阶段 3：累计消息 >50 条 + 双方互评 ≥4 星
```

---

#### 4.7 评分信用模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/ratings/my` | 我的评分记录 |
| GET | `/ratings/received` | 我收到的评分 |
| GET | `/ratings/credit` | 我的信用分明细 |

**交叉验证逻辑（定时任务）：**
```
1. 收集评分对（A→B, B→A）
2. 信号 1：盲评一致性
   |A.score - B.score| ≤ 1 → 一致 (+2 权重)
   |A.score - B.score| ≥ 3 → 矛盾 (-2 权重)
3. 信号 2：行为事实
   chatMsgCount ≥ 20 → 有效互动 (+3 权重)
4. 信号 3：历史画像
   A 历史平均打分 < 2.5 → 恶意评分者 (-3 权重)
   B 历史被评分平均 ≥ 4.5 → 信用良好 (+1 权重)
5. 加权计算 → 更新信用分
6. 检测恶意模式 → 触发人工审核标记
```

---

#### 4.8 亲密度模块 `GET /api/v1/intimacy`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/intimacy/:userId` | 查看我与某用户的亲密度 |
| GET | `/intimacy/my` | 我的亲密度列表（降序） |
| GET | `/intimacy/:userId/detail` | 亲密度计算明细 |

**亲密度计算（定时任务，每小时）：**
```
score = msgCount×1 + streakDays×3 + rating4Count×5 + guideBuyCount×10 + checkinTogether×15
```

---

#### 4.9 排行榜模块 `GET /api/v1/leaderboard`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/leaderboard/cp` | CP 甜蜜榜 |
| GET | `/leaderboard/buddy` | 搭子默契榜 |
| GET | `/leaderboard/guide` | 攻略达人榜 |
| GET | `/leaderboard/icebreak` | 破冰高手榜 |

**赛季重置（每月1日 00:00 定时任务）：**
```
1. 归档上月排行到 Leaderboard 表
2. 清空本月排行缓存
3. 推送通知给 TOP3 用户
```

---

#### 4.10 打卡模块 `GET/POST /api/v1/checkin`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/checkin/nearby` | 获取附近打卡点 |
| POST | `/checkin` | 执行打卡 |
| GET | `/checkin/my` | 我的打卡记录 |
| GET | `/checkin/stats` | 打卡统计 |

**打卡请求体：**
```json
{
  "type": "DATE",
  "target": "李文正图书馆",
  "location": {"lat": 31.89, "lng": 118.81},
  "photo": "url",
  "withUserId": "uuid"
}
```

**GPS 验证逻辑：**
```
1. 计算用户位置与打卡点距离
2. 距离 ≤ 100m → 验证通过 ✓
3. 检查 WiFi 环境（是否在东大校内SSID）
4. 双人打卡 → 双方 GPS 距离 ≤ 20m
5. 照片 EXIF → 时间戳是否在打卡时间 ±5分钟
```

---

#### 4.11 积分模块 `GET /api/v1/points`

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/points/balance` | 积分余额 |
| GET | `/points/transactions` | 积分流水 |
| POST | `/points/checkin` | 每日签到 (+5) |

**积分规则表：**
| 行为 | 积分 | 每日上限 |
|------|------|----------|
| 每日签到 | +5 | 1次 |
| 发布攻略 | +3 | 3次 |
| 攻略被购买 | +定价 | 无 |
| 完成打卡 | +3 | 5次 |
| 双人打卡 | +5 | 3次 |
| 信用评价良好 | +10/月 | 1次 |
| 超级喜欢 | -5 | 无 |

---

### 5. 定时任务设计

| 任务 | 频率 | 说明 |
|------|------|------|
| 破冰超时检查 | 每10分钟 | 48h 未完成破冰 → 匹配失效 |
| 聊天阶段升级 | 每小时 | 72h 升级 + 消息数检查 |
| 亲密度计算 | 每小时 | 更新所有活跃关系的亲密度 |
| 交叉验证评分 | 每小时 | 三方信号加权判定 |
| 排行榜快照 | 每天 | 缓存当日排名 |
| 月度归档 | 每月1日 | 归档排行 + 发放第二课堂学分 |
| 不活跃降权 | 每天 | 7天未登录降低推荐权重 |
| 积分月结 | 每月1日 | 信用良好者 +10 |

---

### 6. 安全设计

| 机制 | 实现 |
|------|------|
| JWT 认证 | access_token 2h, refresh_token 7d |
| 密码哈希 | bcrypt (cost=12) |
| 校园网校验 | IP 白名单 + 学号-身份证交叉验证 |
| 敏感信息 | 真实姓名、身份证号仅后台可见，前端不返回 |
| 请求限流 | express-rate-limit，登录 10次/分钟，普通 60次/分钟 |
| 防刷 | 匹配操作 100次/天上限，发消息 200条/天 |
| SQL注入 | Prisma 参数化查询 |
| XSS | 用户输入 HTML 转义 |
| 文件上传 | 类型白名单 + 大小限制5MB + 病毒扫描（可选） |

---

---

## 第二部分：前端技术规范

---

### 1. 技术栈

| 层 | 选型 | 版本 |
|----|------|------|
| 框架 | Flutter | ≥3.22 |
| 语言 | Dart | ≥3.5 |
| 状态管理 | Riverpod | 2.x |
| 路由 | go_router | 14.x |
| 网络 | dio | 5.x |
| WebSocket | socket_io_client | 2.x |
| 本地存储 | flutter_secure_storage (token) + hive (缓存) | |
| 地图 | amap_flutter_map | |
| 图片选择 | image_picker | |
| 相机 | camera | |
| 位置 | geolocator | |
| 代码生成 | freezed + json_serializable | |

---

### 2. 目录结构

```
app/
├── lib/
│   ├── main.dart
│   ├── app.dart                       # MaterialApp 配置
│   ├── config/
│   │   ├── app_config.dart            # 环境变量
│   │   ├── theme.dart                 # 主题
│   │   └── routes.dart                # 路由表
│   ├── core/
│   │   ├── api/
│   │   │   ├── dio_client.dart        # HTTP 客户端
│   │   │   ├── api_endpoints.dart     # API 端点常量
│   │   │   ├── api_exception.dart     # 异常处理
│   │   │   └── interceptors/
│   │   │       ├── auth_interceptor.dart
│   │   │       └── error_interceptor.dart
│   │   ├── network/
│   │   │   ├── socket_client.dart     # WebSocket 客户端
│   │   │   └── connectivity.dart      # 网络状态监测
│   │   ├── storage/
│   │   │   ├── secure_storage.dart    # Token 安全存储
│   │   │   └── cache_manager.dart     # 本地缓存
│   │   ├── location/
│   │   │   └── location_service.dart  # GPS 定位服务
│   │   └── utils/
│   │       ├── validators.dart        # 表单校验
│   │       ├── date_utils.dart
│   │       └── image_utils.dart
│   ├── data/
│   │   ├── models/                    # 数据模型（freezed）
│   │   │   ├── user.dart
│   │   │   ├── guide.dart
│   │   │   ├── match_card.dart
│   │   │   ├── question.dart
│   │   │   ├── message.dart
│   │   │   ├── rating.dart
│   │   │   ├── intimacy.dart
│   │   │   ├── checkin.dart
│   │   │   ├── leaderboard.dart
│   │   │   └── pagination.dart
│   │   ├── repositories/              # 数据仓库
│   │   │   ├── auth_repository.dart
│   │   │   ├── user_repository.dart
│   │   │   ├── guide_repository.dart
│   │   │   ├── match_repository.dart
│   │   │   ├── question_repository.dart
│   │   │   ├── chat_repository.dart
│   │   │   ├── rating_repository.dart
│   │   │   ├── intimacy_repository.dart
│   │   │   ├── checkin_repository.dart
│   │   │   └── points_repository.dart
│   │   └── dto/                       # 请求/响应 DTO
│   │       ├── auth_dto.dart
│   │       ├── guide_dto.dart
│   │       └── ...
│   ├── domain/                        # 领域层（可选，按需）
│   │   └── enums/
│   │       ├── campus.dart
│   │       ├── guide_category.dart
│   │       ├── match_action.dart
│   │       ├── chat_stage.dart
│   │       └── ...
│   ├── presentation/
│   │   ├── providers/                 # Riverpod providers
│   │   │   ├── auth_provider.dart
│   │   │   ├── user_provider.dart
│   │   │   ├── guide_provider.dart
│   │   │   ├── match_provider.dart
│   │   │   ├── question_provider.dart
│   │   │   ├── chat_provider.dart
│   │   │   ├── rating_provider.dart
│   │   │   ├── intimacy_provider.dart
│   │   │   ├── checkin_provider.dart
│   │   │   └── points_provider.dart
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login_page.dart
│   │   │   │   └── register_page.dart
│   │   │   ├── home/
│   │   │   │   └── home_page.dart    # 底部导航壳
│   │   │   ├── guide/                # Tab1 - 攻略市场
│   │   │   │   ├── guide_list_page.dart
│   │   │   │   ├── guide_detail_page.dart
│   │   │   │   ├── guide_create_page.dart
│   │   │   │   └── guide_purchased_page.dart
│   │   │   ├── discover/             # Tab2 - 发现
│   │   │   │   └── discover_page.dart
│   │   │   ├── chat/                 # Tab3 - 消息
│   │   │   │   ├── chat_list_page.dart
│   │   │   │   └── chat_detail_page.dart
│   │   │   ├── icebreak/             # 破冰问答
│   │   │   │   ├── icebreak_answer_page.dart
│   │   │   │   └── icebreak_result_page.dart
│   │   │   ├── profile/
│   │   │   │   ├── my_profile_page.dart
│   │   │   │   └── user_profile_page.dart
│   │   │   ├── checkin/
│   │   │   │   └── checkin_page.dart
│   │   │   └── leaderboard/
│   │   │       └── leaderboard_page.dart
│   │   └── widgets/                  # 可复用组件
│   │       ├── match_card.dart       # 滑动卡片
│   │       ├── guide_card.dart       # 攻略卡片
│   │       ├── chat_bubble.dart      # 聊天气泡
│   │       ├── tag_chip.dart         # 标签组件
│   │       ├── rating_stars.dart     # 评分星
│   │       ├── credit_badge.dart     # 信用分徽章
│   │       ├── loading_widget.dart
│   │       └── empty_widget.dart
│   └── l10n/                         # 国际化（可选）
│       └── app_zh.arb
├── assets/
│   ├── images/
│   ├── fonts/
│   └── data/
│       └── campus_checkpoints.json   # 预设打卡点数据
├── test/
├── pubspec.yaml
└── analysis_options.yaml
```

---

### 3. 路由表

```dart
// lib/config/routes.dart

final routerProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      // 认证
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),

      // 主页（底部导航壳 + 嵌套路由）
      ShellRoute(
        builder: (_, __, child) => HomePage(child: child),
        routes: [
          GoRoute(path: '/guides', builder: (_, __) => const GuideListPage()),
          GoRoute(path: '/discover', builder: (_, __) => const DiscoverPage()),
          GoRoute(path: '/chats', builder: (_, __) => const ChatListPage()),
        ],
      ),

      // 子页面
      GoRoute(path: '/guides/:id', builder: (_, state) => GuideDetailPage(id: state.pathParameters['id']!)),
      GoRoute(path: '/guides/create', builder: (_, __) => const GuideCreatePage()),
      GoRoute(path: '/chats/:sessionId', builder: (_, state) => ChatDetailPage(sessionId: state.pathParameters['sessionId']!)),
      GoRoute(path: '/icebreak/:matchId', builder: (_, state) => IcebreakAnswerPage(matchId: state.pathParameters['matchId']!)),
      GoRoute(path: '/icebreak/:matchId/result', builder: (_, state) => IcebreakResultPage(matchId: state.pathParameters['matchId']!)),
      GoRoute(path: '/profile/me', builder: (_, __) => const MyProfilePage()),
      GoRoute(path: '/profile/:userId', builder: (_, state) => UserProfilePage(userId: state.pathParameters['userId']!)),
      GoRoute(path: '/checkin', builder: (_, __) => const CheckinPage()),
      GoRoute(path: '/leaderboard', builder: (_, __) => const LeaderboardPage()),
    ],
  );
});
```

---

### 4. 数据模型示例（Dart freezed）

```dart
// lib/data/models/user.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String nickname,
    String? avatar,
    required String college,
    required String major,
    required String grade,
    required String campus,
    required String gender,
    String? bio,
    required List<String> tags,
    required int creditScore,
    required int points,
    required String status,
    DateTime? lastLoginAt,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

@freezed
class MatchCard with _$MatchCard {
  const factory MatchCard({
    required String id,
    required String nickname,
    String? avatar,
    required String college,
    required String grade,
    required String campus,
    String? bio,
    required List<String> tags,
    required List<String> photos,
    required List<String> commonTags,
  }) = _MatchCard;

  factory MatchCard.fromJson(Map<String, dynamic> json) => _$MatchCardFromJson(json);
}
```

---

### 5. 状态管理设计（Riverpod）

```dart
// lib/presentation/providers/auth_provider.dart

// 认证状态
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.error(String message) = _Error;
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider));
});

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;
  AuthNotifier(this._repo) : super(const AuthState.initial());

  Future<void> login(String studentId, String password) async { ... }
  Future<void> register(RegisterDto dto) async { ... }
  Future<void> logout() async { ... }
  Future<void> checkAuth() async { ... }
}
```

```dart
// lib/presentation/providers/match_provider.dart

// 匹配卡片状态
@freezed
class MatchState with _$MatchState {
  const factory MatchState({
    @Default([]) List<MatchCard> cards,
    @Default(0) int currentIndex,
    @Default(false) bool isLoading,
    @Default(false) bool hasMore,
    String? error,
  }) = _MatchState;
}

final matchProvider = StateNotifierProvider<MatchNotifier, MatchState>((ref) {
  return MatchNotifier(ref.read(matchRepositoryProvider));
});

class MatchNotifier extends StateNotifier<MatchState> {
  final MatchRepository _repo;
  MatchNotifier(this._repo) : super(const MatchState());

  Future<void> loadDiscoverCards() async { ... }
  Future<void> swipe(MatchAction action) async { ... }
  void skipCurrent() { ... }  // 本地切换下一张，不调 API
}
```

```dart
// lib/presentation/providers/chat_provider.dart

// 聊天状态
@freezed
class ChatState with _$ChatState {
  const factory ChatState({
    @Default([]) List<ChatSession> sessions,
    Map<String, List<Message>>? messages,  // sessionId → messages
    @Default(false) bool connecting,
    String? currentSessionId,
  }) = _ChatState;
}

final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(ref.read(chatRepositoryProvider), ref.read(socketProvider));
});

class ChatNotifier extends StateNotifier<ChatState> {
  final ChatRepository _repo;
  final SocketClient _socket;
  ChatNotifier(this._repo, this._socket) : super(const ChatState()) {
    _socket.onMessage(_onMessage);
  }
  ...
}
```

---

### 6. API 客户端配置

```dart
// lib/core/api/dio_client.dart

class ApiClient {
  late final Dio _dio;

  ApiClient() {
    _dio = Dio(BaseOptions(
      baseUrl: AppConfig.apiBaseUrl,   // http://10.0.2.2:3000/api/v1 (开发)
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {'Content-Type': 'application/json'},
    ));
    _dio.interceptors.addAll([
      AuthInterceptor(),
      ErrorInterceptor(),
      LogInterceptor(requestBody: true, responseBody: true),
    ]);
  }

  Future<ApiResponse<T>> get<T>(String path, {
    Map<String, dynamic>? queryParameters,
    required T Function(Map<String, dynamic>) fromJson,
  }) async { ... }

  Future<ApiResponse<T>> post<T>(String path, {
    dynamic data,
    required T Function(Map<String, dynamic>) fromJson,
  }) async { ... }

  // put, delete ...
}
```

---

### 7. WebSocket 管理

```dart
// lib/core/network/socket_client.dart

class SocketClient {
  late final Socket _socket;
  final _messageController = StreamController<SocketMessage>.broadcast();
  Stream<SocketMessage> get messages => _messageController.stream;

  Future<void> connect(String token) async {
    _socket = io(
      AppConfig.wsBaseUrl,
      OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .enableAutoConnect()
        .build(),
    );

    _socket.on('chat:message', (data) {
      _messageController.add(SocketMessage.fromJson(data));
    });
    _socket.on('chat:typing', (data) { ... });
    _socket.on('chat:read', (data) { ... });
    _socket.on('chat:upgrade', (data) { ... });
    _socket.on('chat:rate', (data) { ... });
  }

  void joinSession(String sessionId) => _socket.emit('chat:join', {'sessionId': sessionId});
  void sendMessage(String sessionId, String content, MessageType type) { ... }
  void sendTyping(String sessionId) => _socket.emit('chat:typing', {'sessionId': sessionId});
  void markAsRead(String sessionId) => _socket.emit('chat:read', {'sessionId': sessionId});

  void dispose() {
    _socket.dispose();
    _messageController.close();
  }
}
```

---

### 8. 核心业务逻辑（前端侧）

#### 8.1 滑动匹配卡片状态机

```
状态：
  NORMAL     → 卡片居中展示
  DRAGGING   → 跟随手指拖动
  SWIPING_LEFT  → 左滑飞出动画
  SWIPING_RIGHT → 右滑飞出动画
  SWIPING_UP    → 上滑飞出动画（超级喜欢）
  MATCHED       → 弹出匹配成功对话框
  EMPTY         → 今日已无更多卡片
```

#### 8.2 破冰问答流程

```
匹配成功 → 推送通知
  ├→ 打开 IcebreakPage
  │   ├→ 展示3道问题
  │   ├→ 填写答案 → 提交（不可修改）
  │   └→ 等待对方...
  │
  ├→ 对方也提交后 → 通知双方
  │   └→ 打开 IcebreakResultPage
  │       ├→ 展示双人答案对比
  │       └→ 打分（1-5星，提交后不可改）
  │
  └→ 双方打分后 → 显示结果
      ├→ 解锁聊天 → 跳转到 ChatDetailPage
      └→ 未通过 → 返回发现页
```

#### 8.3 攻略购买流程

```
浏览攻略列表 → 点击 → 详情页
  ├→ 免费攻略 → 直接查看完整内容
  └→ 付费攻略 → 显示预览（前30%内容）
      ├→ 点击"购买" → 积分检查
      │   ├→ 积分不足 → 提示 + 引导签到
      │   └→ 积分足够 → 确认弹窗 → 扣分 → 解锁完整内容
      └→ 已购买 → 直接查看
```

#### 8.4 定位打卡流程

```
进入打卡页 → 获取当前位置
  ├→ 显示附近打卡点（距离排序）
  ├→ 选择打卡点 → 检查距离
  │   ├→ 距离 >100m → 提示"请靠近打卡点"
  │   └→ 距离 ≤100m → 允许打卡
  │       ├→ 拍照（可选）
  │       └→ 提交 → GPS+WiFi 后端验证 → 打卡成功 + 积分
  └→ 双人打卡
      ├→ 选择同伴
      └→ 双方 GPS 距离 ≤20m → 验证通过
```

---

### 9. 离线与缓存策略

| 数据 | 缓存方式 | 过期时间 | 说明 |
|------|----------|----------|------|
| 用户信息 | hive (本地) | 7天 | 启动时读取，登录后刷新 |
| 攻略列表 | dio cache | 5分钟 | 减少滚动加载请求 |
| 匹配卡片 | 不缓存 | — | 每次都拉最新 |
| 聊天消息 | hive | 永久 | 已加载的不重复请求 |
| 打卡点 | 本地 JSON | 静态 | 打包在 assets 中 |
| 排行榜 | dio cache | 10分钟 | 不实时不影响体验 |
| Token | secure_storage | — | 加密存储 |

---

### 10. 错误处理约定

```dart
// lib/presentation/providers 中统一错误处理

Future<void> _execute(Future<void> Function() action) async {
  try {
    state = state.copyWith(isLoading: true, error: null);
    await action();
  } on ApiException catch (e) {
    state = state.copyWith(error: e.message);
    if (e.code == 10002) {
      // token 过期 → 跳转到登录页
      ref.read(routerProvider).go('/login');
    }
  } catch (e) {
    state = state.copyWith(error: '网络错误，请稍后重试');
  } finally {
    state = state.copyWith(isLoading: false);
  }
}

// 全局错误码 → 用户提示映射
String errorMessage(int code) => switch (code) {
  10001 => '请检查输入信息',
  10002 => '请重新登录',
  10010 => '信用分不足，暂时无法使用此功能',
  10011 => '积分不足，签到获取更多积分吧',
  10020 => '请在校园网环境下注册',
  10030 => '回答已超时，匹配已失效',
  10040 => '聊天尚未解锁，请先完成破冰问答',
  _    => '出错了，请稍后再试',
};
```

---

### 11. 性能要求

| 指标 | 目标值 |
|------|--------|
| 首屏加载 | < 2 秒 |
| 攻略列表加载 | < 500ms（缓存命中 < 100ms） |
| 匹配卡片加载 | < 800ms（20张） |
| 聊天消息发送 | < 200ms（WebSocket 传输） |
| GPS 定位获取 | < 3 秒 |
| 图片上传 | < 5 秒（5MB 以内） |
| 内存占用 | < 200MB（空闲状态 < 80MB） |
| 崩溃率 | < 0.5% |

---

### 12. 安全要求（前端）

| 要求 | 实现 |
|------|------|
| Token 安全存储 | flutter_secure_storage（Keychain/KeyStore 加密） |
| 敏感信息不落地 | 身份证号、真实姓名不缓存在本地 |
| HTTPS only | 生产环境强制 HTTPS + SSL Pinning |
| 聊天内容不缓存 | 离开聊天页即清除内存中的消息 |
| 截屏检测 | 可选：查看对方资料时检测截屏并提示 |
| 代码混淆 | `flutter build --obfuscate --split-debug-info` |
