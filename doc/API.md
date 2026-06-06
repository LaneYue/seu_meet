# IFLand 后端 API 文档

> Base URL: `http://localhost:3100/api/v1`  
> Swagger UI: `http://localhost:3100/api/docs`

---

## 1. 约定

### 1.1 认证

除 `register` / `login` 外，所有接口需带 token：

```
Authorization: Bearer <access_token>
```

### 1.2 响应信封

```json
{ "code": 0, "message": "ok", "data": {} }
```

| 字段 | 类型 | 说明 |
|------|------|------|
| code | number | 0=成功，非0=错误 |
| message | string | 人类可读消息 |
| data | object/array/null | 业务载荷 |

### 1.3 分页

请求：`?page=1&pageSize=20`  
响应：

```json
{
  "list": [],
  "total": 256,
  "page": 1,
  "pageSize": 20,
  "hasMore": true
}
```

### 1.4 错误码

| code | 含义 |
|------|------|
| 0 | 成功 |
| 10001 | 参数校验失败 |
| 10002 | 未登录 / Token 过期 |
| 10003 | 无权限 |
| 10004 | 资源不存在 |
| 10005 | 资源冲突（重复操作） |
| 10010 | 信用分不足 |
| 10011 | 积分不足 |
| 10020 | 校园网验证失败 |
| 10021 | 认证信息不匹配 |
| 10030 | 匹配已超时 |
| 10031 | 破冰尚未就绪 |
| 10040 | 聊天未解锁 |
| 10999 | 服务器内部错误 |

---

## 2. 认证 `POST /api/v1/auth`

### 2.1 注册

```
POST /api/v1/auth/register
```

**Request Body:**

```json
{
  "studentId": "213200001",
  "realName": "张三",
  "idCardLast6": "123456",
  "password": "123456",
  "nickname": "三三",
  "college": "信息科学与工程学院",
  "major": "信息工程",
  "grade": "2024",
  "campus": "jiulonghu",
  "gender": "male"
}
```

| 字段 | 规则 |
|------|------|
| studentId | 9位数字 |
| realName | 2~10字 |
| idCardLast6 | 6位数字 |
| password | 6~32字符 |
| nickname | 2~12字符，唯一 |
| campus | jiulonghu / sipailou / dingjiaqiao |
| gender | male / female / other |

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
      "campus": "jiulonghu",
      "gender": "male",
      "bio": null,
      "tags": [],
      "creditScore": 70,
      "points": 0,
      "status": "active",
      "createdAt": "2026-06-06T10:00:00"
    },
    "token": {
      "accessToken": "eyJhbG...",
      "expiresIn": 86400
    }
  }
}
```

| 错误码 | 场景 |
|--------|------|
| 10005 | 学号已注册 / 昵称已被占用 |

---

### 2.2 登录

```
POST /api/v1/auth/login
```

**Request Body:**

```json
{
  "studentId": "213200001",
  "password": "123456"
}
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "user": { "id": "...", "nickname": "三三", "..." : "..." },
    "token": {
      "accessToken": "eyJhbG...",
      "expiresIn": 86400
    }
  }
}
```

| 错误码 | 场景 |
|--------|------|
| 10004 | 学号未注册 |
| 10021 | 密码错误 |

---

## 3. 用户 `GET/PUT /api/v1/users`

### 3.1 我的信息

```
GET /api/v1/users/me
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "nickname": "三三",
    "avatar": null,
    "college": "信息科学与工程学院",
    "major": "信息工程",
    "grade": "2024",
    "campus": "jiulonghu",
    "gender": "male",
    "bio": null,
    "tags": [],
    "creditScore": 70,
    "points": 0,
    "status": "active",
    "createdAt": "2026-06-06T10:00:00"
  }
}
```

> **安全：** `realName` 和 `idCardLast6` 不返回。

---

### 3.2 更新资料

```
PUT /api/v1/users/me
```

**Request Body:**

```json
{
  "nickname": "三三_new",
  "avatar": "https://example.com/avatar.jpg",
  "bio": "更新后的签名",
  "gender": "male"
}
```

> 所有字段可选，传什么更新什么。

---

### 3.3 我的详细资料

```
GET /api/v1/users/me/profile
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "photos": [],
    "height": null,
    "mbti": null,
    "hometown": null,
    "interests": []
  }
}
```

---

### 3.4 更新详细资料

```
PUT /api/v1/users/me/profile
```

**Request Body:** (任意字段可选)

```json
{
  "photos": ["url1", "url2"],
  "height": 175,
  "mbti": "INTJ",
  "hometown": "江苏南京",
  "interests": ["跑步", "摄影", "编程"]
}
```

---

### 3.5 更新标签

```
PUT /api/v1/users/me/tags
```

**Request Body:**

```json
{
  "tags": ["自习", "跑步", "王者荣耀", "摄影"]
}
```

> 全量替换，最多 20 个。

---

### 3.6 查看用户卡片（发现页用）

```
GET /api/v1/users/{userId}/card
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "nickname": "思思",
    "avatar": "url",
    "college": "建筑学院",
    "major": "建筑学",
    "grade": "2023",
    "campus": "sipailou",
    "bio": "画图之余想找人一起喝咖啡",
    "tags": ["咖啡", "摄影", "CityWalk"],
    "commonTags": ["摄影"],
    "commonTagsCount": 1,
    "creditScore": 92
  }
}
```

> `commonTags` = 当前用户和目标用户标签的交集。

---

### 3.7 查看他人完整资料

```
GET /api/v1/users/{userId}/profile
```

> 需要已解锁聊天（双方存在 ChatSession 记录）。否则返回 10003。

**Response 同 3.1。**

---

## 4. 攻略市场 `GET/POST /api/v1/guides`

### 4.1 攻略列表

```
GET /api/v1/guides
```

**Query Parameters:**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| category | string | — | date / food / study / outing / cross_campus / activity / other |
| tags | string | — | 逗号分隔，如 `散步,美食` |
| sort | string | popular | popular(销量) / new(最新) / rating(评分) |
| search | string | — | 标题模糊搜索 |
| page | number | 1 | 页码 |
| pageSize | number | 20 | 每页条数 |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "uuid",
        "title": "九龙湖情侣限定一日游",
        "coverImage": "url",
        "category": "date",
        "tags": ["散步", "美食", "图书馆"],
        "price": 5,
        "sales": 128,
        "avgRating": 4.6,
        "author": {
          "id": "uuid",
          "nickname": "攻略达人",
          "avatar": "url"
        },
        "createdAt": "2026-06-01T08:00:00"
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

### 4.2 攻略详情

```
GET /api/v1/guides/{guideId}
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "id": "uuid",
    "title": "九龙湖情侣限定一日游",
    "description": "从李文正图书馆出发，先一起看一小时书...",
    "category": "date",
    "coverImage": "url",
    "images": ["url1", "url2"],
    "route": {
      "points": [
        { "lat": 31.8912, "lng": 118.8118, "name": "李文正图书馆", "desc": "起点", "stayMin": 60 }
      ]
    },
    "budget": 50,
    "suitableFor": "couple",
    "tags": ["散步", "美食"],
    "price": 5,
    "sales": 128,
    "avgRating": 4.6,
    "author": { "id": "uuid", "nickname": "攻略达人", "avatar": "url" },
    "purchased": false,
    "canRefund": false,
    "createdAt": "2026-06-01T08:00:00"
  }
}
```

> `purchased` = 当前用户是否已购买。  
> 未购买且 price > 0 时，`description` 仅返回前 1/3，末尾追加 `[购买后查看完整内容...]`。

---

### 4.3 发布攻略

```
POST /api/v1/guides
```

**Request Body:**

```json
{
  "title": "九龙湖情侣限定一日游",
  "description": "从图书馆出发...（需至少10字）",
  "category": "date",
  "coverImage": "url",
  "images": ["url1", "url2"],
  "route": {
    "points": [
      { "lat": 31.8912, "lng": 118.8118, "name": "图书馆", "desc": "起点", "stayMin": 60 },
      { "lat": 31.8935, "lng": 118.8150, "name": "橘园食堂", "desc": "午饭" }
    ]
  },
  "budget": 50,
  "suitableFor": "couple",
  "tags": ["散步", "美食"],
  "price": 5
}
```

| 字段 | 约束 |
|------|------|
| title | 2~40 字 |
| description | 10~2000 字 |
| category | date / food / study / outing / cross_campus / activity / other |
| route.points | 2~20 个点 |
| route.points[].lat | 31.0~32.5 (南京纬度) |
| route.points[].lng | 118.0~119.5 (南京经度) |
| route.points[].name | 2~30 字 |
| budget | 0~10000 |
| suitableFor | solo / couple / group / any |
| tags | 最多 5 个 |
| price | 0~50 积分 |

**发布成功额外奖励：作者积分 +3。**

---

### 4.4 编辑攻略

```
PUT /api/v1/guides/{guideId}
```

> 仅作者可编辑。所有字段可选，传什么更新什么。

---

### 4.5 购买攻略

```
POST /api/v1/guides/{guideId}/purchase
```

**Request Body:** 无（从 Token 获取身份）

| 错误码 | 场景 |
|--------|------|
| 10005 | 已购买过 |
| 10011 | 积分不足 |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "purchaseId": "uuid",
    "guideId": "uuid",
    "price": 5,
    "balanceAfter": 115
  }
}
```

> 购买积分流向：购买者 -price，作者 +price，销量 +1。

---

### 4.6 退款

```
POST /api/v1/guides/{guideId}/refund
```

> 退款后积分退回，销量 -1（最小为 0）。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "refunded": true,
    "balanceAfter": 120
  }
}
```

---

## 5. 匹配发现 `GET/POST /api/v1/match`

### 5.1 推荐卡片

```
GET /api/v1/match/discover?count=20
```

**推荐算法：**

```
排除池:
  ├── 自己
  ├── 30天内已操作过的
  ├── 已匹配的
  ├── 同性
  └── 信用分 < 70

排序:
  commonTags × 3 + 不同校区 × 2 + 随机扰动
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "cards": [
      {
        "id": "uuid",
        "nickname": "思思",
        "avatar": "url",
        "college": "建筑学院",
        "grade": "2023",
        "campus": "sipailou",
        "bio": "画图之余想找人一起喝咖啡",
        "tags": ["咖啡", "摄影", "CityWalk"],
        "commonTags": ["摄影"]
      }
    ],
    "remaining": 20
  }
}
```

---

### 5.2 匹配动作

```
POST /api/v1/match/{targetId}/action
```

**Request Body:**

```json
{ "action": "right" }
```

| action | 含义 | 附加消耗 |
|--------|------|----------|
| left | 不感兴趣，跳过 | — |
| right | 感兴趣 | — |
| super | 超级喜欢 | 5 积分 |

**普通响应 (未匹配):**

```json
{
  "code": 0,
  "data": {
    "matched": false,
    "action": "right"
  }
}
```

**双向匹配成功响应:**

```json
{
  "code": 0,
  "data": {
    "matched": true,
    "matchId": "uuid",
    "sessionId": "uuid",
    "needIceBreak": true,
    "targetUser": {
      "id": "uuid",
      "nickname": "思思",
      "avatar": "url",
      "college": "建筑学院"
    }
  }
}
```

> 双向匹配 → 自动创建 ChatSession (stage=ice_breaking)，双方进入破冰阶段。

| 错误码 | 场景 |
|--------|------|
| 10001 | 对自己操作 |
| 10004 | 目标用户不存在 |
| 10005 | 已对该用户操作过 |
| 10011 | super 积分不足 |

---

### 5.3 我的匹配列表

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
        "matchId": "uuid",
        "status": "matched",
        "targetUser": { "id": "uuid", "nickname": "思思", "avatar": "url" },
        "matchedAt": "2026-06-06T11:30:00"
      }
    ]
  }
}
```

---

## 6. 破冰问答 `GET/POST /api/v1/questions`

### 6.1 获取破冰问题

```
GET /api/v1/questions/icebreak/{matchId}
```

> 从问题池随机抽取 3 题（确保不同类别）。匹配状态必须为 `matched`。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "matchId": "uuid",
    "questions": [
      { "id": "q1", "category": "values", "content": "你认为大学里最重要的是什么？" },
      { "id": "q2", "category": "lifestyle", "content": "周末通常会怎么度过？" },
      { "id": "q3", "category": "seu", "content": "你在东大最喜欢的一个角落是哪里？" }
    ]
  }
}
```

| 错误码 | 场景 |
|--------|------|
| 10030 | 匹配不存在或已失效 |

---

### 6.2 提交答案

```
POST /api/v1/questions/icebreak/{matchId}/answer
```

**Request Body:**

```json
{
  "answers": [
    { "questionId": "q1", "content": "我认为是找到自己真正热爱的事并为之努力。" },
    { "questionId": "q2", "content": "一般去图书馆看书，偶尔和朋友探店。" },
    { "questionId": "q3", "content": "李文正图书馆三楼靠窗的位置。" }
  ]
}
```

| 字段 | 约束 |
|------|------|
| answers | 恰好 3 条 |
| answers[].content | 10~500 字 |

> 每个匹配每人只能提交一次，不可修改。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "ok": true,
    "submitted": true,
    "otherSubmitted": false
  }
}
```

> `otherSubmitted` = 对方是否也已提交。

---

### 6.3 查看答案对比

```
GET /api/v1/questions/icebreak/{matchId}/result
```

> 双方都提交后才能访问。

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "matchId": "uuid",
    "myNickname": "三三",
    "otherNickname": "思思",
    "comparisons": [
      {
        "question": { "id": "q1", "category": "values", "content": "你认为大学里最重要的是什么？" },
        "myAnswer": "找到自己真正热爱的事",
        "otherAnswer": "建立持久友谊和找到方向"
      }
    ],
    "canRate": true
  }
}
```

| 错误码 | 场景 |
|--------|------|
| 10031 | 答案尚未准备就绪（一方未答完） |

---

### 6.4 评分

```
POST /api/v1/questions/icebreak/{matchId}/rate
```

**Request Body:**

```json
{ "score": 4 }
```

| 字段 | 约束 |
|------|------|
| score | 1~5 整数 |

**破冰判定逻辑：**

```
双方都评分后 →
  ├── 双方 ≥ 3 分 → 解锁聊天 (stage = ice_breaking)
  ├── 双方 ≥ 4 分 → 解锁 + "灵魂共鸣" badge (后续扩展)
  └── 任一方 < 3 → 匹配解除 (status = rejected)
```

**Response — 等待对方 (200):**

```json
{
  "code": 0,
  "data": {
    "stage": "WAITING_OTHER_RATE",
    "message": "等待对方评分"
  }
}
```

**Response — 破冰成功 (200):**

```json
{
  "code": 0,
  "data": {
    "stage": "UNLOCKED",
    "result": "MATCH",
    "sessionId": "uuid",
    "message": "破冰成功！你们可以开始聊天了"
  }
}
```

**Response — 破冰失败 (200):**

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

## 7. 聊天 `GET/POST /api/v1/chat`

### 7.1 会话列表

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
        "sessionId": "uuid",
        "stage": "ice_breaking",
        "targetUser": {
          "id": "uuid",
          "nickname": "思思",
          "avatar": "url",
          "college": "建筑学院"
        },
        "lastMessage": {
          "content": "明天图书馆见！",
          "type": "text",
          "createdAt": "2026-06-06T14:20:00"
        },
        "updatedAt": "2026-06-06T14:20:00"
      }
    ]
  }
}
```

---

### 7.2 历史消息

```
GET /api/v1/chat/sessions/{sessionId}/messages?before=&limit=30
```

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| before | string | — | ISO 时间戳，获取此时间之前的消息 |
| limit | number | 30 | 每页条数 |

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "list": [
      {
        "id": "msg-uuid",
        "type": "text",
        "content": "好的，明天图书馆见！",
        "senderId": "uuid",
        "isMe": false,
        "createdAt": "2026-06-06T14:20:00",
        "readAt": null
      }
    ],
    "hasMore": false
  }
}
```

> 消息按时间正序返回。  
> `isMe` = `senderId === 当前用户 id`。

---

### 7.3 发送消息 (REST)

```
POST /api/v1/chat/sessions/{sessionId}/messages
```

**Request Body:**

```json
{
  "type": "text",
  "content": "好呀，几点方便？"
}
```

| 字段 | 说明 |
|------|------|
| type | text (默认) / image / voice / location |
| content | 消息内容 |

| 错误码 | 场景 |
|--------|------|
| 10004 | 会话不存在 |
| 10003 | 无权限 |
| 10040 | 聊天未解锁 |

---

### 7.4 WebSocket 事件

```
连接地址: ws://localhost:3100
Auth: { token: "<access_token>" }
```

| 方向 | 事件名 | Payload | 说明 |
|------|--------|---------|------|
| C→S | `chat:join` | `{sessionId}` | 加入聊天房间 |
| C→S | `chat:message` | `{sessionId, type, content}` | 发送消息 |
| C→S | `chat:typing` | `{sessionId}` | 正在输入 |
| C→S | `chat:read` | `{sessionId, messageId}` | 标记已读 |
| S→C | `chat:message` | `{sessionId, message}` | 收到新消息 |
| S→C | `chat:typing` | `{sessionId, userId}` | 对方正在输入 |
| S→C | `chat:read` | `{sessionId, messageId, userId}` | 消息已被对方阅读 |

---

## 8. 积分 `GET/POST /api/v1/points`

### 8.1 积分余额

```
GET /api/v1/points/balance
```

**Response (200):**

```json
{
  "code": 0,
  "data": { "balance": 120 }
}
```

---

### 8.2 积分流水

```
GET /api/v1/points/transactions
```

> Demo 阶段返回空列表，后续扩展。

---

### 8.3 每日签到

```
POST /api/v1/points/checkin
```

**Response (200):**

```json
{
  "code": 0,
  "data": {
    "amount": 5,
    "balance": 125
  }
}
```

---

## 9. 健康检查

```
GET /api/health
```

**Response (200):**

```json
{ "status": "ok", "version": "1.0.0" }
```

---

## 10. 测试账号（种子数据）

| 学号 | 昵称 | 密码 | 说明 |
|------|------|------|------|
| 213200001 | 三三 | 123456 | 信息学院，男，九龙湖 |
| 213200002 | 思思 | 123456 | 建筑学院，女，四牌楼 |
| 213200003 | 大刘 | 123456 | 土木工程，男，九龙湖 |
| 213200004 | 小雪 | 123456 | 外国语学院，女，九龙湖 |
| 213200005 | 阿杰 | 123456 | 计算机科学，男，九龙湖 |
| ... | ... | 123456 | 总计 20 个用户 |

种子攻略 5 篇，破冰问题 20 道。
