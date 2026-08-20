---
layout: home

hero:
  name: ArchForge
  text: 为 AI 时代设计的企业级开发平台
  tagline: 契约先行的五仓架构 · Spring Boot 4.1 + Java 25 · 让 AI Agent 和人共用同一份事实源
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: 契约先行
      link: /zh/guide/contract-first
    - theme: alt
      text: GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: ⚙️
    title: 现代底座
    details: Spring Boot 4.1 + Java 25 虚拟线程。可选 Native Image（约 100ms 启动）。OpenTelemetry 开箱即用。
  - icon: 🧩
    title: 契约先行五仓
    details: Spec 仓拥有 OpenAPI 与枚举。后端、管理端、C 端、文档只消费契约。已删除路径不会复活。
  - icon: 🤖
    title: AI 原生
    details: 每仓内置 AGENTS.md。Spec skills 渐进披露。CLI 可安装 skill 并作为 MCP Server。
---

## 为什么是五个仓库？

ArchForge 由 **五个独立 Git 仓库** 组成，并列克隆，没有 git submodule。Spec 仓是 AI Agent 最先读的项目宪法。

```mermaid
flowchart LR
  Spec["ArchForgeSpec<br/>OpenAPI · 枚举 · skills"]
  Backend["ArchForge<br/>admin :8080 · web :8081"]
  Admin["ArchForgeAdmin<br/>Vue :8848"]
  Web["ArchForgeWeb<br/>Next.js :3000"]
  Docs["ArchForgeDocs<br/>本文档"]
  Spec -->|契约| Backend
  Spec -->|契约| Admin
  Spec -->|契约| Web
  Spec -->|叙事| Docs
  Admin -->|/api → 8080| Backend
  Web -->|8081| Backend
```

| 仓库 | 职责 | 本地端口 |
|------|------|----------|
| **ArchForge** | 后端。`archforge-server-admin` + `archforge-server-web` | `:8080` / `:8081` |
| **ArchForgeAdmin** | 管理端 UI（vue-pure-admin） | `:8848` → `:8080` |
| **ArchForgeWeb** | C 端（Next.js） | `:3000` → `:8081` |
| **ArchForgeDocs** | 本 VitePress 站点 | `npm run docs:dev` |
| **ArchForgeSpec** | 契约 / 架构 / AI 上下文 | — |

先读 [契约先行](/zh/guide/contract-first)，再读 [AI 协作](/zh/guide/ai-workflow)。开发者 CLI 在后端仓：`./archforge`。

## 本地跑起来

```bash
git clone https://github.com/sofn/ArchForge.git
git clone https://github.com/sofn/ArchForgeAdmin.git
git clone https://github.com/sofn/ArchForgeWeb.git
git clone https://github.com/sofn/ArchForgeDocs.git
git clone https://github.com/sofn/ArchForgeSpec.git

cd ArchForge
./archforge init --write
./archforge infra up
FILE_STORAGE_TYPE=local ./gradlew :archforge-server-admin:bootRun
```

默认管理员 `admin / admin123`（`dev` 开验证码）。目前没有公开托管 Demo，请本地或 Docker Compose 启动。
