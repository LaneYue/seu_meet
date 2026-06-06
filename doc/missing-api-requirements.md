# 缺失后端接口需求文档

> 基于前端现有页面和 Mock 数据整理，当前 `frontend/src/services/api.ts` 中以下模块仍使用 Mock 兜底，需补充对应后端接口。

---

## 一、广场模块（Partner / Plaza）

### 背景
前端页面：`PartnerSquarePage`、`PartnerPostPage`  
广场是用户发布「结伴招募帖」的功能，与攻略（付费内容）**业务语义不同**，需独立建表和路由。

---

### 1.1 获取广场帖子列表

**GET** `/api/v1/plaza/posts`

**Query 参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `category` | `string?` | 分类筛选：`study` / `sport` / `life` / `interest`，不传返回全部 |
| `page` | `int` | 默认 1 |
| `pageSize` | `int` | 默认 20，最大 50 |

**响应 data**

```json
{
  "list": [
    {
      "id": "library-night",
      "title": "今晚图书馆自习搭子",
      "category": "study",
      "status": "进行中",
      "time": "今天 19:00-22:00",
      "place": "九龙湖图书馆 · 研习区",
      "joined": 4,
      "total": 6,
      "note": "一起专注学习，互相监督，效率翻倍。",
      "author": {
        "id": "...",
        "nickname": "...",
        "avatar": null
      },
      "createdAt": "2026-06-06T10:00:00"
    }
  ],
  "total": 12,
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

**前端字段映射**（`PartnerPost` 类型）

| 后端字段 | 前端字段 | 备注 |
|---|---|---|
| `category` | → `tone` | `study→green` / `sport→purple` / `life→orange` / `interest→blue` |
| `status` | `status` | 直接使用 |
| `joined` / `total` | `joined` / `total` | 直接使用 |

---

### 1.2 发布广场帖子

**POST** `/api/v1/plaza/posts`  
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

**响应 data**：返回新建的帖子对象（同 1.1 列表项结构）

**业务规则**
- `capacity` 范围 2–20
- 发帖 +1 积分

---

### 1.3 加入 / 申请加入帖子

**POST** `/api/v1/plaza/posts/{post_id}/action`  
需要 JWT 认证。

**请求 body**

```json
{
  "action": "join"
}
```

| 值 | 说明 |
|---|---|
| `join` | 直接加入（status 为"招募中"时可用） |
| `request` | 申请加入（status 为"进行中"时发起申请） |

**响应 data**

```json
{
  "postId": "library-night",
  "action": "join",
  "joined": 5,
  "total": 6
}
```

**业务规则**
- `joined >= total` 时拒绝加入，返回 `code: 10011`
- 不能加入自己发布的帖子

---

## 二、路线模块（Routes）

### 背景
前端页面：`RoutesPage`、`RouteDetailPage`  
路线是官方/用户设计的校园打卡路径，包含多个打卡节点，用户可加入并逐步完成。

---

### 2.1 获取路线列表

**GET** `/api/v1/routes`

**Query 参数**

| 参数 | 类型 | 说明 |
|---|---|---|
| `campus` | `string?` | 按校区筛选：`九龙湖` / `四牌楼` |

**响应 data**

```json
{
  "list": [
    {
      "id": "jiulonghu",
      "title": "九龙湖学习搭子路线",
      "badge": "官方路线",
      "campus": "九龙湖",
      "duration": "约 1 天",
      "difficulty": "轻松",
      "participantCount": 1200,
      "nodeCount": 8,
      "userProgress": 3,
      "coverImage": "https://...",
      "intro": "从图书馆到教学楼，串起一次温和的共同学习行动。",
      "tags": ["自习", "图书馆", "守约"]
    }
  ]
}
```

**前端字段映射**（`CampusRoute` 类型）

| 后端字段 | 前端字段 |
|---|---|
| `participantCount` | `people`（格式化为 "1.2k"）|
| `nodeCount` | `nodes` |
| `userProgress` | `progress`（已完成节点数）|
| `coverImage` | `image` |

---

### 2.2 获取路线详情及步骤

**GET** `/api/v1/routes/{route_id}`

**响应 data**

```json
{
  "id": "jiulonghu",
  "title": "九龙湖学习搭子路线",
  "badge": "官方路线",
  "campus": "九龙湖",
  "duration": "约 1 天",
  "difficulty": "轻松",
  "participantCount": 1200,
  "nodeCount": 8,
  "userProgress": 3,
  "coverImage": "https://...",
  "intro": "...",
  "tags": ["自习", "图书馆", "守约"],
  "steps": [
    {
      "id": "step-001",
      "title": "图书馆入口集合",
      "desc": "在公共空间完成队伍确认，开启路线。",
      "method": "扫码打卡",
      "status": "done"
    },
    {
      "id": "step-002",
      "title": "研习区专注时段",
      "desc": "完成 45 分钟共同学习。",
      "method": "计时打卡",
      "status": "in_progress"
    }
  ]
}
```

`status` 枚举：`done` / `in_progress` / `pending`

---

### 2.3 路线节点打卡

**POST** `/api/v1/routes/{route_id}/checkin`  
需要 JWT 认证。

**请求 body**

```json
{
  "stepId": "step-002"
}
```

**响应 data**

```json
{
  "stepId": "step-002",
  "userProgress": 3,
  "pointsAwarded": 2,
  "balanceAfter": 42
}
```

**业务规则**
- 每个节点只能打卡一次
- 打卡成功 +2 积分
- 完成全部节点 +10 积分并解锁对应徽章

---

### 2.4 获取用户徽章列表

**GET** `/api/v1/routes/badges/me`  
需要 JWT 认证。

**响应 data**

```json
{
  "list": [
    {
      "id": "badge-001",
      "name": "图书馆同行者",
      "level": "已获得",
      "icon": "BookOpen",
      "unlockedAt": "2026-06-01T10:00:00"
    },
    {
      "id": "badge-002",
      "name": "九龙湖探索者",
      "level": "2/3",
      "icon": "Compass",
      "unlockedAt": null
    }
  ]
}
```

`icon` 字段为 Lucide 图标名，前端直接映射。

---

## 三、消息模块补全

### 背景
当前 `GET /api/v1/chat/sessions` 已实现，但前端消息页有**分类筛选**（全部 / 搭子 / 路线 / 关系 / 系统），且缺少**未读数**字段。

---

### 3.1 现有接口增强：`GET /api/v1/chat/sessions`

新增响应字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `unreadCount` | `int` | 该会话未读消息数，默认 0 |
| `sessionType` | `string` | 会话类型：`partner` / `route` / `relationship` / `system` / `normal` |

**示例**

```json
{
  "sessionId": "sess-001",
  "sessionType": "partner",
  "unreadCount": 3,
  "stage": "normal",
  "targetUser": { ... },
  "lastMessage": { ... },
  "updatedAt": "2026-06-06T10:00:00"
}
```

前端分类 tab 的映射：

| 前端 category | 对应 `sessionType` |
|---|---|
| `partners` | `partner` |
| `routes` | `route` |
| `relationship` | `relationship` |
| `system` | `system` |
| `all` | 全部 |

---

### 3.2 标记消息已读

**POST** `/api/v1/chat/sessions/{session_id}/read`  
需要 JWT 认证。

**响应 data**

```json
{ "read": true }
```

触发时机：用户进入聊天详情页时调用。

---

## 四、优先级建议

| 优先级 | 模块 | 原因 |
|---|---|---|
| P0 | 广场帖子列表 + 发帖 | 广场是核心页面，完全依赖 Mock |
| P0 | 路线列表 + 详情 | 路线页同样完全依赖 Mock |
| P1 | 消息未读数 + 分类字段 | 影响消息页 tab 筛选准确性 |
| P1 | 路线打卡 + 徽章 | 积分体系闭环 |
| P2 | 消息已读标记 | 体验优化，非阻塞 |
| P2 | 广场加入/申请 | 二期交互功能 |
