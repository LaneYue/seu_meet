# linkit

linkit 是一个面向东南大学学生的校内可信社交与共同行动平台 MVP，帮助同学通过同行推荐、搭子需求、校园路线和消息系统，在安全、低压力的环境里认识彼此并共同参与校园行动。

## 核心功能

- 同行推送：打开同行页后进入滑动名片流，支持左滑不喜欢、右滑喜欢、上滑进入详情、下滑跳过。
- 同行主页：保留原信息流首页，可查看快捷入口、今日推荐、热门搭子需求、跨专业交流和推荐路线。
- 路线系统：展示官方校园路线、打卡进度、徽章、同行值和电子吧唧申请入口。
- 消息系统：承接搭子请求、路线小队、认真关系和系统安全提醒。
- 详情页：包含路线详情、聊天详情、同行名片详情等基础结构。

## 技术栈

- React
- TypeScript
- Vite
- React Router
- lucide-react

## 快速开始

```bash
npm install
npm run dev
```

默认开发服务由 Vite 启动。也可以指定端口：

```bash
npm run dev -- --host 127.0.0.1 --port 5174
```

## 验证与构建

```bash
npm run verify
npm run build
```

`npm run test` 当前等价于 `npm run verify`。

## 主要页面

- `/home`：同行滑动推送页
- `/home/feed`：同行主页信息流
- `/home/profile/:profileId`：同行名片详情
- `/partners`：同行广场
- `/routes`：校园路线页
- `/routes/:routeId`：路线详情
- `/chats`：消息页
- `/chats/:chatId`：聊天详情

## 项目结构

```text
doc/          产品与技术文档
pages/        视觉参考页面
src/App.tsx   页面、路由和 Demo 数据
src/styles.css 全局样式与移动端 UI
src/main.tsx  React 入口
```

## 设计与安全边界

- 移动端优先，重点适配 390px 宽度。
- 不保存身份证号。
- 不展示真实姓名、学号、手机号。
- 不实现公开亲密度排行。
- 认真关系频道不参与公开榜单。
- 首次见面和线下同行场景强调校园公共空间与可举报、可拉黑、可结束匹配。

## 当前状态

这是黑客松 MVP Demo，当前数据为前端 mock 数据，重点用于展示产品路径、交互方式和视觉风格。
