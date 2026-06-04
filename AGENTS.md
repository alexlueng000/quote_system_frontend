# AGENTS.md — Acme SaaS

> Codex 启动时自动读取。写得越具体，Codex 输出质量越高。

---

## 1. 仓库结构


/
├── src/
│   ├── app/           # Next.js App Router（路由 + 页面）
│   ├── components/    # 共享 UI 组件
│   ├── lib/           # 工具函数、API 客户端、类型定义
│   ├── server/        # Server Actions、数据库查询
│   └── styles/        # 全局样式
├── prisma/            # Schema + 迁移文件
├── tests/
│   ├── unit/          # Vitest 单元测试
│   └── e2e/           # Playwright E2E 测试
├── docs/              # 项目文档
└── public/            # 静态资源


**关键规则**：
- `src/app/` 只放路由和页面，不要放业务逻辑
- 业务逻辑放 `src/server/`，通过 Server Actions 调用
- 组件放 `src/components/`，按功能分文件夹

---

## 2. 运行项目

bash
# 安装依赖（用 pnpm，不要用 npm 或 yarn）
pnpm install

# 启动开发服务器（http://localhost:3000）
pnpm dev

# 初始化数据库（首次运行）
pnpm db:setup    # 等价于：prisma generate + prisma db push + prisma db seed


**前置条件**：
- Node.js 22+
- PostgreSQL 16+（本地或 Docker）
- `.env` 文件已配置 `DATABASE_URL`

---

## 3. 构建 / 测试 / Lint

bash
pnpm build       # next build
pnpm test        # vitest run
pnpm test:e2e    # playwright test
pnpm lint        # eslint . --ext .ts,.tsx
pnpm typecheck   # tsc --noEmit


**CI 通过的硬性标准**：`pnpm lint && pnpm typecheck && pnpm test && pnpm build` 全部通过。

---

## 4. 工程约定

### 命名
- 变量 / 函数：`camelCase`
- React 组件：`PascalCase`
- 数据库字段：`snake_case`（Prisma 自动映射到 camelCase）
- 文件名：`kebab-case`（如 `user-settings.tsx`）

### TypeScript
- 禁止 `any`，用 `unknown` + 类型守卫
- 数据库查询返回值必须显式类型标注
- 导出的函数必须有返回类型

### Git
- 分支：`feature/xxx`、`fix/xxx`、`chore/xxx`
- Commit：遵循 Conventional Commits（`feat:` `fix:` `chore:`）
- PR 标题用中文描述实际改动，不要写 "fix bug"

### PR 要求
- 改动超过 200 行拆成多个 PR
- 新增接口必须有单元测试
- 数据库迁移单独一个 PR，不和业务逻辑混在一起
- PR 描述写清楚：改了什么、为什么改、怎么验证

---

## 5. 约束 & 禁止项

- **禁止**直接改 `prisma/schema.prisma` 后不生成迁移文件，必须跑 `pnpm db:migrate`
- **禁止**在组件里直接调 Prisma，必须通过 Server Actions 或 API Route
- **禁止**引入新的 npm 包不经过讨论（特别是体积 > 50KB 的包）
- **禁止**修改 `.env` 文件的内容，只能参考它的格式
- **禁止**删除或修改 `docs/` 下的任何文件
- **禁止**用 `console.log` 调试，用 `logger.info` / `logger.error`（已封装在 `src/lib/logger.ts`）

---

## 6. 完成标准 & 验证方式

### 什么叫"完成了"
- 代码通过所有 lint / typecheck / test / build
- 新功能有对应的单元测试（覆盖核心逻辑）
- 数据库变更附带迁移文件 + 回滚说明
- PR 描述完整，reviewer 不需要额外问"这是什么"

### 验证命令
bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build


### Codex 自检流程（改动后必须跑）
1. `pnpm lint` — 风格检查
2. `pnpm typecheck` — 类型检查
3. `pnpm test` — 单元测试
4. `pnpm build` — 确认能构建成功
5. 检查 diff：确认只改了该改的文件

