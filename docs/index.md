---
layout: home

hero:
  name: ArchForge
  text: An enterprise platform built for the AI era
  tagline: Contract-first five-repo architecture · Spring Boot 4.1 + Java 25 · Humans and AI agents share the same source of truth
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: Contract-first
      link: /guide/contract-first
    - theme: alt
      text: GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: ⚙️
    title: Modern runtime
    details: Spring Boot 4.1 + Java 25 virtual threads. Optional Native Image (~100ms start). OpenTelemetry out of the box.
  - icon: 🧩
    title: Contract-first five repos
    details: Spec owns OpenAPI and enums. Backend, Admin, Web, and Docs consume it. Deleted paths stay deleted.
  - icon: 🤖
    title: AI-native workflow
    details: Every repo has AGENTS.md. Spec skills are progressive disclosure. CLI can install them and speak MCP.
---

## Why five repositories?

ArchForge is **five independent Git repositories**, cloned side by side. There are no git submodules. The Spec repo is the constitution an AI agent reads first.

```mermaid
flowchart LR
  Spec["ArchForgeSpec<br/>OpenAPI · enums · skills"]
  Backend["ArchForge<br/>admin :8080 · web :8081"]
  Admin["ArchForgeAdmin<br/>Vue :8848"]
  Web["ArchForgeWeb<br/>Next.js :3000"]
  Docs["ArchForgeDocs<br/>this site"]
  Spec -->|contract| Backend
  Spec -->|contract| Admin
  Spec -->|contract| Web
  Spec -->|narrative| Docs
  Admin -->|/api → 8080| Backend
  Web -->|8081| Backend
```

| Repository | Role | Local port |
|------------|------|------------|
| **ArchForge** | Backend. `archforge-server-admin` + `archforge-server-web` | `:8080` / `:8081` |
| **ArchForgeAdmin** | Admin UI (vue-pure-admin) | `:8848` → `:8080` |
| **ArchForgeWeb** | C-end (Next.js) | `:3000` → `:8081` |
| **ArchForgeDocs** | This VitePress site | `npm run docs:dev` |
| **ArchForgeSpec** | Contracts / architecture / AI context | — |

Start with [contract-first](/guide/contract-first), then [AI workflow](/guide/ai-workflow). CLI lives in the backend repo: `./archforge`.

## Run it locally

```bash
# siblings, no submodules
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

Admin default login is `admin / admin123` (captcha on in `dev`). There is no hosted public demo yet — run the stack locally or with Docker Compose.
