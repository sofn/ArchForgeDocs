---
layout: home

hero:
  name: ArchForge
  text: Five-repo enterprise platform
  tagline: Spring Boot 4.1 + Java 25 backend, Vue 3 admin, Next.js C-end, VitePress docs, and contract specs — cloned side by side.
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: 🚀
    title: Spring Boot 4.1 + Java 25
    details: Built on Spring Boot 4.1.0 with Java 25 virtual threads, Liberica NIK Native Image support, and Sa-Token 1.45.0.
  - icon: 🎨
    title: Vue 3 Admin UI
    details: Admin interface based on vue-pure-admin (:8848 → admin API :8080) with Element Plus, Tailwind CSS, and dynamic menu routing.
  - icon: 🔐
    title: Complete RBAC
    details: Role-based access control with Sa-Token (StpAdminUtil / StpWebUtil), @SaCheckLogin, @SaCheckPermission, dynamic menus, and data scopes.
  - icon: 🛡️
    title: API Security
    details: Login rate limit (5/min/IP), XSS sanitization for query/header (skips multipart), HMAC-SHA256 signing, and idempotent tokens.
  - icon: 📊
    title: Server Monitoring
    details: Real-time CPU, memory, JVM, disk monitoring powered by Oshi with auto-refresh dashboards.
  - icon: 🗄️
    title: Multi-Datasource + Flyway
    details: Dynamic datasource routing with read/write splitting. Flyway 12.4.0 for production schema management.
  - icon: 🐳
    title: Docker Native & JVM
    details: Dual deployment modes — Liberica NIK 25 Native Image (~100ms startup) or JVM with Project Leyden CDS. One-command deployment.
  - icon: 📈
    title: Observability
    details: Prometheus + Grafana + Jaeger + Alertmanager out of the box — dashboards, alerts, and OpenTelemetry 1.62.0 traces.
  - title: File Management
    details: Upload, list, download, and delete files from the admin UI. Pluggable local filesystem or S3 (RustFS) backends with extension/size/MIME allow-lists.
  - title: Quartz Scheduling
    details: Reflective cron jobs with pause, resume, run-once, and execution logs, managed from the admin panel.
  - title: i18n
    details: Backend and frontend locale sync with English and Simplified Chinese message bundles out of the box.
  - title: Spring Modulith
    details: Explicit module boundaries, dependency verification, and documentation tests for the domain and infrastructure layers.
  - title: Meta Table
    details: Low-code dynamic table design with schema evolution, CRUD, import/export, and full-stack code generation from the admin panel.
  - title: C-end Web
    details: Next.js consumer-facing app (:3000 → web API :8081) with i18n, Sa-Token via StpWebUtil, articles dashboard, Playwright E2E tests, and Storybook.
---

## Five sibling repositories

ArchForge is **five independent Git repositories**, cloned side by side. There are no git submodules.

| Repository | Role | Local port |
|------------|------|------------|
| **ArchForge** | Backend (Gradle). `archforge-server-admin` + `archforge-server-web` | `:8080` / `:8081` |
| **ArchForgeAdmin** | Admin UI (vue-pure-admin) | `:8848` → `:8080` |
| **ArchForgeWeb** | C-end (Next.js) | `:3000` → `:8081` |
| **ArchForgeDocs** | This VitePress documentation site | `npm run docs:dev` |
| **ArchForgeSpec** | Contracts / architecture / AI context | — |

Developer CLI lives in the backend repo: run `./archforge` from the ArchForge root. See [CLI](/guide/cli).
