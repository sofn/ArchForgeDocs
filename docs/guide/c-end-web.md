# C-end Web (ArchForgeWeb)

ArchForgeWeb is the consumer-facing demo frontend for the ArchForge backend. It demonstrates how a modern Next.js application can integrate with the `server-web` APIs, including i18n, Sa-Token authentication, articles, dashboards, and developer tooling such as Playwright and Storybook.

## Tech Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| Framework | Next.js | 16.2.12 | React framework with App Router |
| UI | React | 19.2.8 | Component library |
| Language | TypeScript | 7.0.2 | Type-safe JavaScript |
| Styling | Tailwind CSS | 4.3.3 | Utility-first CSS |
| Components | shadcn/ui + lucide-react | — | Headless UI primitives and icons |
| i18n | next-intl | 4.13.4 | English / Chinese localization |
| Auth | Sa-Token (server-web) | — | Token-based C-end authentication |
| Markdown | react-markdown + remark-gfm + rehype-highlight | — | Article content rendering |
| E2E Tests | Playwright | 1.61.1 | End-to-end testing |
| Component Docs | Storybook | 8.6.18 | Visual component documentation |
| Build | Turborepo + pnpm workspaces | — | Monorepo orchestration |

## Project Structure

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Dashboard / home
│   │   ├── articles/           # Article list and detail
│   │   ├── articles/me/        # My articles
│   │   ├── write/              # Create article
│   │   ├── login/              # Login page
│   │   ├── profile/            # User profile
│   │   ├── change-password/    # Change password
│   │   └── notifications/      # Notifications
│   ├── components/             # React components
│   │   ├── Header.tsx          # Top navigation (desktop)
│   │   ├── BottomNav.tsx       # Bottom navigation (mobile)
│   │   ├── ArticleCard.tsx     # Article list card
│   │   ├── LocaleSwitcher.tsx  # Language switcher
│   │   ├── Markdown.tsx        # Markdown renderer
│   │   └── providers/
│   │       └── AuthProvider.tsx # Auth context provider
│   ├── components/ui/          # shadcn/ui primitives
│   └── lib/                    # API client and utilities
│       ├── api.ts              # server-web API calls
│       └── utils.ts            # cn() and helpers
├── messages/
│   ├── en.json                 # English translations
│   └── zh.json                 # Chinese translations
├── i18n/
│   ├── request.ts              # next-intl request config
│   └── routing.ts              # next-intl routing config
├── middleware.ts               # next-intl middleware
├── e2e/                        # Playwright E2E tests
├── .storybook/                 # Storybook configuration
├── next.config.ts
└── package.json
```

## Features

### Authentication

- Login with the same admin/dev credentials (`admin / admin123` in dev).
- Sa-Token session stored in `localStorage` (`token`, `tokenName`) for C-end APIs.
- Auth provider guards protected routes (`/articles/me`, `/write`, `/profile`, `/notifications`, `/change-password`).
- Unauthenticated visits to protected pages are redirected to `/login`.

### Internationalization

- Default locale: **English (`en`)**.
- Supported locales: `en`, `zh`.
- Translations live in `apps/web/messages/`.
- `next-intl` is configured with `localePrefix: 'never'`, so URLs stay the same across languages.
- The language button in the header sets a `NEXT_LOCALE` cookie and refreshes the page.

### Dashboard

The home page (`/`) shows:

- Time-based greeting (`Good morning/afternoon/evening`).
- Operation metrics: user total, online now, today login, today operation.
- Quick links: articles, write, profile, notifications.
- Latest notices and operation logs.

### Articles

- **Public article list** (`/articles`) with category filter and pagination.
- **Article detail** (`/articles/{slug}`) with Markdown rendering and cover image.
- **My articles** (`/articles/me`) for logged-in users.
- **Write article** (`/write`) with title, summary, category, cover image upload, and Markdown content.

### Profile & Settings

- `/profile` — display current user info.
- `/change-password` — change password with old/new/confirm fields.
- `/notifications` — list system notices.

### Responsive Layout

- Desktop: top header with navigation and language switcher.
- Mobile: bottom tab navigation.
- Tailwind CSS utility classes adapt spacing and grids.

## API Base

The frontend talks to `server-web` (default `http://localhost:8081`).

```text
# apps/web/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

All API responses follow the standard format:

```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

## Main API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/web/login` | POST | Login with username/password |
| `/web/logout` | POST | Logout current session |
| `/web/user/profile` | GET | Get current user profile |
| `/web/user/change-password` | POST | Change password |
| `/web/user/articles` | GET | My articles (paginated) |
| `/web/dashboard/metrics` | GET | Dashboard metrics |
| `/web/notices` | GET | Latest notices |
| `/web/operation-logs` | GET | Recent operation logs |
| `/web/categories` | GET | Article categories |
| `/web/articles` | GET | Public articles (paginated) |
| `/web/articles/{slug}` | GET | Article detail |
| `/web/articles` | POST | Create article |
| `/web/file/upload` | POST | Upload cover image |

## Available Scripts

```bash
pnpm dev              # Start Next.js dev server (port 3000)
pnpm build            # Production build
pnpm start            # Start production server
pnpm typecheck        # TypeScript type checking
pnpm lint             # Next.js lint
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Run Playwright in UI mode
pnpm test:e2e:debug   # Run Playwright in debug mode
pnpm storybook        # Start Storybook dev server (port 6006)
pnpm build-storybook  # Build static Storybook
```

## Testing

### Playwright E2E

The `e2e/` directory covers the core user paths:

- `home.spec.ts` — dashboard greeting and navigation to articles.
- `locale.spec.ts` — switching between English and Chinese.
- `articles.spec.ts` — article list and detail pages.
- `auth.spec.ts` — login, access protected page, logout.

Playwright config starts `pnpm dev` automatically via `webServer` and targets Chromium.

### Storybook

Stories are provided for base shadcn/ui components:

- `Button` (default, outline, ghost, sizes, disabled)
- `Card`
- `Input`
- `Label`
- `Textarea`

Storybook is configured with `@storybook/react-vite` and imports the global `globals.css`.

## Quick Start

1. Configure the API base:

```bash
cp .env.example .env.local
# Edit apps/web/.env.local
```

2. Install dependencies:

```bash
pnpm install
```

3. Start the backend (`server-web` on port 8081):

```bash
# In the ArchForge repo
./gradlew :server-web:bootRun
```

4. Start the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Notes

- C-end and admin are **two sa-token login types** (`StpWebUtil` vs `StpAdminUtil`), not JWT vs sa-token.
- Article detail pages are server-rendered with `next-intl` and `react-markdown`.
- `next.config.ts` enables `experimental.useTypeScriptCli` for TypeScript 7 compatibility.

## Related Pages

- [Tech Stack](./tech-stack.md) — full technology choices
- [Project Structure](./project-structure.md) — how the monorepo is organized
- [Authentication](../modules/authentication.md) — admin sa-token authentication details
- [Local Setup](./local-setup.md) — IDE and environment setup
