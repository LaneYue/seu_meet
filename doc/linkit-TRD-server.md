# linkit 服务端技术需求文档（TRD-Server）

---

## 1. 技术栈与基础设施

### 1.1 技术选型

| 层 | 选型 | 版本 | 用途 |
|----|------|------|------|
| 运行时 | Node.js | ≥18 LTS | — |
| 语言 | TypeScript | ≥5.0 | — |
| 框架 | Express.js | 4.x | HTTP 路由 |
| ORM | Prisma | 5.x | 数据库操作 |
| 数据库 | PostgreSQL + PostGIS | 15+ | 持久化 + 地理空间查询 |
| 缓存 | Redis | 7.x | 排行榜/会话/限流 |
| 对象存储 | MinIO（开发）/ 阿里云 OSS（生产） | — | 图片文件 |
| 即时通讯 | Socket.IO | 4.x | 实时消息 |
| 地图 | 高德地图 Web API | — | GPS 逆地理 |
| 容器 | Docker + Docker Compose | — | 部署 |
| 日志 | pino | — | 结构化日志 |
| 校验 | zod | — | 请求/响应校验 |

### 1.2 目录结构

```
server/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── config/
│   │   ├── env.ts
│   │   └── database.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── campusGuard.ts
│   │   ├── validate.ts
│   │   ├── rateLimiter.ts
│   │   └── errorHandler.ts
│   ├── modules/
│   │   ├── auth/           # 认证模块
│   │   ├── user/            # 用户模块
│   │   ├── guide/           # 攻略模块
│   │   ├── match/           # 匹配模块
│   │   ├── question/        # 破冰问答模块
│   │   ├── chat/            # 聊天模块
│   │   ├── rating/          # 评分信用模块
│   │   ├── intimacy/        # 亲密度模块
│   │   ├── checkin/         # 打卡模块
│   │   ├── points/          # 积分模块
│   │   └── leaderboard/     # 排行榜模块
│   ├── shared/
│   │   ├── errors.ts
│   │   ├── response.ts
│   │   └── constants.ts
│   ├── jobs/                # 定时任务
│   │   ├── scheduler.ts
│   │   ├── icebreakTimeout.ts
│   │   ├── chatStageUpgrade.ts
│   │   ├── intimacyCalc.ts
│   │   ├── crossVerify.ts
│   │   ├── leaderboardSnapshot.ts
│   │   └── monthlyArchive.ts
│   └── types/
│       └── index.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── docker-compose.yml
├── Dockerfile
├── package.json
└── tsconfig.json
```

---

## 2. API 接口规范

### 2.0 统一规范 (Contract)

> 本节定义前后端之间的接口契约。前端开发据此 mock 数据并行开发，后端开发据此实现。

#### 基础约定

```
Base URL:  /api/v1
Content-Type:  application/json
Auth:  Bearer <access_token>    (登录后除 register / login / verify-student 外全部接口必带)
```

#### 统一响应信封

```json
{
  "code": 0,
  "message": "ok",
  "data": { }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0=成功，非0=业务错误 |
| message | string | 人类可读消息 |
| data | object \| array \| null | 业务载荷，列表若无数据返回空数组 `[]` |

#### 分页约定

**请求参数（Query String）：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | number | 1 | 页码，从 1 开始 |
| pageSize | number | 20 | 每页条数，上限 50 |

**分页响应：**

```json
{
  "code": 0,
  "data": {
    "list": [],
    "total": 256,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

#### 全局错误码

| code | 含义 | 触发时机 |
|------|------|----------|
| 0 | 成功 | — |
| 10001 | 参数校验失败 | 请求体/Query 不符合 schema |
| 10002 | 未登录 / Token 过期 | Auth 中间件拦截 |
| 10003 | 无权限 | 不是资源所有者或管理员 |
| 10004 | 资源不存在 | 查询 id 不存在 |
| 10005 | 资源冲突 | 重复注册/重复购买/重复操作 |
| 10010 | 信用分不足 | 低于功能所要求的最低信用分 |
| 10011 | 积分不足 | 购买/超级喜欢时积分不够 |
| 10012 | 操作频率过高 | 触发了限流 |
| 10020 | 校园网验证失败 | 注册时 IP 不在校内 |
| 10021 | 认证信息不匹配 | 学号与身份证校验失败 |
| 10030 | 匹配已超时 | 48h 未完成破冰 |
| 10031 | 破冰问题未完成 | 对方尚未答题或评分 |
| 10032 | 匹配已失效 | 双方不匹配 |
| 10040 | 聊天未解锁 | 尚未通过破冰 |
| 10041 | 对方已拉黑 | 消息发送被拒绝 |

---

### 2.1 认证模块 `POST /api/v1/auth`

---

#### 2.1.1 注册

```
POST /api/v1/auth/register
```

> 通过校园网 IP 校验 + 学号身份证交叉验证，创建用户账号。

**Request Body:**

```json
{
  "studentId": "213200001",
  "realName": "张三",
  "idCardLast6": "123456",
  "password": "Abc12345",
  "nickname": "三三",
  "college": "信息科学与工程学院",
  "major": "信息工程",
  "grade": "2024",
  "campus": "JIULONGHU",
  "gender": "MALE"
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|----------|
| studentId | string | ✓ | 9位数字 |
| realName | string | ✓ | 2~10 个中文字符 |
| idCardLast6 | string | ✓ | 6位数字 |
| password | string | ✓ | 8~32 字符，必须含字母+数字 |
| nickname | string | ✓ | 2~12 字符，唯一 |
| college | string | ✓ | 预设枚举值 |
| major | string | ✓ | |
| grade | string | ✓ | "2020"~"2029" |
| campus | string | ✓ | JIULONGHU / SIPAILOU / DINGJIAQIAO |
| gender | string | ✓ | MALE / FEMALE / OTHER |

**业务处理流程：**

```
1. 参数校验 (zod schema)
   └→ 失败 → 10001

2. 校园网身份校验
   ├── 检测请求来源 IP
   │   ├── 10.0.0.0/8        → 校内局域网 ✓
   │   ├── 58.192.0.0/12     → 东大教育网 ✓
   │   ├── 172.16.0.0/12     → 校内虚拟网 ✓
   │   ├── 223.3.0.0/16      → 东大 CERNET ✓
   │   └── 其他               → 允许透传（后期对接学工Token后收紧）
   └→ 失败 → 10020

3. 学号与身份证交叉验证
   ├── 调用学校学工系统接口校验 (studentId + idCardLast6 + realName)
   │   └── 若学工接口不可用 → 降级为格式校验 + 人工审核队列
   └→ 失败 → 10021

4. 账户唯一性检查
   ├── studentId 已存在 → 10005 "该学号已注册"
   ├── nickname 已存在 → 10005 "昵称已被占用"
   └── 通过 → 继续

5. 密码哈希 (bcrypt, cost=12)
6. 创建 User 记录 (creditScore=20, points=0, status=ACTIVE)
7. 创建空 Profile 记录
8. 签发 JWT (access_token 2h + refresh_token 7d)
9. 返回用户信息 + token
```

**Response (201):**

```json
{
  "code": 0,
  "data": {
    "user": {
      "id": "uuid",
      "studentId": "213200001",
      "nickname": "三三",
      "avatar": null,
      "college": "信息科学与工程学院",
      "major": "信息工程",
      "grade": "2024",
      "campus": "JIULONGHU",
      "gender": "MALE",
      "bio": null,
      "tags": [],
      "creditScore": 20,
      "points": 0,
      "status": "ACTIVE",
      "createdAt": "2026-06-06T10:00:00Z"
    },
    "token": {
      "accessToken": "eyJhbG...",
      "refreshToken": "eyJhbG...",
      "expiresIn": 7200
    }
  }
}
```

**Error Responses:**

| 场景 | code | message |
|------|------|---------|
| 参数校验失败 | 10001 | "参数校验失败: studentId 格式不正确" |
| 校外 IP | 10020 | "请在校园网环境下注册" |
| 学号身份证不匹配 | 10021 | "学号与身份证信息不匹配，请核实后重试" |
| 学号已注册 | 10005 | "该学号已注册" |
| 昵称被占用 | 10005 | "昵称已被占用" |

---

#### 2.1.2 登录

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "studentId": "213200001",
  "password": "Abc12345"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| studentId | string | ✓ | 学号 |
| password | string | ✓ | 密码 |

**业务处理流程：**

```
1. 查询 User where studentId
   └→ 不存在 → 10004 "学号未注册"
2. bcrypt 验证密码
   └→ 失败 → 10021 "密码错误"
3. 检查账户状态
   ├── SUSPENDED → 10003 "账户已被冻结"
   ├── DELETED    → 10004 "账户已注销"
   └── ACTIVE/GRADUATED → 继续
4. 签发 JWT
5. 更新 lastLoginAt
6. 返回用户信息 + token
```

**Response (200):** 同注册返回结构

---

#### 2.1.3 刷新 Token

```
POST /api/v1/auth/refresh
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG...",
    "expiresIn": 7200
  }
}
```

---

#### 2.1.4 校验学号归属

```
POST /api/v1/auth/verify-student
```

> 仅校验学号与身份证是否匹配，不创建账户。注册流程第一步调用。

**Request Body:**

```json
{
  "studentId": "213200001",
  "realName": "张三",
  "idCardLast6": "123456"
}
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "verified": true
  }
}
```

---

#### 2.1.5 登出

```
POST /api/v1/auth/logout
Header: Authorization: Bearer <token>
```

**业务处理流程：**

```
1. 删除 refreshToken 记录
2. 将当前 access_token 加入 Redis 黑名单 (TTL=剩余有效时长)
```

**Response (200):**

```json
{
  "code": 0,
  "data": null
}
```

---

### 2.2 用户模块 `/api/v1/users`

---

#### 2.2.1 获取当前用户

```
GET /api/v1/users/me
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "studentId": "213200001",
    "nickname": "三三",
    "avatar": "https://oss.example.com/avatars/xxx.jpg",
    "college": "信息科学与工程学院",
    "major": "信息工程",
    "grade": "2024",
    "campus": "JIULONGHU",
    "gender": "MALE",
    "bio": "寻找一起自习的搭子~",
    "tags": ["自习", "跑步", "王者荣耀", "摄影"],
    "creditScore": 85,
    "points": 120,
    "status": "ACTIVE",
    "lastLoginAt": "2026-06-06T09:30:00Z",
    "createdAt": "2026-06-06T10:00:00Z"
  }
}
```

> **⚠ 安全约定：此接口不返回 `realName` 和 `idCardLast6`，这些字段仅在内部使用。**

---

#### 2.2.2 更新个人资料

```
PUT /api/v1/users/me
```

**Request Body:**

```json
{
  "nickname": "三三_new",
  "avatar": "https://oss.example.com/avatars/xxx_new.jpg",
  "bio": "更新后的签名",
  "gender": "FEMALE"
}
```

> 所有字段可选，传什么更新什么。`nickname` 变更需检查唯一性。

---

#### 2.2.3 获取详细资料卡（自己）

```
GET /api/v1/users/me/profile
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "profile-uuid",
    "userId": "user-uuid",
    "photos": [
      "https://oss.example.com/photos/1.jpg",
      "https://oss.example.com/photos/2.jpg"
    ],
    "height": 175,
    "mbti": "INTJ",
    "hometown": "江苏南京",
    "interests": ["跑步：每周三次 5km", "摄影：风光为主", "编程：Rust 爱好者"]
  }
}
```

---

#### 2.2.4 更新详细资料卡

```
PUT /api/v1/users/me/profile
```

**Request Body:**

```json
{
  "photos": ["url1", "url2", "url3"],
  "height": 175,
  "mbti": "INTJ",
  "hometown": "江苏南京",
  "interests": ["跑步", "摄影", "编程"]
}
```

| 字段 | 类型 | 校验 |
|------|------|------|
| photos | string[] | 最多 6 张 |
| height | number | 100~250 |
| mbti | string | 16型之一 |
| hometown | string | ≤20 字符 |
| interests | string[] | 每条 ≤50 字符，最多 10 条 |

---

#### 2.2.5 更新兴趣标签

```
PUT /api/v1/users/me/tags
```

**Request Body:**

```json
{
  "tags": ["自习", "跑步", "王者荣耀", "摄影", "电影"]
}
```

> 全量替换。最多 20 个标签，每个 ≤10 字符。

---

#### 2.2.6 查看他人卡片（匹配发现页用）

```
GET /api/v1/users/:id/card
```

> 这是**核心接口**，驱动 Tab 2 "发现" 页的卡片展示。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "nickname": "思思",
    "avatar": "https://oss.example.com/avatars/yyy.jpg",
    "college": "建筑学院",
    "major": "建筑学",
    "grade": "2023",
    "campus": "SIPAILOU",
    "bio": "画图之余想找人一起喝咖啡",
    "tags": ["咖啡", "摄影", "CityWalk"],
    "photos": [
      "https://oss.example.com/photos/p1.jpg",
      "https://oss.example.com/photos/p2.jpg"
    ],
    "height": 168,
    "mbti": "ENFP",
    "hometown": "浙江杭州",
    "interests": ["建筑摄影", "手冲咖啡", "城市漫步"],
    "commonTags": ["摄影"],
    "commonTagsCount": 1,
    "creditScore": 92
  }
}
```

> **隐私说明：** `realName`, `idCardLast6`, `studentId` 绝不返回。`creditScore` 只返回分数段（如 90+ 显示为 "优秀"）或直接返回分数字（取决于产品决策，建议显示分数段）。

---

#### 2.2.7 查看他人公开资料

```
GET /api/v1/users/:id/profile
```

> 关系建立后（已通过破冰解锁聊天），查看对方完整个人页。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "nickname": "思思",
    "avatar": "https://oss.example.com/avatars/yyy.jpg",
    "college": "建筑学院",
    "major": "建筑学",
    "grade": "2023",
    "campus": "SIPAILOU",
    "bio": "画图之余想找人一起喝咖啡",
    "tags": ["咖啡", "摄影", "CityWalk"],
    "photos": ["p1.jpg", "p2.jpg", "p3.jpg"],
    "height": 168,
    "mbti": "ENFP",
    "hometown": "浙江杭州",
    "interests": ["建筑摄影", "手冲咖啡", "城市漫步"],
    "creditLevel": "EXCELLENT",
    "intimacy": {
      "score": 125,
      "streakDays": 7,
      "checkinTogether": 2
    }
  }
}
```

> 权限控制：仅当 Caller 与 Target 之间存在 ACTIVE 的 ChatSession 时才返回完整资料，否则返回 10003。

---

### 2.3 攻略市场模块 `/api/v1/guides`

---

#### 2.3.1 攻略列表

```
GET /api/v1/guides
```

**Query Parameters:**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| category | string | | DATE / CROSS_CAMPUS / FOOD / STUDY / OUTING / ACTIVITY / OTHER |
| campus | string | | JIULONGHU / SIPAILOU / DINGJIAQIAO |
| tags | string | | 逗号分隔，如 `散步,美食` |
| sort | string | | popular(销量) / new(最新) / rating(评分)，默认 popular |
| search | string | | 标题关键词搜索 |
| page | number | | 分页页码 |
| pageSize | number | | 每页数量 |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "guide-uuid",
        "title": "九龙湖情侣限定一日游",
        "coverImage": "https://oss.example.com/guides/cover1.jpg",
        "category": "DATE",
        "campus": "JIULONGHU",
        "tags": ["散步", "美食", "图书馆"],
        "price": 5,
        "sales": 128,
        "avgRating": 4.6,
        "author": {
          "id": "author-uuid",
          "nickname": "攻略达人",
          "avatar": "url"
        },
        "createdAt": "2026-06-01T08:00:00Z"
      }
    ],
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "hasMore": true
  }
}
```

---

#### 2.3.2 攻略详情

```
GET /api/v1/guides/:id
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "guide-uuid",
    "title": "九龙湖情侣限定一日游",
    "description": "从李文正图书馆出发，先一起看一小时书...中午到橘园食堂...下午去九龙湖湿地公园散步...傍晚在体育馆打羽毛球...",
    "category": "DATE",
    "coverImage": "url",
    "images": ["url1", "url2", "url3"],
    "route": {
      "points": [
        {"lat": 31.8912, "lng": 118.8118, "name": "李文正图书馆", "desc": "起点，一起看书1h", "stayMin": 60},
        {"lat": 31.8935, "lng": 118.8150, "name": "橘园食堂", "desc": "吃午饭，推荐酸菜鱼", "stayMin": 30},
        {"lat": 31.8960, "lng": 118.8180, "name": "九龙湖湿地公园", "desc": "环湖散步", "stayMin": 45},
        {"lat": 31.8900, "lng": 118.8130, "name": "体育馆", "desc": "打羽毛球/乒乓球", "stayMin": 60}
      ]
    },
    "budget": 50,
    "suitableFor": "COUPLE",
    "tags": ["散步", "美食", "图书馆", "运动"],
    "price": 5,
    "sales": 128,
    "avgRating": 4.6,
    "reviewCount": 32,
    "status": "PUBLISHED",
    "author": {
      "id": "author-uuid",
      "nickname": "攻略达人",
      "avatar": "url"
    },
    "purchased": false,
    "canRefund": false,
    "createdAt": "2026-06-01T08:00:00Z"
  }
}
```

> `purchased` 表示当前用户是否已购买。已购买时返回完整 `description`、`route`、`images`，未购买时 `description` 只返回前 30% 并截断。

---

#### 2.3.3 发布攻略

```
POST /api/v1/guides
```

**Request Body:**

```json
{
  "title": "九龙湖情侣限定一日游",
  "description": "从李文正图书馆出发...",
  "category": "DATE",
  "coverImage": "https://oss.example.com/guides/cover1.jpg",
  "images": ["url1", "url2"],
  "route": {
    "points": [
      {"lat": 31.8912, "lng": 118.8118, "name": "李文正图书馆", "desc": "起点", "stayMin": 60}
    ]
  },
  "budget": 50,
  "suitableFor": "COUPLE",
  "tags": ["散步", "美食"],
  "price": 5
}
```

| 字段 | 类型 | 必填 | 校验规则 |
|------|------|------|----------|
| title | string | ✓ | 2~40 字符 |
| description | string | ✓ | 10~2000 字符 |
| category | GuideCategory | ✓ | 枚举值 |
| coverImage | string | | URL，≤500字符 |
| images | string[] | | 每个 URL ≤500字符，最多9张 |
| route.points | array | ✓ | 至少2个点，最多20个 |
| route.points[].lat | number | ✓ | 31.0~32.5（南京纬度范围） |
| route.points[].lng | number | ✓ | 118.0~119.5（南京经度范围） |
| route.points[].name | string | ✓ | 2~30 字符 |
| budget | number | | 0~10000 |
| suitableFor | GuideSuitable | | SOLO / COUPLE / GROUP / ANY |
| tags | string[] | | 每标签 ≤10字符，最多5个 |
| price | number | | 0~50 |

**业务处理流程：**

```
1. 参数校验
2. 检查信用分 ≥ 50
   └→ 失败 → 10010
3. 检查今日发布上限 3 篇
   └→ 失败 → 10012
4. 创建 Guide (status=PENDING)
5. 异步调用内容审核（敏感词 + 图片审核）
   ├── 审核中 → 用户可见(自己)
   ├── 审核通过 → status → PUBLISHED，积分+3
   └── 审核不通过 → status → REMOVED，通知用户原因
6. 返回 Guide
```

---

#### 2.3.4 编辑攻略

```
PUT /api/v1/guides/:id
```

> 仅作者可编辑，且 `status=PUBLISHED` 时编辑需重新审核。

---

#### 2.3.5 购买攻略

```
POST /api/v1/guides/:id/purchase
```

**Request Body:** 无（从 Token 获取用户身份）

**业务处理流程：**

```
1. 检查攻略 status=PUBLISHED
2. 检查是否已购买
   ├── 已购买且未退款 → 10005 "您已购买过此攻略"
   ├── 已购买但已退款 → 允许重新购买
   └── 未购买 → 继续
3. 检查积分余额 ≥ price
   └→ 失败 → 10011 "积分不足，当前积分 X，需要 Y 积分"
4. 扣减积分 (UPDATE users SET points = points - price WHERE points ≥ price)
5. 创建 Purchase 记录
6. 攻略销量 +1
7. 作者积分 +price (UPDATE users SET points = points + price)

事务保证: Step 3-7 在同一事务内执行
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "purchaseId": "purchase-uuid",
    "guideId": "guide-uuid",
    "price": 5,
    "balanceAfter": 115,
    "canRefundUntil": "2026-06-07T10:00:00Z"
  }
}
```

---

#### 2.3.6 退款

```
POST /api/v1/guides/:id/refund
```

> 购买后 24 小时内且未使用可以退款。

**业务处理流程：**

```
1. 查询 Purchase 记录
2. 检查是否在 24h 内
3. 标记 refunded=true
4. 退回积分到购买者
5. 销量-1
6. 扣除作者积分（若作者余额不足则记负数）
```

---

#### 2.3.7 评价攻略

```
POST /api/v1/guides/:id/review
```

**Request Body:**

```json
{
  "rating": 4,
  "comment": "路线很棒，橘园食堂的酸菜鱼确实好吃！"
}
```

> 限已购买且未退款的用户评价。每人限评一次。

---

### 2.4 匹配模块 `/api/v1/match`

> 这是核心模块，驱动 Tab 2 "发现" 页的滑动匹配。

---

#### 2.4.1 获取推荐卡片

```
GET /api/v1/match/discover
```

**Query Parameters:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| count | number | 20 | 单次获取数量，上限 20 |

**匹配推荐算法（纯规则引擎，无 AI）：**

```
━━━ 第1步：构建排除池 ━━━

当前用户 U 不应看到以下用户：
  ├── 自己
  ├── U 在 30 天内已操作过的（Match 表中有记录）
  ├── U 已成功匹配且未解除的
  ├── U 已拉黑或已拉黑 U 的
  ├── 同性（gender 相同）— 默认规则，后期可加性取向配置
  ├── creditScore < 70
  └── status != ACTIVE

━━━ 第2步：候选集排序 ━━━

对剩余候选用户按以下公式计算推荐分：

  recommendScore = 
      commonTags × 3            # 共同标签数，每重合1个 +3
    + campusDiff × 2            # 不同校区 +2（鼓励跨校区）
    + isActive(7d) × 1          # 7天内登录过 +1
    + creditScoreBonus           # 信用分90+额外 +1
    + random(-1, 1)              # 随机扰动，防止固定排序

━━━ 第3步：排序 + TopN ━━━

按 recommendScore 降序排列，取前 {count} 个。

━━━ 第4步：缓存策略 ━━━

本次推荐列表写入 Redis (key=discover:{userId}, TTL=30min)
用户滑动完毕后再次请求才刷新。
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "cards": [
      {
        "id": "user-uuid-1",
        "nickname": "思思",
        "avatar": "url",
        "college": "建筑学院",
        "major": "建筑学",
        "grade": "2023",
        "campus": "SIPAILOU",
        "bio": "画图之余想找人一起喝咖啡",
        "tags": ["咖啡", "摄影", "CityWalk"],
        "photos": ["url1", "url2"],
        "height": 168,
        "mbti": "ENFP",
        "hometown": "浙江杭州",
        "interests": ["建筑摄影", "手冲咖啡"],
        "commonTags": ["摄影"],
        "commonTagsCount": 1,
        "creditScore": 92
      }
    ],
    "remaining": 20,
    "refreshAfter": "2026-06-06T11:00:00Z"
  }
}
```

> `remaining` 表示还有多少张卡片未滑动。`refreshAfter` 表示缓存过期后可重新拉取的时间。

---

#### 2.4.2 对用户执行匹配动作

```
POST /api/v1/match/:targetId/action
```

**Request Body:**

```json
{
  "action": "RIGHT"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | ✓ | LEFT(不感兴趣) / RIGHT(感兴趣) / SUPER(超级喜欢) |

**业务处理流程（核心状态机）：**

```
用户 U 对 T 执行 action：

Case 1: action = LEFT
  ├── 创建/更新 Match 记录 (direction=LEFT, status=REJECTED)
  └── 返回 { matched: false, action: "LEFT" }

Case 2: action = RIGHT
  ├── 查询 T 是否对 U 有过 RIGHT/SUPER
  │   ├── 是 → 双向匹配成功!
  │   │   ├── 更新双方 Match 记录 status=MATCHED
  │   │   ├── 创建 ChatSession
  │   │   ├── 随机抽取 3 道破冰问题
  │   │   ├── 推送通知给双方
  │   │   └── 返回 { matched: true, matchId, needIceBreak: true }
  │   └── 否 → 仅记录 U 的动作
  │       └── 返回 { matched: false, action: "RIGHT" }

Case 3: action = SUPER
  ├── 检查积分 ≥ 5
  │   └→ 不足 → 10011
  ├── 扣减 5 积分
  ├── 强提醒 T # 超级喜欢会触发推送通知
  └── 同 RIGHT 逻辑（查询是否双向）
```

**Response — 普通操作 (未匹配):**

```json
{
  "code": 0,
  "data": {
    "matched": false,
    "action": "RIGHT"
  }
}
```

**Response — 双向匹配成功:**

```json
{
  "code": 0,
  "data": {
    "matched": true,
    "matchId": "match-uuid",
    "sessionId": "session-uuid",
    "needIceBreak": true,
    "targetUser": {
      "id": "target-uuid",
      "nickname": "思思",
      "avatar": "url",
      "college": "建筑学院"
    }
  }
}
```

---

#### 2.4.3 我的匹配列表

```
GET /api/v1/match/list
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "matchId": "match-uuid",
        "status": "MATCHED",
        "targetUser": {
          "id": "target-uuid",
          "nickname": "思思",
          "avatar": "url",
          "college": "建筑学院"
        },
        "matchedAt": "2026-06-06T11:30:00Z",
        "iceBreak": {
          "status": "WAITING_ANSWERS",
          "myAnswered": false,
          "otherAnswered": false,
          "deadline": "2026-06-08T11:30:00Z"
        }
      }
    ]
  }
}
```

---

#### 2.4.4 匹配详情

```
GET /api/v1/match/:matchId
```

> 返回匹配状态、破冰进度、聊天阶段等信息。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "matchId": "match-uuid",
    "status": "MATCHED",
    "matchedAt": "2026-06-06T11:30:00Z",
    "targetUser": {
      "id": "target-uuid",
      "nickname": "思思",
      "avatar": "url",
      "college": "建筑学院",
      "major": "建筑学",
      "grade": "2023",
      "campus": "SIPAILOU"
    },
    "iceBreak": {
      "status": "COMPLETED",
      "myScore": 4,
      "otherScore": 5
    },
    "chat": {
      "sessionId": "session-uuid",
      "stage": "ICE_BREAKING",
      "stageDescription": "破冰期 - 仅支持文字消息"
    },
    "intimacy": {
      "score": 45,
      "streakDays": 3
    }
  }
}
```

---

### 2.5 破冰问答模块 `/api/v1/questions`

---

#### 2.5.1 获取破冰问题

```
GET /api/v1/questions/icebreak/:matchId
```

> 匹配成功后调用。每个匹配只分配一次问题（3道）。

**业务处理流程：**

```
1. 验证该 match 属于当前用户
2. 检查 match.status = MATCHED
3. 检查超时（匹配后 48h）
   └→ 超时 → status=EXPIRED，返回 10030
4. 从问题池随机抽取 3 题
   规则：
   ├── 3 题必须来自不同 QuestionCategory
   ├── 优先抽取双方标签相关的问题（如标签含"摄影"→ 优先兴趣类）
   └── 问题存入 Redis (key=icebreak:{matchId}, TTL=48h)
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "matchId": "match-uuid",
    "deadline": "2026-06-08T11:30:00Z",
    "remaining": "47h59m",
    "questions": [
      {
        "id": "question-uuid-1",
        "category": "VALUES",
        "categoryLabel": "价值观",
        "content": "你认为大学里最重要的是什么？"
      },
      {
        "id": "question-uuid-2",
        "category": "LIFESTYLE",
        "categoryLabel": "生活方式",
        "content": "周末通常会怎么度过？"
      },
      {
        "id": "question-uuid-3",
        "category": "SEU",
        "categoryLabel": "东大专享",
        "content": "你在东大最喜欢的一个角落是哪里？"
      }
    ]
  }
}
```

---

#### 2.5.2 提交答案

```
POST /api/v1/questions/icebreak/:matchId/answer
```

**Request Body:**

```json
{
  "answers": [
    {"questionId": "question-uuid-1", "content": "我认为是找到自己真正热爱的事情并为之努力。"},
    {"questionId": "question-uuid-2", "content": "一般会去图书馆看书，或者和室友出去探店。"},
    {"questionId": "question-uuid-3", "content": "李文正图书馆三楼靠窗的位置，可以看到整个九龙湖。"}
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| answers | array | ✓ | 长度=3，每条必填 |
| answers[].questionId | string | ✓ | 问题 ID |
| answers[].content | string | ✓ | 答案，10~500字符 |

**业务处理流程：**

```
1. 验证问题列表匹配
2. 检查是否已提交（不可修改）
3. 创建 3 条 Answer 记录
4. 检查对方是否也已提交
   ├── 是 → 通知双方"可以互相查看答案了"
   └── 否 → 仅保存
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "submitted": true,
    "otherSubmitted": false,
    "message": "答案已提交，等待对方完成"
  }
}
```

---

#### 2.5.3 查看双方答案对比

```
GET /api/v1/questions/icebreak/:matchId/result
```

> 双方都已提交答案后才能访问。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "matchId": "match-uuid",
    "myNickname": "三三",
    "otherNickname": "思思",
    "comparisons": [
      {
        "question": {
          "id": "q1",
          "category": "VALUES",
          "categoryLabel": "价值观",
          "content": "你认为大学里最重要的是什么？"
        },
        "myAnswer": "我认为是找到自己真正热爱的事情并为之努力。",
        "otherAnswer": "建立持久的友谊和找到自己的方向。"
      }
    ],
    "canRate": true
  }
}
```

---

#### 2.5.4 评分

```
POST /api/v1/questions/icebreak/:matchId/rate
```

**Request Body:**

```json
{
  "score": 4
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| score | number | ✓ | 1-5 整数 |

**业务处理流程（最终破冰判定）：**

```
1. 保存 Rating 记录（blind=true，盲评）
2. 检查对方是否也评分
   ├── 是 → 执行判定
   │   ├── 双方 score ≥ 3 → 解锁聊天 ChatSession.stage = ICE_BREAKING
   │   ├── 双方 score ≥ 4 → 解锁 + 标记"灵魂共鸣"badge
   │   └── 任一方 < 3 → 匹配解除 match.status = REJECTED
   └── 否 → 等待

3. 合并完成后通知双方结果（Socket 事件）
```

**Response (200) — 盲评等待期:**

```json
{
  "code": 0,
  "data": {
    "stage": "WAITING_OTHER_RATE",
    "message": "评分已提交，等待对方评分，之后将揭晓结果"
  }
}
```

**Response (200) — 破冰通过:**

```json
{
  "code": 0,
  "data": {
    "stage": "UNLOCKED",
    "result": "MATCH",
    "sessionId": "session-uuid",
    "badge": "NONE",
    "message": "破冰成功！你们可以开始聊天了"
  }
}
```

**Response (200) — 破冰未通过:**

```json
{
  "code": 0,
  "data": {
    "stage": "REJECTED",
    "result": "UNMATCH",
    "message": "对方觉得不太合适，期待下一次相遇"
  }
}
```

---

### 2.6 聊天模块 `/api/v1/chat`

---

#### 2.6.1 我的会话列表

```
GET /api/v1/chat/sessions
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "sessionId": "session-uuid",
        "stage": "NORMAL",
        "targetUser": {
          "id": "target-uuid",
          "nickname": "思思",
          "avatar": "url",
          "college": "建筑学院"
        },
        "lastMessage": {
          "content": "好的，那明天图书馆见！",
          "type": "TEXT",
          "createdAt": "2026-06-06T14:20:00Z"
        },
        "unreadCount": 2,
        "intimacy": {
          "score": 125
        },
        "updatedAt": "2026-06-06T14:20:00Z"
      }
    ]
  }
}
```

---

#### 2.6.2 会话详情

```
GET /api/v1/chat/sessions/:sessionId/info
```

> 返回会话信息、对方资料、关系阶段。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "sessionId": "session-uuid",
    "stage": "NORMAL",
    "stageDescription": "正式聊天 - 可以发送图片和语音",
    "createdAt": "2026-06-06T11:30:00Z",
    "nextStageAt": "2026-06-09T11:30:00Z",
    "targetUser": {
      "id": "target-uuid",
      "nickname": "思思",
      "avatar": "url",
      "college": "建筑学院",
      "online": true,
      "lastSeen": "2026-06-06T14:22:00Z"
    },
    "statistics": {
      "totalMessages": 45,
      "daysSinceFirstChat": 1
    }
  }
}
```

---

#### 2.6.3 获取历史消息

```
GET /api/v1/chat/sessions/:sessionId/messages
```

**Query Parameters:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| before | string | now | ISO时间戳，获取此时间之前的消息 |
| limit | number | 30 | 每页条数，上限 50 |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "msg-uuid",
        "type": "TEXT",
        "content": "好的，那明天图书馆见！",
        "senderId": "target-uuid",
        "isMe": false,
        "createdAt": "2026-06-06T14:20:00Z",
        "readAt": "2026-06-06T14:22:00Z"
      }
    ],
    "hasMore": false
  }
}
```

---

#### 2.6.4 发送消息

```
POST /api/v1/chat/sessions/:sessionId/messages
```

**Request Body:**

```json
{
  "type": "TEXT",
  "content": "好呀，几点方便？"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | ✓ | TEXT / IMAGE / VOICE / LOCATION |
| content | string | ✓ | 文本内容、图片URL、语音URL、或JSON(lat,lng,name) |

**限制规则：**

```
ICE_BREAKING 阶段 → 仅 TEXT
NORMAL 阶段 → TEXT + IMAGE + VOICE + LOCATION
INTIMATE 阶段 → 全部类型
```

**WebSocket 实时通道（替代轮询）：**

> **接口说明：** 此接口创建消息后会通过 Socket.IO 推送实时消息给接收方。
> 前端应在进入聊天页时建立 WebSocket 连接，**不依赖此 REST 接口做实时接收**。
> 此 REST 接口适配两种场景：
> 1. App 在后台 / WebSocket 未连接时 → 走 REST 发消息
> 2. 拉取历史消息 → 使用 2.6.3 接口

---

### 2.7 WebSocket 事件规范

```
连接地址: wss://api.linkit.com/chat
Auth: { token: "access_token" }
```

| 方向 | 事件名 | Payload | 说明 |
|------|--------|---------|------|
| C→S | `chat:join` | `{sessionId}` | 加入会话房间 |
| C→S | `chat:message` | `{sessionId, type, content}` | 发送消息 |
| C→S | `chat:typing` | `{sessionId}` | 正在输入 |
| C→S | `chat:read` | `{sessionId, messageId}` | 标记已读 |
| S→C | `chat:message` | `{sessionId, message}` | 收到新消息 |
| S→C | `chat:typing` | `{sessionId, userId}` | 对方正在输入 |
| S→C | `chat:read` | `{sessionId, messageId, userId}` | 消息已被对方阅读 |
| S→C | `chat:upgrade` | `{sessionId, stage}` | 聊天阶段升级通知 |
| S→C | `icebreak:ready` | `{matchId}` | 双方答题完成可互看 |
| S→C | `icebreak:result` | `{matchId, result}` | 破冰结果通知 |
| S→C | `match:new` | `{matchId, targetUser}` | 新的匹配通知 |

---

### 2.8 评分与信用模块 `/api/v1/ratings`

---

#### 2.8.1 我的信用分明细

```
GET /api/v1/ratings/credit
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "creditScore": 85,
    "breakdown": {
      "identityAuth": 20,
      "fulfillment": 25,
      "behavior": 30,
      "contribution": 10
    },
    "history": [
      {
        "reason": "通过破冰问答并获得对方 4 星好评",
        "change": 5,
        "balance": 85,
        "createdAt": "2026-06-05T14:00:00Z"
      },
      {
        "reason": "攻略被采纳为优质内容",
        "change": 10,
        "balance": 80,
        "createdAt": "2026-06-01T10:00:00Z"
      }
    ]
  }
}
```

---

### 2.9 交叉验证评分机制（定时任务）

> 核心防作弊机制。每小时执行一次。

```
Cron: 0 * * * *  (每小时整点)

流程:
  1. 查询 Rating 表中 verifiedAt IS NULL 的评分对
  2. 对于每组评分对 (A→B, B→A):

  ━━━ 信号 1: 盲评一致性检测 ━━━
    双方在破冰阶段互相打分，彼此看不到对方的分数（blind=true）

    diff = |A.score - B.score|
    ├── diff ≤ 1 → 一致 (+2 权重)
    └── diff ≥ 3 → 矛盾 (-2 权重，触发标记)

  ━━━ 信号 2: 行为事实支撑 ━━━
    统计该 ChatSession 中的消息数
    ├── msgCount ≥ 20 → 有效互动 (+3 权重)，hasRealChat=true
    ├── msgCount ≥ 5  → 轻微互动 (+1 权重)
    └── msgCount < 5  → 几乎无互动 (0 权重)，标记低质量关系

  ━━━ 信号 3: 历史画像 ━━━
    统计用户 A 作为评分者的历史行为
    ├── 平均评分 < 2.5 且评分次数 ≥ 5 → 恶意评分者 (-3 权重)
    │   标记: suspiciousRater=true
    ├── 平均评分 > 4.5 且评分次数 ≥ 10 → 可信评分者 (+1 权重)
    └── 中间 → 正常 (0 权重)

    统计用户 B 作为被评者的历史画像
    ├── 被评分平均 < 3.0 且被评 ≥ 5 次 → 问题用户标记
    └── 被评分平均 ≥ 4.5 → 信用良好 (+1 权重)

  ━━━ 综合判定 ━━━
    finalWeight = 信号1 + 信号2 + 信号3

    ├── finalWeight ≥ 4 → 高分信任
    │   评分完全生效，更新信用分
    │   verifiedAt = now()

    ├── 0 ≤ finalWeight < 4 → 普通
    │   评分半额生效（×0.5）
    │   标记需要更多交互数据

    ├── finalWeight < 0 → 低信任/可疑
    │   评分无效（×0）
    │   若用户 A 连续 3 次被标记为可疑 → 触发人工审核 + 通知管理员
    │   若用户 A 被半数以上评分者标记 → 信用分 -15，限制匹配功能
    └── verifiedAt = now()
```

---

### 2.10 积分模块 `/api/v1/points`

---

#### 2.10.1 积分余额

```
GET /api/v1/points/balance
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "balance": 120
  }
}
```

---

#### 2.10.2 积分流水

```
GET /api/v1/points/transactions?page=1&pageSize=20
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "txn-uuid",
        "type": "PURCHASE_GUIDE",
        "description": "购买攻略「九龙湖情侣限定一日游」",
        "amount": -5,
        "balance": 115,
        "createdAt": "2026-06-06T10:30:00Z"
      },
      {
        "id": "txn-uuid-2",
        "type": "DAILY_CHECKIN",
        "description": "每日签到",
        "amount": 5,
        "balance": 120,
        "createdAt": "2026-06-06T08:00:00Z"
      }
    ],
    "total": 12,
    "page": 1,
    "pageSize": 20,
    "hasMore": false
  }
}
```

---

#### 2.10.3 每日签到

```
POST /api/v1/points/checkin
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "amount": 5,
    "balance": 125,
    "streak": 3,
    "message": "签到成功，连续签到 3 天"
  }
}
```

---

#### 2.10.4 积分规则完整表

| 行为 | 积分变动 | 每日/月上限 | 触发模块 |
|------|----------|-------------|----------|
| 每日签到 | +5 | 1次/天 | points |
| 发布攻略通过审核 | +3 | 3次/天 | guide |
| 攻略被购买 | +定价 | 无上限 | guide |
| 购买攻略 | -定价 | 无上限 | guide |
| 攻略退款 | +定价(退回) | — | guide |
| 地点打卡 | +3 | 5次/天 | checkin |
| 双人打卡 | +5 | 3次/天 | checkin |
| 超级喜欢 | -5 | 无上限 | match |
| 信用良好(月度) | +10 | 1次/月 | rating(定时) |
| 攻略被标记优质 | +20 | 无上限 | guide(审核) |
| 举报有效 | +5 | 无上限 | rating |

---

### 2.11 亲密度模块 `/api/v1/intimacy`

---

#### 2.11.1 我的亲密度列表

```
GET /api/v1/intimacy/my
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "userId": "target-uuid",
        "nickname": "思思",
        "avatar": "url",
        "college": "建筑学院",
        "score": 125,
        "streakDays": 7,
        "checkinTogether": 2
      }
    ]
  }
}
```

---

#### 2.11.2 亲密度明细

```
GET /api/v1/intimacy/:userId/detail
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "userId": "target-uuid",
    "nickname": "思思",
    "score": 125,
    "breakdown": {
      "msgCount": {"value": 35, "score": 35},
      "streakDays": {"value": 7, "score": 21},
      "rating4Count": {"value": 2, "score": 10},
      "guideBuyCount": {"value": 1, "score": 10},
      "checkinTogether": {"value": 3, "score": 45}
    },
    "formula": "35×1 + 7×3 + 2×5 + 1×10 + 3×15 = 125"
  }
}
```

---

### 2.12 排行榜模块 `/api/v1/leaderboard`

---

#### 2.12.1 获取排行榜

```
GET /api/v1/leaderboard/:type
```

| type | 说明 |
|------|------|
| cp | CP 甜蜜榜（双人亲密度排行） |
| buddy | 搭子默契榜 |
| guide | 攻略达人榜（攻略销售量） |
| icebreak | 破冰高手榜（被评分最高） |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "type": "cp",
    "month": "2026-06",
    "entries": [
      {
        "rank": 1,
        "users": [
          {"id": "u1", "nickname": "三三", "avatar": "url"},
          {"id": "u2", "nickname": "思思", "avatar": "url"}
        ],
        "score": 525
      }
    ],
    "updatedAt": "2026-06-06T15:00:00Z"
  }
}
```

---

### 2.13 打卡模块 `/api/v1/checkin`

---

#### 2.13.1 附近打卡点

```
GET /api/v1/checkin/nearby?lat=31.8912&lng=118.8118
```

---

#### 2.13.2 执行打卡

```
POST /api/v1/checkin
```

**Request Body:**

```json
{
  "type": "DATE",
  "target": "李文正图书馆",
  "location": {"lat": 31.8912, "lng": 118.8118},
  "photo": "https://oss.example.com/checkin/xxx.jpg",
  "stayMin": 60,
  "withUserId": "target-uuid"
}
```

**GPS 验证逻辑：**

```
1. 计算 |用户位置 - 打卡点位置|
   ├── ≤ 100m → ✓ 通过
   └── > 100m → 拒绝,返回 "请靠近打卡点后再打卡"

2. 双人打卡额外检查
   ├── 双方 GPS 距离 ≤ 20m → ✓ 通过
   └── > 20m → 拒绝

3. 照片 EXIF 校验（可选）
   ├── 时间戳在打卡时间 ±5min → ✓ 通过
   └── 否则标记为可疑

4. WiFi 环境校验
   ├── SSID 包含 "seu" 或 "SEU-WLAN" → ✓ 校内
   └── 仅用于加分验证，不通过也不拒绝
```

---

## 3. 定时任务

| 任务 | Cron | 说明 |
|------|------|------|
| 破冰超时检查 | `*/10 * * * *` | 48h 未完成 → 匹配标记 EXPIRED |
| 聊天阶段升级 | `0 * * * *` | 72h 自动 NORMAL；50+消息 → INTIMATE |
| 亲密度重算 | `0 * * * *` | 所有活跃关系重算 |
| 交叉验证评分 | `0 * * * *` | 三方信号加权判定 |
| 排行榜快照 | `0 2 * * *` | 每日凌晨 2 点更新排序 |
| 月度归档 | `0 0 1 * *` | 每月 1 日归档排行，发放月度奖励 |
| 降权不活跃用户 | `0 3 * * *` | 7 天未登录降低推荐权重 |
| 积分月度结算 | `0 0 1 * *` | 信用良好者 +10 |

---

## 4. 安全设计

| 机制 | 实现 | 说明 |
|------|------|------|
| JWT | access_token 2h + refresh_token 7d | 黑名单机制 |
| 密码 | bcrypt (cost=12) | — |
| 敏感字段 | realName, idCardLast6 仅内部使用 | 绝不通过 API 返回 |
| 校园网校验 | IP 白名单 | 注册时校验，登录不校验 |
| 限流 | express-rate-limit | login 10次/min，API 60次/min |
| 防刷 | 每日上限检查 | 匹配 100次/天，消息 200条/天 |
| 文件上传 | 类型白名单 + 最大 5MB | jpg/png/webp |
| XSS/注入 | zod 校验 + Prisma 参数化 | 用户输入清洗 |

---

## 5. 错误码速查

| 码 | 含义 | 是否需要给用户看详情 |
|----|------|---------------------|
| 0 | 成功 | — |
| 10001 | 参数校验失败 | ✓ 返回具体字段错误 |
| 10002 | 未登录 / Token 过期 | ✓ |
| 10003 | 无权限操作 | ✓ |
| 10004 | 资源不存在 | ✓ |
| 10005 | 资源冲突 | ✓ |
| 10010 | 信用分不足 | ✓ |
| 10011 | 积分不足 | ✓ |
| 10012 | 操作频率过高 | ✓ |
| 10020 | 校园网验证失败 | ✓ |
| 10021 | 认证信息不匹配 | ✓ |
| 10030 | 匹配已超时 | ✓ |
| 10031 | 对方尚未完成破冰 | ✓ |
| 10032 | 匹配已失效 | ✓ |
| 10040 | 聊天未解锁 | ✓ |
| 10041 | 已被对方拉黑 | ✗ 静默处理 |
| 10999 | 服务器内部错误 | ✗ 显示为"网络错误" |

