# What is ArchForge?

ArchForge is a modern enterprise platform split across **five sibling Git repositories**: a Spring Boot 4.1 backend, a Vue 3 admin UI, a Next.js C-end, this VitePress documentation site, and a contracts repo.

## Why ArchForge?

Most open-source admin frameworks in the Java ecosystem are stuck on older stacks — Spring Boot 2.x, Java 8, and Webpack-based frontends. ArchForge takes a different approach: start fresh with the newest stable releases and apply clean architecture from day one.

### Core Highlights

- **Spring Boot 4.1.0 + Java 25** — virtual threads enabled by default for massive concurrency without reactive complexity
- **Sa-Token 1.45.0** — dual login types: `StpAdminUtil` (admin `:8080`) and `StpWebUtil` (web `:8081`); not JWT / Spring Security
- **BellSoft Liberica NIK 25 Native Image** — optional ahead-of-time compilation for ~100ms startup and ~50MB memory footprint
- **Vue 3 + Vite 8** — admin UI at `:8848` proxying to `:8080`
- **Next.js C-end** — consumer site at `:3000` talking to `:8081`
- **Developer CLI** — `./archforge` from the backend repo root
- **Clean Architecture** — domain-driven multi-module Gradle project with `archforge-` prefixes
- **Flyway 12.4.0** — version-controlled schema management
- **Real-time Server Monitoring** — CPU, memory, JVM, and disk metrics via Oshi
- **Dual Docker Deployment** — Native Image or JVM + Leyden CDS
- **File Management** — local filesystem and S3 (RustFS), extension/size/MIME allow-lists
- **Quartz Scheduling** — reflective cron jobs with pause / resume / run-once
- **i18n** — English and Simplified Chinese on backend and frontends
- **Spring Modulith 2.0** — explicit module boundaries and dependency verification

## Five sibling repositories

Clone the five repos **side by side**. There are no git submodules.

```
workspace/
├── ArchForge/          # backend: archforge-server-admin :8080 + archforge-server-web :8081
├── ArchForgeAdmin/     # admin client (vue-pure-admin) — consumes :8080
├── ArchForgeWeb/       # C-end web (Next.js) — consumes :8081
├── ArchForgeDocs/      # this documentation site (VitePress)
└── ArchForgeSpec/      # contracts / architecture / AI context
```

| Repository | Role | How you run it |
|------------|------|----------------|
| [ArchForge](https://github.com/sofn/ArchForge) | Gradle multi-module backend | `./gradlew :archforge-server-admin:bootRun` / `:archforge-server-web:bootRun`, or `./archforge up` |
| [ArchForgeAdmin](https://github.com/sofn/ArchForgeAdmin) | Admin UI | `pnpm dev` → `http://localhost:8848` |
| ArchForgeWeb | C-end UI | `pnpm dev` → `http://localhost:3000` |
| [ArchForgeDocs](https://github.com/sofn/ArchForgeDocs) | Docs | `npm run docs:dev` |
| ArchForgeSpec | OpenAPI / architecture notes | Read-only reference for contracts |

API envelopes differ by app:

- **Admin (`:8080`)** wraps JSON as `{code, message, data}`
- **Web (`:8081`)** uses RFC 9457 `ProblemDetail` for errors

## Comparison with Similar Projects

| Feature | ArchForge | RuoYi | JeecgBoot | AgileBoot |
|---------|----------|-------|-----------|-----------|
| Spring Boot | **4.1.0** | 2.x | 3.x | 3.x |
| Java Version | **25 (Azul Zulu, virtual threads)** | 8 | 8/17 | 17 |
| Build Tool | **Gradle 9.5.1** | Maven | Maven | Maven |
| Auth | **Sa-Token 1.45.0** | Spring Security / JWT | Spring Security / JWT | Spring Security |
| Frontend | **Vue 3 + Vite 8 + Next.js** | Vue 3 + Vite | Vue 3 + Vite | Vue 3 + Vite |
| CSS Framework | **TailwindCSS 4** | Element Plus only | Ant Design Vue | Element Plus |
| Architecture | **Five repos + DDD multi-module** | Monolithic packages | Code generation focused | Layered |
| DB Migration | **Flyway 12.4.0** | Manual SQL | Liquibase (optional) | Manual SQL |
| Native Image | **Yes (Liberica NIK 25)** | No | No | No |
| ORM | **Spring Data JPA + Metamodel** | MyBatis | MyBatis-Plus | MyBatis-Plus |
| Server Monitor | **Oshi (built-in)** | Oshi | Separate module | No |
| Multi-datasource | **dynamic-datasource (master/slave)** | Druid only | Dynamic datasource | Single |
| API Docs | **SpringDoc OpenAPI** | Swagger 2 | Swagger/Knife4j | SpringDoc |

## Who is it for?

- Teams starting new enterprise admin + C-end projects who want a modern stack
- Developers tired of maintaining Spring Boot 2.x / Java 8 / JWT filter-chain codebases
- Organizations that need fast container startup for cloud-native deployments
- Anyone who prefers JPA + Hibernate Static Metamodel over MyBatis for type-safe queries

## Architecture Overview

See [Project Structure](./project-structure.md) for the Gradle module tree, [CLI](./cli.md) for `./archforge`, and [Authentication](../modules/authentication.md) for Sa-Token.
