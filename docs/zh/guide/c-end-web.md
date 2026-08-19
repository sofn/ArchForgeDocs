# C 端 Web（ArchForgeWeb）

ArchForgeWeb 是 ArchForge 后端的 C 端（面向终端用户）示例前端，基于 Next.js 构建，展示如何集成 `server-web` 接口，包括国际化、Sa-Token 认证、文章、仪表盘，以及 Playwright E2E 测试与 Storybook 组件文档等开发工具。

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 16.2.12 | React 框架，App Router |
| UI | React | 19.2.8 | 组件库 |
| 语言 | TypeScript | 7.0.2 | 类型安全的 JavaScript |
| 样式 | Tailwind CSS | 4.3.3 | 原子化 CSS |
| 组件 | shadcn/ui + lucide-react | — | 无头 UI 原语与图标 |
| 国际化 | next-intl | 4.13.4 | 英文 / 中文多语言 |
| 认证 | Sa-Token（server-web） | — | C 端 Token 认证 |
| Markdown | react-markdown + remark-gfm + rehype-highlight | — | 文章内容渲染 |
| E2E 测试 | Playwright | 1.61.1 | 端到端测试 |
| 组件文档 | Storybook | 8.6.18 | 可视化组件文档 |
| 构建 | Turborepo + pnpm workspaces | — |  monorepo 编排 |

## 项目结构

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 仪表盘 / 首页
│   │   ├── articles/           # 文章列表与详情
│   │   ├── articles/me/        # 我的文章
│   │   ├── write/              # 写文章
│   │   ├── login/              # 登录页
│   │   ├── profile/            # 个人中心
│   │   ├── change-password/    # 修改密码
│   │   └── notifications/      # 通知中心
│   ├── components/             # React 组件
│   │   ├── Header.tsx          # 顶部导航（桌面端）
│   │   ├── BottomNav.tsx       # 底部导航（移动端）
│   │   ├── ArticleCard.tsx     # 文章卡片
│   │   ├── LocaleSwitcher.tsx  # 语言切换
│   │   ├── Markdown.tsx        # Markdown 渲染
│   │   └── providers/
│   │       └── AuthProvider.tsx # 认证上下文
│   ├── components/ui/          # shadcn/ui 原语
│   └── lib/                    # API 客户端与工具
│       ├── api.ts              # server-web 接口调用
│       └── utils.ts            # cn() 等工具函数
├── messages/
│   ├── en.json                 # 英文翻译
│   └── zh.json                 # 中文翻译
├── i18n/
│   ├── request.ts              # next-intl 请求配置
│   └── routing.ts              # next-intl 路由配置
├── middleware.ts               # next-intl 中间件
├── e2e/                        # Playwright E2E 测试
├── .storybook/                 # Storybook 配置
├── next.config.ts
└── package.json
```

## 功能特性

### 认证

- 使用与 admin 相同的开发账号（如 `admin / admin123`）登录。
- C 端 API 采用 Sa-Token，`token` 与 `tokenName` 存储在 `localStorage`。
- `AuthProvider` 保护需要登录的页面（`/articles/me`、`/write`、`/profile`、`/notifications`、`/change-password`）。
- 未登录访问受保护页面会被重定向到 `/login`。

### 国际化

- 默认语言：**英文（`en`）**。
- 支持语言：`en`、`zh`。
- 翻译文件位于 `apps/web/messages/`。
- `next-intl` 配置为 `localePrefix: 'never'`，URL 不随语言变化。
- 页面顶部语言按钮设置 `NEXT_LOCALE` Cookie 并刷新页面。

### 仪表盘

首页（`/`）展示：

- 基于时间的问候语（早上好/下午好/晚上好）。
- 运营指标：用户总数、当前在线、今日登录、今日操作。
- 快捷入口：文章、写文章、个人中心、通知。
- 最新通知与操作日志。

### 文章

- **公开文章列表**（`/articles`）：支持分类筛选与分页。
- **文章详情**（`/articles/{slug}`）：Markdown 渲染，支持封面图。
- **我的文章**（`/articles/me`）：登录后查看。
- **写文章**（`/write`）：填写标题、摘要、分类、上传封面图、Markdown 正文。

### 个人中心与设置

- `/profile` — 展示当前用户信息。
- `/change-password` — 修改密码（旧密码、新密码、确认密码）。
- `/notifications` — 系统通知列表。

### 响应式布局

- 桌面端：顶部 Header 导航 + 语言切换。
- 移动端：底部 Tab 导航。
- 使用 Tailwind CSS 工具类实现间距与网格自适应。

## API 基础地址

前端连接 `server-web`（默认 `http://localhost:8081`）。

```text
# apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

管理端（`:8080`）成功响应包装为 `{code, message, data}`。C 端（`:8081`）错误使用 RFC 9457 `ProblemDetail`。

## 主要 API 接口

| 接口 | 方法 | 说明 |
|------|------|------|
| `/web/login` | POST | 用户名密码登录 |
| `/web/logout` | POST | 退出登录 |
| `/web/user/profile` | GET | 当前用户信息 |
| `/web/user/change-password` | POST | 修改密码 |
| `/web/user/articles` | GET | 我的文章（分页） |
| `/web/dashboard/metrics` | GET | 仪表盘指标 |
| `/web/notices` | GET | 最新通知 |
| `/web/operation-logs` | GET | 最近操作日志 |
| `/web/categories` | GET | 文章分类 |
| `/web/articles` | GET | 公开文章（分页） |
| `/web/articles/{slug}` | GET | 文章详情 |
| `/web/articles` | POST | 创建文章 |
| `/web/file/upload` | POST | 上传封面图 |

## 可用脚本

```bash
pnpm dev              # 启动 Next.js 开发服务器（端口 3000）
pnpm build            # 生产构建
pnpm start            # 启动生产服务器
pnpm typecheck        # TypeScript 类型检查
pnpm lint             # Next.js 代码检查
pnpm test:e2e         # 运行 Playwright E2E 测试
pnpm test:e2e:ui      # Playwright UI 模式
pnpm test:e2e:debug   # Playwright 调试模式
pnpm storybook        # 启动 Storybook（端口 6006）
pnpm build-storybook  # 构建静态 Storybook
```

## 测试

### Playwright E2E

`e2e/` 目录覆盖核心用户路径：

- `home.spec.ts` — 首页问候语与导航到文章列表。
- `locale.spec.ts` — 中英文切换。
- `articles.spec.ts` — 文章列表与详情页。
- `auth.spec.ts` — 登录、访问受保护页面、登出。

Playwright 配置通过 `webServer` 自动启动 `pnpm dev`，并 targeting Chromium。

### Storybook

为基础 shadcn/ui 组件提供示例：

- `Button`（默认、outline、ghost、尺寸、禁用态）
- `Card`
- `Input`
- `Label`
- `Textarea`

Storybook 使用 `@storybook/react-vite` 框架，并导入全局 `globals.css`。

## 快速开始

1. 配置 API 基础地址：

```bash
cp .env.example .env.local
# 编辑 apps/web/.env.local
```

2. 安装依赖：

```bash
pnpm install
```

3. 启动后端（`server-web` 端口 8081）：

```bash
# 在 ArchForge 仓库中
./gradlew :archforge-server-web:bootRun
```

4. 启动开发服务器：

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 说明

- C 端与管理端是两套 sa-token 登录类型（`StpWebUtil` / `StpAdminUtil`），不是 JWT vs sa-token。
- 文章详情页结合 `next-intl` 与 `react-markdown` 做服务端渲染。
- `next.config.ts` 启用 `experimental.useTypeScriptCli` 以保证与 TypeScript 7 兼容。

## 相关页面

- [技术栈](/zh/guide/tech-stack.md) — 完整技术选型
- [项目结构](/zh/guide/project-structure.md) — monorepo 组织方式
- [认证鉴权](/zh/modules/authentication.md) — Sa-Token（`StpAdminUtil` / `StpWebUtil`）
- [本地开发环境](/zh/guide/local-setup.md) — IDE 与环境配置
