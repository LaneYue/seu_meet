# 待实现后端接口需求文档

> 本文档覆盖前端已实现页面但后端尚无对应接口的三个模块：**成就系统**、**广场（搭子需求）**、**吧唧兑换**。
>
> 前端当前状态：全部使用本地 Mock 数据，后端接口上线后直接替换调用点即可。

---

## 一、成就系统

### 背景
前端已完成 `AchievementWallPage`（`/achievements`），50 个成就数据硬编码在 `frontend/src/data/achievements.ts`，解锁状态 mock 写死。后端需提供持久化存储和事件触发解锁。

---

### 1.1 成就定义表 `achievements`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | UUID | 主键 |
| `code` | String UNIQUE | 如 `SL01`，格式：校区+类型+序号 |
| `name` | String | 如 `老图钉子户` |
| `campus` | Enum `S/J/D/C` | 四牌楼/九龙湖/丁家桥/跨校区 |
| `category` | Enum `L/I/M/F/H` | 学习/互动/里程/美食/文化 |
| `conditionDesc` | String | 达成条件描述 |
| `humorDesc` | String | 幽默文案 |
| `imagePath` | String | `/achievements/{code}.png` |
| `sortOrder` | Integer | 1–50 |

### 1.2 用户解锁记录表 `user_achievements`

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | String FK | 关联 users.id |
| `achievementCode` | String FK | 关联 achievements.code |
| `unlockedAt` | DateTime | 解锁时间 |

唯一约束：`(userId, achievementCode)`

---

### 1.3 GET `/api/v1/achievements` — 获取全量成就+解锁状态

需要 JWT 认证。

**响应 data**
```json
{
  "list": [
    {
      "code": "SL01",
      "name": "老图钉子户",
      "campus": "S",
      "category": "L",
      "conditionDesc": "连续 7 天在老图书馆签到自习",
      "humorDesc": "老图的门卫大爷已经把你的脸加进了白名单",
      "imagePath": "/achievements/SL01.png",
      "unlocked": false,
      "unlockedAt": null
    }
  ],
  "unlockedCount": 1,
  "totalCount": 50
}
```

**前端替换点**：`AchievementWallPage` 组件中 `allAchievements` 替换为此接口返回值。

---

### 1.4 POST `/api/v1/achievements/{code}/unlock` — 解锁成就

需要 JWT 认证。由打卡、匹配、签到等业务事件触发，也可由前端在特定操作完成后主动调用。

**响应 data**
```json
{
  "code": "JH03",
  "name": "东大人认证",
  "alreadyUnlocked": false,
  "unlockedAt": "2026-06-06T10:00:00",
  "pointsAwarded": 5
}
```

**业务规则**
- 解锁即 +5 积分（调用 `points_service`）
- 重复解锁返回 `alreadyUnlocked: true`，不重复写入，不重复加积分
- `CH01 东南精神继承者` 需校验用户已解锁所有 7 个文化类成就（SH01~SH03, JH01~JH03, DH01~DH02）

---

### 1.5 POST `/api/v1/achievements/check` — 批量事件检查（内部）

由各业务路由调用，自动判断是否触发成就解锁。

**请求 body**
```json
{ "event": "register" }
```

**支持 event**

| event | 可能触发的成就 |
|---|---|
| `register` | JH03 东大人认证 |
| `checkin_7days` | SL01 老图钉子户 |
| `route_complete` | JM01 九龙湖环湖者 等 |
| `match_on_bus` | CI02 校车情缘 |
| `partner_count_20` | CI03 搭子宇宙中心 |

**响应 data**
```json
{ "newUnlocked": [{ "code": "JH03", "name": "东大人认证" }] }
```

---

### 1.6 Seed 数据

`backend/seed.py` 新增 `seed_achievements()`，写入全部 50 条成就。内容与 `frontend/src/data/achievements.ts` 完全对应。

---

## 二、广场模块（搭子需求）

### 背景
前端 `PartnerSquarePage`（`/partners`）和 `PartnerPostPage`（`/partners/new`）均使用 Mock 数据，`HomeFeedPage` 的「热门搭子需求」区块同样使用 Mock。

---

### 2.1 数据表 `plaza_posts`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | UUID | 主键 |
| `authorId` | String FK | 发布者 |
| `title` | String | 帖子标题 |
| `category` | Enum | `study/sport/life/interest` |
| `status` | Enum | `recruiting/active/closed` |
| `time` | String | 活动时间描述 |
| `place` | String | 地点 |
| `capacity` | Integer | 总人数上限 |
| `joinedCount` | Integer | 当前已加入 |
| `note` | String | 备注 |
| `createdAt` | DateTime | |

### 2.2 数据表 `plaza_joins`

| 字段 | 类型 | 说明 |
|---|---|---|
| `postId` | String FK | |
| `userId` | String FK | |
| `action` | Enum | `join/request` |
| `joinedAt` | DateTime | |

---

### 2.3 GET `/api/v1/plaza/posts` — 获取广场帖子列表

**Query 参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `category` | String? | `study/sport/life/interest` |
| `page` | Integer | 默认 1 |
| `pageSize` | Integer | 默认 20 |

**响应 data**
```json
{
  "list": [
    {
      "id": "uuid",
      "title": "今晚图书馆自习搭子",
      "category": "study",
      "status": "recruiting",
      "time": "今天 19:00-22:00",
      "place": "九龙湖图书馆 · 研习区",
      "joined": 4,
      "total": 6,
      "note": "一起专注学习，互相监督",
      "tone": "green",
      "author": { "id": "...", "nickname": "...", "avatar": null },
      "createdAt": "2026-06-06T10:00:00"
    }
  ],
  "total": 12,
  "hasMore": false
}
```

**字段映射（前端 `PartnerPost` 类型）**

| 后端 | 前端 |
|---|---|
| `category` → tone | `study→green`, `sport→purple`, `life→orange`, `interest→blue` |
| `joinedCount` | `joined` |
| `capacity` | `total` |
| `status=recruiting` | `status="招募中"` |
| `status=active` | `status="进行中"` |

**前端替换点**：`api.ts` 中 `partners.listPosts()` 的 Mock import 替换为此接口调用。

---

### 2.4 POST `/api/v1/plaza/posts` — 发布帖子

需要 JWT 认证。

**请求 body**
```json
{
  "title": "今晚图书馆自习搭子",
  "category": "study",
  "time": "今天 19:00-22:00",
  "place": "九龙湖图书馆 · 研习区",
  "capacity": 6,
  "note": "一起专注学习"
}
```

**业务规则**：发帖 +1 积分。`capacity` 范围 2–20。

---

### 2.5 POST `/api/v1/plaza/posts/{post_id}/action` — 加入/申请

需要 JWT 认证。

**请求 body**
```json
{ "action": "join" }
```

**响应 data**
```json
{ "postId": "uuid", "joined": 5, "total": 6 }
```

**业务规则**
- `joined >= total` → 返回 `code: 10011`（已满）
- 不能操作自己发布的帖子

---

## 三、吧唧兑换

### 背景
前端 `RedeemPage`（`/achievements/:code/redeem`）已完成 UI，收集宿舍/房间号后提交，目前为 Mock 状态。

---

### 3.1 数据表 `redeem_orders`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | UUID | 主键 |
| `userId` | String FK | |
| `achievementCode` | String | |
| `cost` | Integer | 消耗积分，固定 50 |
| `dormBuilding` | String | 宿舍楼栋 |
| `dormRoom` | String | 房间号 |
| `status` | Enum | `pending/shipped/delivered` |
| `createdAt` | DateTime | |

---

### 3.2 POST `/api/v1/achievements/{code}/redeem` — 提交兑换

需要 JWT 认证。

**请求 body**
```json
{
  "dormBuilding": "梅园 3 舍",
  "dormRoom": "302"
}
```

**响应 data**
```json
{
  "orderId": "uuid",
  "achievementCode": "SL01",
  "cost": 50,
  "balanceAfter": 80,
  "status": "pending"
}
```

**业务规则**
- 成就必须已解锁（`user_achievements` 中存在记录），否则 `code: 10003`
- 同一成就只能兑换一次，重复提交返回 `code: 10005`
- 扣减 50 积分（`points_service`）
- 余额不足返回 `code: 10011`

---

### 3.3 GET `/api/v1/achievements/redeem/orders` — 兑换记录

需要 JWT 认证。

**响应 data**
```json
{
  "list": [
    {
      "orderId": "uuid",
      "achievementCode": "SL01",
      "achievementName": "老图钉子户",
      "status": "pending",
      "createdAt": "2026-06-06T10:00:00"
    }
  ]
}
```

---

## 四、积分流水（现有接口增强）

现有 `GET /api/v1/points/transactions` 返回空列表（demo 阶段），需补充：

### 4.1 数据表 `point_logs`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | UUID | 主键 |
| `userId` | String FK | |
| `amount` | Integer | 正数加分，负数扣分 |
| `desc` | String | 如 `每日签到`、`购买路线` |
| `refType` | String? | 关联业务类型 |
| `refId` | String? | 关联业务 ID |
| `createdAt` | DateTime | |

### 4.2 接口更新

`GET /api/v1/points/transactions` 返回：
```json
{
  "list": [
    { "id": "uuid", "desc": "每日签到", "amount": 5, "createdAt": "2026-06-06T08:00:00" }
  ],
  "total": 20,
  "hasMore": true
}
```

**前端替换点**：`PointsPage` 中 `pointsApi.getTransactions()` 已对接此接口，后端返回数据后 Mock 自动退出。

---

## 五、优先级汇总

| 优先级 | 模块 | 接口数 | 备注 |
|---|---|---|---|
| **P0** | 广场帖子列表 + 发帖 | 2 | 广场页面完全 Mock |
| **P0** | 成就全量 + 解锁状态 | 1 | 成就墙解锁状态固定 |
| **P1** | 积分流水写入 | 1 表 + 1接口 | 流水现在返回空 |
| **P1** | 成就解锁触发 | 2 | register 时自动解锁 JH03 |
| **P2** | 广场加入/申请 | 1 | 交互功能 |
| **P2** | 吧唧兑换提交 + 记录 | 2 | 实体吧唧配送 |
| **P3** | 成就 Seed 数据 | — | 需先有表 |
