# 成就系统后端接口需求文档

> 前端已完成静态实现（50 个成就数据硬编码在 `frontend/src/data/achievements.ts`，图片资源在 `frontend/public/achievements/`）。本文档描述后端需要新增的表结构和接口，用于替换前端硬编码数据、持久化用户解锁状态。

---

## 一、数据库新增表

### 1.1 `achievements` 表（成就定义）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `String` (UUID) | 主键 |
| `code` | `String` | 唯一标识，如 `SL01`，格式：校区代码 + 类型代码 + 序号 |
| `name` | `String` | 成就名称，如 `老图钉子户` |
| `campus` | `Enum` | 校区：`S`(四牌楼) / `J`(九龙湖) / `D`(丁家桥) / `C`(跨校区) |
| `category` | `Enum` | 类型：`L`(学习) / `I`(互动) / `M`(里程) / `F`(美食) / `H`(文化) |
| `conditionDesc` | `String` | 达成条件描述 |
| `humorDesc` | `String` | 幽默描述文案 |
| `imagePath` | `String` | 图片路径，格式 `/achievements/{code}.png` |
| `isHidden` | `Boolean` | 是否为隐藏成就，默认 `false` |
| `sortOrder` | `Integer` | 排序序号（1-50） |

**说明**：50 条成就数据通过 `seed.py` 写入，内容与前端 `achievements.ts` 完全对应。

---

### 1.2 `user_achievements` 表（用户解锁记录）

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | `String` (UUID) | 主键 |
| `userId` | `String` | 外键 → `users.id` |
| `achievementCode` | `String` | 外键 → `achievements.code` |
| `unlockedAt` | `DateTime` | 解锁时间 |

**唯一约束**：`(userId, achievementCode)` 联合唯一，同一成就不重复解锁。

---

## 二、接口列表

### 2.1 获取全部成就（含个人解锁状态）

**GET** `/api/v1/achievements`  
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
      "humorDesc": "老图的门卫大爷已经把你的脸加进了白名单，进出不用刷卡了",
      "imagePath": "/achievements/SL01.png",
      "unlocked": false,
      "unlockedAt": null
    },
    {
      "code": "JH03",
      "name": "东大人认证",
      "campus": "J",
      "category": "H",
      "conditionDesc": "完成新生入学典礼后获得",
      "humorDesc": "拿到学生证那一刻，你的人生履历上多了东大两个字，简历正式开光",
      "imagePath": "/achievements/JH03.png",
      "unlocked": true,
      "unlockedAt": "2025-09-01T00:00:00"
    }
  ],
  "unlockedCount": 1,
  "totalCount": 50
}
```

**排序**：按 `sortOrder` 升序（即成就清单中的 1-50 顺序）。

---

### 2.2 获取当前用户已解锁成就

**GET** `/api/v1/achievements/me`  
需要 JWT 认证。

**响应 data**：仅返回 `unlocked: true` 的成就，结构同 2.1 的单条。

```json
{
  "list": [...],
  "count": 1
}
```

---

### 2.3 解锁成就（由行为事件触发）

**POST** `/api/v1/achievements/{code}/unlock`  
需要 JWT 认证。**此接口供后端内部服务调用**（打卡、签到、匹配等业务完成时触发），前端也可在特定场景主动调用（如引导完成后）。

**路径参数**

| 参数 | 说明 |
|---|---|
| `code` | 成就代码，如 `SL01` |

**响应 data**

```json
{
  "code": "SL01",
  "name": "老图钉子户",
  "alreadyUnlocked": false,
  "unlockedAt": "2026-06-06T10:30:00"
}
```

若已解锁，`alreadyUnlocked: true`，不重复写入，正常返回 `code: 0`。

**业务规则**
- 写入 `user_achievements` 表
- 解锁后 +5 积分（通过 `points_service` 执行）
- 解锁 `CH01 东南精神继承者` 需校验用户是否已解锁所有 SH / JH / DH 类型（7 个）成就，否则返回 `code: 10003`

---

### 2.4 批量触发成就检查（内部用）

**POST** `/api/v1/achievements/check`  
需要 JWT 认证。

**请求 body**

```json
{
  "event": "checkin",
  "context": {
    "location": "老图书馆",
    "consecutiveDays": 7
  }
}
```

后端根据 `event` 类型和 `context` 判断是否触发对应成就解锁。

**支持的 event 类型**

| event | 触发成就示例 |
|---|---|
| `checkin` | SL01（连续签到图书馆 7 天） |
| `route_complete` | JM01（完成九龙湖环湖路线） |
| `match_success` | CI02（校车情缘） |
| `register` | JH03（东大人认证，注册即解锁） |
| `plaza_join` | JI01（橘园搭子，找到 3 个饭搭） |

**响应 data**

```json
{
  "newUnlocked": [
    { "code": "SL01", "name": "老图钉子户" }
  ]
}
```

空数组表示本次无新解锁。

---

## 三、seed 数据要求

在 `backend/seed.py` 中新增 `seed_achievements()` 函数，将 50 条成就写入 `achievements` 表：

```python
ACHIEVEMENTS = [
  { "code": "SL01", "name": "老图钉子户", "campus": "S", "category": "L",
    "conditionDesc": "连续 7 天在老图书馆签到自习",
    "humorDesc": "老图的门卫大爷已经把你的脸加进了白名单，进出不用刷卡了",
    "imagePath": "/achievements/SL01.png", "sortOrder": 1 },
  # ... 共 50 条，与 frontend/src/data/achievements.ts 完全对应
]
```

---

## 四、前后端对接方式

前端目前使用硬编码的 `allAchievements` 数组（`frontend/src/data/achievements.ts`），后端接口就绪后，在 `frontend/src/services/api.ts` 中新增：

```ts
achievements: {
  listAll: () => http.get<{ list: Achievement[]; unlockedCount: number; totalCount: number }>("/achievements"),
  listMine: () => http.get<{ list: Achievement[]; count: number }>("/achievements/me"),
  unlock: (code: string) => http.post(`/achievements/${code}/unlock`),
}
```

并将 `AchievementWallPage` 中的 `allAchievements` 替换为接口调用，`unlocked` 状态从后端返回，无需前端硬编码。

---

## 五、优先级

| 优先级 | 任务 |
|---|---|
| P0 | `achievements` 表 + seed 50 条数据 |
| P0 | `GET /achievements` 接口（含解锁状态） |
| P1 | `user_achievements` 表 + `POST /achievements/{code}/unlock` |
| P1 | 注册时自动解锁 `JH03 东大人认证` |
| P2 | `POST /achievements/check` 批量事件触发 |
| P2 | 解锁成就 +5 积分 |
