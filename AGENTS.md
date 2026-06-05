# AGENTS.md

## 项目目标

这是一个东南大学校内可信社交与共同行动平台 MVP。

## 启动方式

```bash
npm install
npm run dev
```

## 测试方式

```bash
npm run test
```

或：

```bash
npm run verify
```

## 代码要求

- 使用 TypeScript。
- 所有核心类型放在 `src/types`。
- 所有 mock 数据放在 `src/data/mock`。
- 匹配算法放在 `src/lib/matching`。
- 风控逻辑放在 `src/lib/trust`。
- 徽章逻辑放在 `src/lib/badges`。
- 不要保存身份证号。
- 不要实现公开亲密度排行。
- 不要展示真实姓名、学号、手机号。
- 认真关系频道不参与公开榜单。
- 新功能必须保持 demo 可运行。
