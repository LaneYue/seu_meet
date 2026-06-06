# linkit 前端路演版 TRD（比赛快速开发）

> 目标：~10 天可 Demo。Web 优先，桌面模拟手机，手机直接使用。AI 友好。

---

## 1. 技术栈

| 层 | 选型 | 理由 |
|----|------|------|
| 脚手架 | **Vite** | 秒级 HMR，零配置起步 |
| UI 框架 | **React 18** | 生态最大，AI 生成质量最高 |
| 样式 | **Tailwind CSS** | 原子化，不用写 CSS 文件 |
| 组件库 | **MUI (Material UI)** | 开箱即用的 Mobile 友好组件 |
| 路由 | **React Router v6** | 标配 |
| HTTP | **fetch + 薄封装** | 不引入 axios，减少依赖 |
| WebSocket | **socket.io-client** | 对接后端 Socket.IO |
| 状态管理 | **React Context + useReducer** | 不引入 Redux/Zustand |
| 图标 | **MUI Icons** | 随 MUI 自带 |

> **砍掉:** axios → fetch / TanStack Query → useState+useEffect / Redux → Context / 任何需要代码生成的库

---

## 2. 双端适配方案

### 桌面端（演示 / 开发）

```
┌──────────────────────────────────────────┐
│                                          │
│          ┌─────────────────┐             │
│          │                 │             │
│          │   iPhone 15     │             │  ← 375×812 手机框
│          │   Pro 模拟器    │             │
│          │                 │             │
│          │  ┌───────────┐  │             │
│          │  │ App Header│  │             │
│          │  │           │  │             │
│          │  │  内容区    │  │             │
│          │  │           │  │             │
│          │  │ 底部Tab    │  │             │
│          │  └───────────┘  │             │
│          └─────────────────┘             │
│                                          │
│          扫描二维码在手机上体验           │
└──────────────────────────────────────────┘

实现: max-w-[375px] mx-auto h-screen overflow-hidden border-8 border-gray-800 rounded-[40px]
背景: #667eea → #764ba2 渐变装饰
```

### 移动端

```
手机浏览器打开 → 全屏，max-w 移除，正常响应式。
检测: window.innerWidth ≤ 768 → 全屏模式（不显示手机框）
      window.innerWidth > 768  → 手机框模拟模式
```

### 实现核心

```tsx
// App.tsx
function AppShell({ children }: { children: React.ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return <div className="h-dvh w-full overflow-hidden flex flex-col">{children}</div>;
  }

  // Desktop: phone frame
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center p-4">
      <div className="w-[375px] h-[812px] max-h-[95vh] border-[8px] border-gray-900 rounded-[40px] overflow-hidden shadow-2xl bg-white flex flex-col">
        {children}
      </div>
    </div>
  );
}
```

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
│   ├── main.tsx                        # ReactDOM.createRoot
│   ├── App.tsx                         # AppShell + Router
│   ├── index.css                       # Tailwind 指令
│   ├── config/
│   │   └── api.ts                      # API_BASE, WS_BASE, 环境切换
│   ├── lib/
│   │   ├── api.ts                      # fetch 封装 (get/post)
│   │   ├── socket.ts                   # Socket.IO 客户端单例
│   │   ├── auth.ts                     # Token 存取 + AuthContext
│   │   └── types.ts                    # 共享 TS 类型
│   ├── components/
│   │   ├── PhoneFrame.tsx              # 桌面手机框壳
│   │   ├── BottomNav.tsx               # 底部3Tab导航
│   │   ├── MatchCard.tsx               # 可拖拽卡片
│   │   ├── GuideCard.tsx               # 攻略卡片
│   │   ├── ChatBubble.tsx              # 聊天气泡
│   │   ├── RatingStars.tsx             # 五星评分
│   │   ├── TagChip.tsx                 # 标签
│   │   ├── CreditBadge.tsx             # 信用分徽章
│   │   ├── UserAvatar.tsx              # 头像
│   │   ├── EmptyState.tsx              # 空状态
│   │   └── MatchDialog.tsx             # 匹配成功弹窗
│   ├── pages/
│   │   ├── LoginPage.tsx               # /login
│   │   ├── RegisterPage.tsx            # /register
│   │   ├── GuideListPage.tsx           # /guides (Tab1)
│   │   ├── GuideDetailPage.tsx         # /guides/:id
│   │   ├── GuideCreatePage.tsx         # /guides/create
│   │   ├── DiscoverPage.tsx            # /discover (Tab2)
│   │   ├── ChatListPage.tsx            # /chats (Tab3)
│   │   ├── ChatDetailPage.tsx          # /chats/:sessionId
│   │   ├── IcebreakAnswerPage.tsx      # /icebreak/:matchId
│   │   ├── IcebreakResultPage.tsx      # /icebreak/:matchId/result
│   │   ├── MyProfilePage.tsx           # /profile/me
│   │   ├── UserProfilePage.tsx         # /profile/:userId
│   │   └── LeaderboardPage.tsx         # /leaderboard
│   └── hooks/
│       ├── useApi.ts                   # API 调用 hook
│       ├── useSocket.ts               # Socket 事件 hook
│       ├── useAuth.ts                  # 认证 hook
│       └── useMediaQuery.ts            # 响应式检测
```

---

## 4. 路由设计

```tsx
// App.tsx
<BrowserRouter>
  <AppShell>
    <Routes>
      {/* 认证 - 全屏，无底部Tab */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 主页 - 有底部Tab */}
      <Route element={<BottomNavLayout />}>
        <Route path="/guides" element={<GuideListPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/chats" element={<ChatListPage />} />
      </Route>

      {/* 子页面 - 有返回箭头，无底部Tab */}
      <Route path="/guides/:id" element={<GuideDetailPage />} />
      <Route path="/guides/create" element={<GuideCreatePage />} />
      <Route path="/chats/:sessionId" element={<ChatDetailPage />} />
      <Route path="/icebreak/:matchId" element={<IcebreakAnswerPage />} />
      <Route path="/icebreak/:matchId/result" element={<IcebreakResultPage />} />
      <Route path="/profile/me" element={<MyProfilePage />} />
      <Route path="/profile/:userId" element={<UserProfilePage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />

      <Route path="*" element={<Navigate to="/guides" />} />
    </Routes>
  </AppShell>
</BrowserRouter>
```

### BottomNavLayout

```tsx
function BottomNavLayout() {
  const pathname = useLocation().pathname;

  return (
    <>
      <Outlet />           {/* 子路由内容 */}
      <BottomNavigation
        value={pathname}
        tabs={[
          { path: '/guides', label: '攻略', icon: <ExploreIcon /> },
          { path: '/discover', label: '发现', icon: <FavoriteIcon /> },
          { path: '/chats', label: '消息', icon: <ChatIcon />, badge: unreadCount },
        ]}
      />
    </>
  );
}
```

> 桌面端：底部导航 + 顶部 AppBar 都限制在 `w-[375px]` 内。
> 移动端：`w-full` 自适应。

---

## 5. 核心 API 封装（薄到极致）

```tsx
// src/lib/api.ts

const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api/v1';

export async function get<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  if (json.code !== 0) throw json;
  return json.data;
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw await res.json();
  const json = await res.json();
  if (json.code !== 0) throw json;
  return json.data;
}
```

> 只有 `get` 和 `post`。路由需求更复杂时再追加 `put`/`delete`。

---

## 6. 每个页面定型

### 6.0 底部导航

```
┌─────────────────────────────────────────┐
│  📍攻略市场  │  💘发现  │  💬消息     │
│  (路线攻略)  │ (滑动匹配) │ (问答聊天)  │
└─────────────────────────────────────────┘

MUI <BottomNavigation> + <BottomNavigationAction>
固定底部，3 个 Tab。
桌面端: w-[375px]；移动端: w-full。
```

---

### 6.1 登录页 `POST /auth/login`

```tsx
// MUI: Card + TextField + Button
<Card sx={{ maxWidth: 360, mx: 'auto', mt: 8, p: 3 }}>
  <Typography variant="h5" align="center">linkit 校内交友</Typography>
  <TextField label="学号" fullWidth margin="normal" ... />
  <TextField label="密码" type="password" fullWidth margin="normal" ... />
  <Button variant="contained" fullWidth onClick={handleLogin}>登录</Button>
  <Link to="/register">还没有账号？去注册</Link>
</Card>

// 登录成功 → navigate('/guides')
// 登录失败 → Snackbar alert("学号或密码错误")
```

---

### 6.2 注册页 `POST /auth/register`

```tsx
// MUI: FormControl + TextField + Select + Chip + Button
<Box sx={{ maxWidth: 360, mx: 'auto', p: 2 }}>
  <Typography variant="h6">注册</Typography>

  <TextField label="学号" fullWidth ... />
  <TextField label="真实姓名" fullWidth ... />
  <TextField label="身份证后6位" fullWidth ... />
  <TextField label="密码" type="password" fullWidth ... />
  <TextField label="昵称" fullWidth ... />

  <FormControl fullWidth>
    <InputLabel>学院</InputLabel>
    <Select label="学院" value={college}>
      // 东南大学学院列表
    </Select>
  </FormControl>

  <TextField label="专业" fullWidth ... />

  <FormControl fullWidth>
    <InputLabel>年级</InputLabel>
    <Select label="年级">2020-2029</Select>
  </FormControl>

  <FormControl fullWidth>
    <InputLabel>校区</InputLabel>
    <Select label="校区">
      九龙湖 / 四牌楼 / 丁家桥
    </Select>
  </FormControl>

  <ToggleButtonGroup value={gender}> {/* 男/女/其他 */}

  <Button variant="contained" fullWidth onClick={handleRegister}>注册</Button>
</Box>

// 注册成功 → navigate('/guides')
```

---

### 6.3 攻略列表 (Tab1) `GET /guides`

```tsx
{/* MUI: AppBar + Tabs + List + Card + Fab */}
<Box>
  {/* 顶部 AppBar */}
  <AppBar position="static">
    <Toolbar>
      <Typography>linkit</Typography>
      <Chip label="💰120积分" /> {/* 点击跳签到 */}
    </Toolbar>
    <Tabs value={category}>
      <Tab label="全部" />
      <Tab label="约会" />
      <Tab label="美食" />
      <Tab label="自习" />
      <Tab label="周边" />
    </Tabs>
  </AppBar>

  {/* 列表 */}
  {guides.map(g => (
    <Card key={g.id} onClick={() => navigate(`/guides/${g.id}`)}>
      <CardMedia image={g.coverImage} sx={{ height: 140 }} />
      <CardContent>
        <Typography variant="h6">{g.title}</Typography>
        <Typography variant="body2" color="text.secondary">
          作者: {g.author.nickname}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <Chip icon={<Star />} label={g.avgRating} size="small" />
          <Chip label={`${g.sales}人购买`} size="small" variant="outlined" />
          <Chip label={`${g.price}积分`} size="small" color="primary" />
        </Box>
      </CardContent>
    </Card>
  ))}

  {/* 发布按钮 */}
  <Fab color="primary" onClick={() => navigate('/guides/create')}>
    <AddIcon />
  </Fab>
</Box>
```

---

### 6.4 攻略详情 `GET /guides/:id`

```tsx
{/* 已购买 → 完整内容；未购买 → 截断+模糊+底部购买按钮 */}
<Box sx={{ pb: 8 }}>
  <CardMedia image={guide.coverImage} sx={{ height: 200 }} />
  <Typography variant="h5">{guide.title}</Typography>
  <Typography variant="body2">作者: {guide.author.nickname}</Typography>

  {/* 路线时间线 */}
  <Stepper activeStep={-1} orientation="vertical">
    {guide.route.points.map((p, i) => (
      <Step key={i}>
        <StepLabel>{p.name} — {p.desc} ({p.stayMin}分钟)</StepLabel>
      </Step>
    ))}
  </Stepper>

  {/* 内容区 */}
  {purchased ? (
    <Typography>{guide.description}</Typography>
  ) : (
    <Box sx={{ filter: 'blur(4px)', userSelect: 'none', maxHeight: 200, overflow: 'hidden' }}>
      <Typography>{guide.description}</Typography>
    </Box>
  )}
</Box>

{/* 底部操作栏 - fixed */}
<Paper sx={{ position: 'fixed', bottom: 0, width: '100%', p: 2 }} elevation={3}>
  {purchased ? (
    <Chip label="已购买" color="success" />
  ) : (
    <Button variant="contained" fullWidth onClick={handlePurchase}>
      💰{guide.price}积分 购买
    </Button>
  )}
</Paper>
```

---

### 6.5 发布攻略 `POST /guides`

```tsx
{/* 表单页，字段同后端接口 */}
<Box sx={{ p: 2 }}>
  <TextField label="标题" fullWidth ... />
  <FormControl fullWidth>
    <InputLabel>分类</InputLabel>
    <Select>date/food/study/outing</Select>
  </FormControl>
  <TextField label="封面图URL" fullWidth helperText="Demo阶段填图片链接" />
  <TextField label="详细说明" fullWidth multiline rows={6} ... />

  {/* 路线点 */}
  <Typography variant="subtitle1">路线点 {">"}</Typography>
  {points.map((p, i) => (
    <Box key={i} sx={{ display: 'flex', gap: 1 }}>
      <TextField label="地点名" size="small" />
      <TextField label="纬度" size="small" type="number" />
      <TextField label="经度" size="small" type="number" />
      <TextField label="描述" size="small" />
      <IconButton onClick={() => removePoint(i)}><DeleteIcon /></IconButton>
    </Box>
  ))}
  <Button onClick={addPoint}>+ 添加路线点</Button>

  <TextField label="人均预算(元)" type="number" ... />

  <FormControl fullWidth>
    <InputLabel>适合</InputLabel>
    <Select>solo/couple/group/any</Select>
  </FormControl>

  <Autocomplete
    multiple freeSolo
    options={tagSuggestions}
    renderTags={(tags) => tags.map(t => <Chip label={t} />)}
    renderInput={(params) => <TextField {...params} label="标签" />}
  />

  <TextField label="定价(积分)" type="number" inputProps={{ min: 0, max: 50 }} ... />

  <Button variant="contained" fullWidth onClick={handleCreate}>发布</Button>
</Box>
```

---

### 6.6 滑动发现 (Tab2) `GET /match/discover` + `POST /match/:id/action`

```tsx
{/* 核心交互。使用 framer-motion 做拖拽手势，或直接用 CSS transform + touch events */}
<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
  {cards.length > 0 && (
    <AnimatePresence>
      {/* 卡片堆叠效果: 背后显示2张缩小卡片 */}
      {[2, 1, 0].map((offset) => {
        const card = cards[currentIndex + offset];
        if (!card) return null;
        return (
          <motion.div
            key={card.id}
            style={{ position: 'absolute', zIndex: 10 - offset }}
            initial={{ scale: 1 - offset * 0.05 }}
            animate={{ scale: 1 - offset * 0.05 }}
            drag={offset === 0 ? 'x' : false}
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x > 100) onSwipe('right');
              else if (info.offset.x < -100) onSwipe('left');
            }}
          >
            <Card sx={{ width: 300, height: 420, borderRadius: 4 }}>
              <CardMedia image={card.photos?.[0]} sx={{ height: 280 }} />
              <CardContent>
                <Typography variant="h6">{card.nickname} · {card.grade}</Typography>
                <Typography variant="body2">{card.college}</Typography>
                <Typography variant="body2" color="text.secondary">"{card.bio}"</Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {card.tags?.map(t => (
                    <Chip
                      key={t}
                      label={t}
                      size="small"
                      color={card.commonTags?.includes(t) ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </AnimatePresence>
  )}

  {/* 底部操作按钮 */}
  <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
    <IconButton onClick={() => onSwipe('left')} color="error">
      <CloseIcon fontSize="large" />
    </IconButton>
    <IconButton onClick={() => onSwipe('super')} color="warning">
      <StarIcon fontSize="large" />
    </IconButton>
    <IconButton onClick={() => onSwipe('right')} color="success">
      <FavoriteIcon fontSize="large" />
    </IconButton>
  </Box>
</Box>

{/* 匹配成功弹窗 */}
<Dialog open={showMatch} onClose={...}>
  <DialogTitle>🎉 你们互相喜欢！</DialogTitle>
  <DialogContent>
    <Typography>你和{matchedUser.nickname}匹配成功</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowMatch(false)}>稍后</Button>
    <Button variant="contained" onClick={() => navigate(`/icebreak/${matchId}`)}>立即答题</Button>
  </DialogActions>
</Dialog>
```

---

### 6.7 会话列表 (Tab3) `GET /chat/sessions`

```tsx
<List>
  {sessions.map(s => (
    <React.Fragment key={s.sessionId}>
      {/* 系统消息（破冰提醒） */}
      {s.iceBreakStatus === 'WAITING_ANSWERS' && (
        <Alert severity="info" action={<Button size="small">去答题</Button>}>
          🔔 你和{s.targetUser.nickname}匹配成功，快去完成破冰问答！还剩{s.iceBreakDeadline}
        </Alert>
      )}

      {/* 聊天会话 */}
      <ListItemButton onClick={() => navigate(`/chats/${s.sessionId}`)}>
        <ListItemAvatar>
          <Badge badgeContent={s.unreadCount} color="error">
            <Avatar src={s.targetUser.avatar} />
          </Badge>
        </ListItemAvatar>
        <ListItemText
          primary={s.targetUser.nickname}
          secondary={s.lastMessage?.content}
        />
        <Typography variant="caption" color="text.secondary">
          {formatTime(s.lastMessage?.createdAt)}
        </Typography>
      </ListItemButton>
      <Divider />
    </React.Fragment>
  ))}

  {sessions.length === 0 && (
    <EmptyState message="还没有消息，去发现页认识新朋友吧" action="去发现" />
  )}
</List>
```

---

### 6.8 聊天详情 `GET /chat/sessions/:id/messages` + WebSocket

```tsx
{/* 顶部 */}
<AppBar position="static">
  <Toolbar>
    <IconButton onClick={() => navigate(-1)}><ArrowBackIcon /></IconButton>
    <Avatar src={target.avatar} />
    <Typography>{target.nickname}</Typography>
    <Chip label={`亲密度 ${intimacy}`} size="small" />
    {/* 阶段提示 */}
    <Chip label={stage === 'ICE_BREAKING' ? '破冰期 - 仅文字' : '正式聊天'} size="small" color="info" />
  </Toolbar>
</AppBar>

{/* 消息列表 */}
<Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
  {messages.map(msg => (
    <ChatBubble
      key={msg.id}
      isMe={msg.senderId === currentUser.id}
      content={msg.content}
      type={msg.type}
      time={msg.createdAt}
      read={msg.readAt}
    />
  ))}
</Box>

{/* 输入栏 */}
<Paper sx={{ p: 1, display: 'flex', gap: 1 }}>
  <TextField
    fullWidth
    size="small"
    placeholder="输入消息..."
    value={input}
    onChange={e => setInput(e.target.value)}
    onKeyDown={e => e.key === 'Enter' && sendMessage()}
    disabled={stage !== 'ICE_BREAKING' && stage !== 'NORMAL' && stage !== 'INTIMATE'}
  />
  <IconButton onClick={sendMessage}><SendIcon /></IconButton>
</Paper>

{/* Socket 集成 */}
useEffect(() => {
  socket.emit('chat:join', { sessionId });
  socket.on('chat:message', (data) => {
    setMessages(prev => [...prev, data.message]);
  });
  return () => { socket.off('chat:message'); };
}, [sessionId]);
```

---

### 6.9 破冰答题 `GET /questions/icebreak/:matchId` + `POST answer`

```tsx
{/* 分步答题，或一页3题 */}
<Box sx={{ p: 2 }}>
  <Typography variant="h6">和 {targetName} 的破冰问答</Typography>
  <Typography variant="body2" color="text.secondary">认真回答，让对方更了解你</Typography>

  <Stepper activeStep={currentStep} sx={{ my: 2 }}>
    <Step /><Step /><Step />
  </Stepper>

  {/* 当前题目 */}
  <Paper sx={{ p: 3, my: 2 }}>
    <Typography variant="subtitle1" gutterBottom>
      Q: {questions[currentStep]?.content}
    </Typography>
    <TextField
      fullWidth multiline rows={4}
      placeholder="在这里写下你的答案..."
      value={answers[currentStep]}
      onChange={e => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = e.target.value;
        setAnswers(newAnswers);
      }}
    />
  </Paper>

  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <Button disabled={currentStep === 0} onClick={() => setStep(s => s - 1)}>上一题</Button>
    {currentStep < 2 ? (
      <Button variant="contained" onClick={() => setStep(s => s + 1)}>下一题</Button>
    ) : (
      <Button variant="contained" color="success" onClick={handleSubmit}>
        提交，不可修改
      </Button>
    )}
  </Box>

  {submitted && (
    <Alert severity="info">答案已提交，等待对方完成答题...</Alert>
  )}
</Box>
```

---

### 6.10 破冰结果 `GET /questions/icebreak/:matchId/result` + `POST rate`

```tsx
<Box sx={{ p: 2 }}>
  <Typography variant="h6">查看彼此的答案</Typography>

  {comparisons.map((c, i) => (
    <Paper key={i} sx={{ p: 2, my: 2 }}>
      <Typography variant="subtitle1" fontWeight="bold">Q: {c.question.content}</Typography>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ bgcolor: 'primary.50', p: 1.5, borderRadius: 1, mb: 1 }}>
        <Typography variant="caption" color="text.secondary">你的答案</Typography>
        <Typography>{c.myAnswer}</Typography>
      </Box>
      <Box sx={{ bgcolor: 'pink.50', p: 1.5, borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">{otherName}的答案</Typography>
        <Typography>{c.otherAnswer}</Typography>
      </Box>
    </Paper>
  ))}

  <Typography variant="subtitle1" align="center" sx={{ mt: 3 }}>
    给 {otherName} 打分
  </Typography>
  <RatingStars value={score} onChange={setScore} />

  <Button variant="contained" fullWidth disabled={!score} onClick={handleRate} sx={{ mt: 2 }}>
    提交评分
  </Button>
</Box>
```

---

### 6.11 我的资料 `GET/PUT /users/me`

```tsx
{/* 编辑模式：点击编辑按钮 → 全屏编辑弹窗 */}
<Box sx={{ p: 2 }}>
  {/* 头像区 */}
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
    <Avatar src={user.avatar} sx={{ width: 100, height: 100, mb: 1 }} />
    <Typography variant="h5">{user.nickname}</Typography>
    <Typography variant="body2">{user.college} · {user.major} · {user.grade}级</Typography>
    <CreditBadge score={user.creditScore} />
  </Box>

  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
    "{user.bio || '这个人很懒，什么都没写...'}"
  </Typography>

  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
    {user.tags?.map(t => <TagChip key={t} label={t} />)}
  </Box>

  {/* 详细资料卡片 */}
  <Card>
    <CardContent>
      <Typography variant="subtitle1">详细资料</Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}><Typography variant="body2">身高: {profile.height}cm</Typography></Grid>
        <Grid item xs={6}><Typography variant="body2">MBTI: {profile.mbti}</Typography></Grid>
        <Grid item xs={12}><Typography variant="body2">家乡: {profile.hometown}</Typography></Grid>
        <Grid item xs={12}>
          <Typography variant="body2">兴趣: {profile.interests?.join(' · ')}</Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>

  {/* 照片展示 */}
  <Box sx={{ mt: 2 }}>
    <Typography variant="subtitle1">照片</Typography>
    <ImageList cols={3} gap={8}>
      {profile.photos?.map(p => (
        <ImageListItem key={p}><img src={p} /></ImageListItem>
      ))}
    </ImageList>
  </Box>

  {/* 编辑按钮 */}
  <Button variant="outlined" fullWidth sx={{ mt: 3 }} onClick={() => setEditing(true)}>
    编辑资料
  </Button>
</Box>
```

---

### 6.12 排行榜 `GET /leaderboard/:type`

```tsx
<Box>
  <Tabs value={type} onChange={(_, v) => setType(v)}>
    <Tab label="CP甜蜜" value="cp" />
    <Tab label="搭子" value="buddy" />
    <Tab label="攻略" value="guide" />
    <Tab label="破冰" value="icebreak" />
  </Tabs>

  <List>
    {entries.map((entry, i) => (
      <ListItem key={i}>
        <ListItemIcon>
          <Typography variant="h5">
            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
          </Typography>
        </ListItemIcon>
        <ListItemAvatar>
          {type === 'cp' ? (
            <AvatarGroup>
              <Avatar src={entry.users[0].avatar} />
              <Avatar src={entry.users[1].avatar} />
            </AvatarGroup>
          ) : (
            <Avatar src={entry.user?.avatar} />
          )}
        </ListItemAvatar>
        <ListItemText
          primary={type === 'cp' ? `${entry.users[0].nickname} & ${entry.users[1].nickname}` : entry.user?.nickname}
        />
        <Chip label={`${entry.score}分`} color="primary" />
      </ListItem>
    ))}
  </List>
</Box>
```

---

## 7. 状态管理（Context 极简方案）

```tsx
// src/lib/auth.ts
const AuthContext = createContext<{
  user: User | null;
  token: string | null;
  login: (sid: string, pw: string) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => void;
} | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getToken());

  // 应用启动时读取 localStorage 中的 token，有效性由 API 校验
  // 每个页面自己管数据状态（useState + useEffect），不搞全局 store
  // AuthContext 只管 token + user 缓存

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

> **原则：** AuthContext 只管认证信息。各页面的数据（攻略列表、匹配卡片、聊天消息）各自 `useState` + `useEffect` 管理。不过度抽象。

---

## 8. 核心组件规格

| 组件 | Props | 说明 |
|------|-------|------|
| `PhoneFrame` | `children` | 桌面端手机框壳，375×812，移动端透传 |
| `BottomNav` | `value, onChange, badge?` | 3 个 Tab 底部导航 |
| `MatchCard` | `card, onSwipe` | 可拖拽滑动卡片，framer-motion 实现 |
| `GuideCard` | `guide, onClick` | 攻略列表卡片 |
| `ChatBubble` | `isMe, content, type, time, read` | 聊天气泡 |
| `RatingStars` | `value, onChange` | 1-5 星评分交互 |
| `TagChip` | `label, highlight?` | 标签 |
| `CreditBadge` | `score` | 信用分数值 → 颜色映射 |
| `UserAvatar` | `src, size` | 头像 + 默认头像 fallback |
| `EmptyState` | `message, action?` | 空数据展示 |
| `MatchDialog` | `open, user, onAnswer, onLater` | 匹配成功弹窗 |

---

## 9. 依赖清单 (package.json)

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

> 总共 13 个依赖。React 生态极简起步。

---

## 10. 开发顺序（10 天计划）

| 天 | 任务 | 产出的页面/组件 |
|----|------|-----------------|
| **Day 1** | Vite + React + Tailwind + MUI 初始化，**PhoneFrame** 桌面壳，Router 骨架，3Tab 空壳 | AppShell, BottomNav, 能切换 3 个空 Tab |
| **Day 2** | 登录 + 注册页 + API 封装 | LoginPage, RegisterPage, useAuth |
| **Day 3** | Tab1 攻略列表 + 详情 + 发布 (3页) | GuideListPage, GuideDetailPage, GuideCreatePage, GuideCard |
| **Day 4** | Tab2 滑动发现页（核心） | DiscoverPage, MatchCard (含 framer-motion 拖拽) |
| **Day 5** | 破冰答题 + 结果 + 评分 (2页) | IcebreakAnswerPage, IcebreakResultPage, RatingStars |
| **Day 6** | Tab3 会话列表 + 聊天详情 + Socket 集成 | ChatListPage, ChatDetailPage, ChatBubble |
| **Day 7** | 个人资料 + 他人资料 + 编辑 (2页) | MyProfilePage, UserProfilePage |
| **Day 8** | 排行榜 + 积分签到 + 空状态 + 所有 Loading | LeaderboardPage, EmptyState |
| **Day 9-10** | 联调 + Bug 修复 + 动画打磨 + 桌面手机框美化 | 完整可演示 |

---

## 11. 双端开发联调

```bash
# 开发时
pnpm dev          # Vite dev server → localhost:5173
# 后端代理
# vite.config.ts → proxy /api → localhost:3000

# 手机测试
# 1. 查本机局域网 IP: ip addr show | grep 192.168
# 2. 手机同 WiFi 下访问: http://192.168.x.x:5173
# 3. 自动使用移动端全屏模式

# 生产打包
pnpm build        # → dist/ 静态文件，可直接部署到 Nginx
```

