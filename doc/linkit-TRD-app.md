# linkit 前端技术需求文档（TRD-App）

---

## 1. 技术栈与基础设施

### 1.1 技术选型

| 层 | 选型 | 版本 | 用途 |
|----|------|------|------|
| 框架 | Flutter | ≥3.22 | 跨平台 iOS + Android |
| 语言 | Dart | ≥3.5 | — |
| 状态管理 | Riverpod | 2.x | 响应式状态 |
| 路由 | go_router | 14.x | 声明式路由 |
| HTTP | dio | 5.x | REST API 调用 |
| WebSocket | socket_io_client | 2.x | 即时通讯 |
| 安全存储 | flutter_secure_storage | 9.x | Token 加密存储 |
| 本地缓存 | hive | 2.x | 离线数据 |
| 地图 | amap_flutter_map | 3.x | 高德地图（打卡/路线） |
| 图片选择 | image_picker | 1.x | 头像/照片/打卡拍照 |
| 定位 | geolocator | 12.x | GPS 打卡验证 |
| 代码生成 | freezed + json_serializable | — | 不可变模型 + JSON 序列化 |
| Toast | fluttertoast | — | 轻提示 |

### 1.2 目标平台

| 平台 | 最低版本 | 备注 |
|------|----------|------|
| Android | API 26 (Android 8.0) | — |
| iOS | 15.0 | — |

---

## 2. 目录结构

```
app/
├── lib/
│   ├── main.dart                         # 入口
│   ├── app.dart                          # MaterialApp + ProviderScope
│   ├── config/
│   │   ├── app_config.dart               # Base URL / 环境切换
│   │   ├── theme.dart                    # 全局主题
│   │   └── routes.dart                   # GoRouter 路由表
│   ├── core/
│   │   ├── api/
│   │   │   ├── dio_client.dart           # Dio 封装
│   │   │   ├── api_endpoints.dart        # 接口路径常量
│   │   │   ├── api_exception.dart        # 业务异常
│   │   │   └── interceptors/
│   │   │       ├── auth_interceptor.dart  # Token 注入
│   │   │       └── error_interceptor.dart # 全局错误处理
│   │   ├── network/
│   │   │   ├── socket_client.dart        # WebSocket 管理
│   │   │   └── connectivity.dart         # 网络监测
│   │   ├── storage/
│   │   │   ├── secure_storage.dart       # Token 存取
│   │   │   └── cache_manager.dart        # Hive 缓存
│   │   ├── location/
│   │   │   └── location_service.dart     # GPS
│   │   └── utils/
│   │       ├── validators.dart           # 表单校验
│   │       ├── date_utils.dart           # 时间格式化
│   │       ├── error_messages.dart       # 错误码 → 用户提示
│   │       └── image_utils.dart          # 图片压缩
│   ├── data/
│   │   ├── models/                       # freezed 数据模型
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
│   │   ├── repositories/                 # 数据仓库层
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
│   │   └── dto/                           # 请求 DTO
│   │       ├── auth_dto.dart
│   │       ├── guide_dto.dart
│   │       └── ...
│   ├── domain/
│   │   └── enums/
│   │       ├── campus.dart
│   │       ├── guide_category.dart
│   │       ├── match_action.dart
│   │       ├── chat_stage.dart
│   │       └── ...
│   ├── presentation/
│   │   ├── providers/                    # Riverpod
│   │   │   ├── auth_provider.dart
│   │   │   ├── user_provider.dart
│   │   │   ├── guide_provider.dart
│   │   │   ├── match_provider.dart
│   │   │   ├── question_provider.dart
│   │   │   ├── chat_provider.dart
│   │   │   ├── rating_provider.dart
│   │   │   ├── intimacy_provider.dart
│   │   │   ├── checkin_provider.dart
│   │   │   ├── points_provider.dart
│   │   │   └── socket_provider.dart
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── login_page.dart
│   │   │   │   └── register_page.dart
│   │   │   ├── home/
│   │   │   │   └── home_page.dart       # 底部导航 Scaffold
│   │   │   ├── guide/                   # Tab1 - 攻略市场
│   │   │   │   ├── guide_list_page.dart
│   │   │   │   ├── guide_detail_page.dart
│   │   │   │   ├── guide_create_page.dart
│   │   │   │   └── guide_purchased_page.dart
│   │   │   ├── discover/                # Tab2 - 发现
│   │   │   │   └── discover_page.dart
│   │   │   ├── chat/                    # Tab3 - 消息
│   │   │   │   ├── chat_list_page.dart
│   │   │   │   └── chat_detail_page.dart
│   │   │   ├── icebreak/                # 破冰问答
│   │   │   │   ├── icebreak_answer_page.dart
│   │   │   │   └── icebreak_result_page.dart
│   │   │   ├── profile/
│   │   │   │   ├── my_profile_page.dart
│   │   │   │   └── user_profile_page.dart
│   │   │   ├── checkin/
│   │   │   │   └── checkin_page.dart
│   │   │   └── leaderboard/
│   │   │       └── leaderboard_page.dart
│   │   └── widgets/                     # 可复用组件
│   │       ├── match_card.dart          # 滑动卡片（核心组件）
│   │       ├── guide_card.dart          # 攻略卡片
│   │       ├── chat_bubble.dart         # 聊天气泡
│   │       ├── tag_chip.dart            # 标签
│   │       ├── rating_stars.dart        # 五星评分
│   │       ├── credit_badge.dart        # 信用分徽章
│   │       ├── user_avatar.dart         # 统一头像组件
│   │       ├── empty_state.dart         # 空状态
│   │       ├── loading_widget.dart      # 加载中
│   │       └── error_widget.dart        # 错误重试
│   └── l10n/
│       └── app_zh.arb
├── assets/
│   ├── images/
│   │   ├── logo.png
│   │   ├── default_avatar.png
│   │   └── icons/
│   ├── fonts/
│   └── data/
│       └── campus_checkpoints.json      # 预设打卡点
├── test/
├── pubspec.yaml
└── analysis_options.yaml
```

---

## 3. 路由表

```dart
// lib/config/routes.dart

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final isLoggedIn = authState is Authenticated;
      final isAuthRoute = state.matchedLocation == '/login'
                       || state.matchedLocation == '/register';

      if (!isLoggedIn && !isAuthRoute) return '/login';
      if (isLoggedIn && isAuthRoute) return '/guides';
      return null;
    },
    routes: [
      // ── 认证 ──
      GoRoute(path: '/login', builder: (_, __) => const LoginPage()),
      GoRoute(path: '/register', builder: (_, __) => const RegisterPage()),

      // ── 主页（底部导航 Shell） ──
      ShellRoute(
        builder: (_, __, child) => HomePage(child: child),
        routes: [
          GoRoute(path: '/guides', builder: (_, __) => const GuideListPage()),
          GoRoute(path: '/discover', builder: (_, __) => const DiscoverPage()),
          GoRoute(path: '/chats', builder: (_, __) => const ChatListPage()),
        ],
      ),

      // ── 攻略子页面 ──
      GoRoute(path: '/guides/:id', builder: (_, state) =>
          GuideDetailPage(id: state.pathParameters['id']!)),
      GoRoute(path: '/guides/create', builder: (_, __) =>
          const GuideCreatePage()),

      // ── 聊天 ──
      GoRoute(path: '/chats/:sessionId', builder: (_, state) =>
          ChatDetailPage(sessionId: state.pathParameters['sessionId']!)),

      // ── 破冰问答 ──
      GoRoute(path: '/icebreak/:matchId', builder: (_, state) =>
          IcebreakAnswerPage(matchId: state.pathParameters['matchId']!)),
      GoRoute(path: '/icebreak/:matchId/result', builder: (_, state) =>
          IcebreakResultPage(matchId: state.pathParameters['matchId']!)),

      // ── 个人资料 ──
      GoRoute(path: '/profile/me', builder: (_, __) =>
          const MyProfilePage()),
      GoRoute(path: '/profile/:userId', builder: (_, state) =>
          UserProfilePage(userId: state.pathParameters['userId']!)),

      // ── 打卡 & 排行榜 ──
      GoRoute(path: '/checkin', builder: (_, __) => const CheckinPage()),
      GoRoute(path: '/leaderboard/:type', builder: (_, state) =>
          LeaderboardPage(type: state.pathParameters['type']!)),
    ],
  );
});
```

---

## 4. 页面设计与交互流程

> 📐 完整页面设计、交互流程、视觉规范已移至 [design.md](./design.md)

---

## 5. 状态管理设计

### 5.1 认证 Provider

```dart
@freezed
class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated({required User user, required String accessToken}) = _Authenticated;
  const factory AuthState.error({required String message}) = _Error;
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.read(authRepositoryProvider), ref.read(secureStorageProvider));
});
```

### 5.2 匹配 Provider

```dart
@freezed
class MatchState with _$MatchState {
  const factory MatchState({
    @Default([]) List<MatchCard> cards,
    @Default(0) int currentIndex,
    @Default(false) bool isLoading,
    @Default(false) bool hasMore,
    String? error,
    MatchStatus? lastMatchStatus, // 最近一次匹配结果
  }) = _MatchState;
}

final matchProvider = StateNotifierProvider<MatchNotifier, MatchState>((ref) { ... });

class MatchNotifier extends StateNotifier<MatchState> {
  Future<void> loadDiscoverCards() async { ... }   // GET /match/discover
  Future<MatchResult?> swipe(MatchAction action) async { ... }  // POST /match/:id/action

  // 本地滑动不调 API，累积到一定量或离开页面时批量提交
  void onSwipeLeft()  { state.currentIndex++; }  // 本地
  void onSwipeRight() { swipe(MatchAction.RIGHT); state.currentIndex++; }
  void onSwipeUp()    { swipe(MatchAction.SUPER); state.currentIndex++; }
}
```

### 5.3 聊天 Provider

```dart
final chatProvider = StateNotifierProvider<ChatNotifier, ChatState>((ref) {
  return ChatNotifier(
    ref.read(chatRepositoryProvider),
    ref.read(socketProvider),
  );
});

class ChatNotifier extends StateNotifier<ChatState> {
  void onSocketMessage(SocketMessage msg) {
    switch (msg.event) {
      case 'chat:message':
        _appendMessage(msg.sessionId, msg.message);
      case 'chat:upgrade':
        _updateStage(msg.sessionId, msg.stage);
      case 'icebreak:ready':
        // 跳转到结果页
      case 'icebreak:result':
        _onIceBreakResult(msg);
    }
  }
}
```

### 5.4 Socket Provider

```dart
final socketProvider = Provider<SocketClient>((ref) {
  final client = SocketClient(ref.read(appConfigProvider).wsBaseUrl);
  ref.onDispose(() => client.dispose());
  return client;
});
```

---

## 6. 数据模型（示例）

```dart
// lib/data/models/user.dart

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
    DateTime? createdAt,
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
    required String major,
    required String grade,
    required String campus,
    String? bio,
    required List<String> tags,
    required List<String> photos,
    double? height,
    String? mbti,
    String? hometown,
    List<String>? interests,
    required List<String> commonTags,
    required int commonTagsCount,
    required int creditScore,
  }) = _MatchCard;

  factory MatchCard.fromJson(Map<String, dynamic> json) => _$MatchCardFromJson(json);
}
```

---

## 7. 缓存与离线策略

| 数据 | 方式 | TTL | 说明 |
|------|------|-----|------|
| access token | flutter_secure_storage | — | 加密存储，启动时读取 |
| 用户信息 | hive | 7天 | 离线可展示自己的资料 |
| 攻略列表 | dio_cache | 5min | 减少重复请求 |
| 匹配卡片 | 不缓存 | — | 每次拉最新 |
| 聊天历史 | hive | 永久 | 已加载会话不重复请求 |
| 打卡点 | assets JSON | 静态 | 打包在 app 内 |
| 排行榜 | dio_cache | 10min | 非实时数据 |

---

## 8. 错误处理

```dart
// lib/core/utils/error_messages.dart

String userFacingMessage(int code) => switch (code) {
  10001 => '请检查输入信息',
  10002 => '登录已过期，请重新登录',
  10003 => '暂无权限',
  10005 => '操作重复，请勿重复操作',
  10010 => '信用分不足',
  10011 => '积分不足，去签到获取积分吧',
  10012 => '操作太频繁，请稍后再试',
  10020 => '请在校园网环境下注册',
  10021 => '学号或身份信息有误',
  10030 => '回答已超时，匹配已失效',
  10031 => '对方还在答题中，请等待',
  10040 => '请先完成破冰问答',
  _    => '网络出错了，请稍后重试',
};

// Repository 层统一处理模式:
// 1. 先读缓存
// 2. 缓存过期 → API 请求
// 3. 成功 → 更新缓存 + 返回
// 4. 失败 → 返回缓存旧数据（如果有）
// 5. 无缓存 + 失败 → throw ApiException
```

---

## 9. 性能要求

| 指标 | 目标 |
|------|------|
| 冷启动 | < 2s |
| 攻略列表首屏 | < 500ms |
| 匹配卡片加载(20张) | < 800ms |
| 消息发送 | < 200ms (WS) |
| GPS 获取 | < 3s |
| 图片上传(5MB) | < 5s |
| 空闲内存 | < 80MB |
| 崩溃率 | < 0.5% |

---

## 10. 安全要求

| 要求 | 实现 |
|------|------|
| Token 安全 | flutter_secure_storage (Keychain / KeyStore 加密) |
| 敏感信息不落地 | 真实姓名、身份证号不缓存 |
| HTTPS | 生产强制 + SSL Pinning |
| 聊天内存清理 | 离开 ChatDetailPage → dispose 消息列表 |
| 截屏提示 | 可选：查看他人资料时检测截屏并警告 |
| 发布混淆 | `flutter build --obfuscate --split-debug-info` |

