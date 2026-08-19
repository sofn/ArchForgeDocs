# Project Structure

ArchForge is **five independent Git repositories** cloned side by side. The backend itself is a domain-driven, multi-module Gradle build. Every Gradle module name is prefixed with `archforge-`.

## Five sibling repositories

```
workspace/
├── ArchForge/          # backend (this Gradle build)
├── ArchForgeAdmin/     # admin UI (vue-pure-admin) :8848 → :8080
├── ArchForgeWeb/       # C-end UI (Next.js) :3000 → :8081
├── ArchForgeDocs/      # VitePress documentation
└── ArchForgeSpec/      # contracts / architecture / AI context
```

There are no git submodules. Contracts live in ArchForgeSpec; this Docs repo only describes them.

## Backend (ArchForge)

```
ArchForge/
├── archforge                         # CLI launcher (`./archforge`)
├── archforge-cli/                    # picocli developer CLI (independent of Spring)
├── archforge-common/                 # Shared libraries
│   ├── archforge-common-base/        # Core utilities
│   │   └── src/main/java/
│   │       ├── enums/               # BasicEnum, DictionaryEnum
│   │       ├── utils/               # Encryption, IP, Jackson, i18n utilities
│   │       ├── sensitive/           # @Sensitive data masking
│   │       └── validation/          # Validation annotations
│   ├── archforge-common-error/       # Error handling
│   │   └── src/main/java/
│   │       ├── ErrorCode.java
│   │       ├── ErrorInfo.java       # {code, message}
│   │       └── BizException.java
│   └── archforge-common-jpa/         # JPA infrastructure
│       └── src/main/java/
│           ├── repository/          # BaseEntity, JPA converters
│           ├── utils/query/         # QueryHelp, SafeExpr, AliasExpr
│           └── annotation/          # @Query
│
├── archforge-infrastructure/         # Cross-cutting concerns
│   └── src/main/java/
│       ├── annotation/              # @Log, @RepeatSubmit, @RateLimit
│       ├── auth/                    # Sa-Token: StpAdminUtil, StpWebUtil, LoginContext
│       ├── config/                  # ArchForgeProperties, Swagger, I18n
│       ├── file/                    # FileStorageService, adaptive local/S3 storage
│       ├── web/                     # XssFilter (query/header; skips multipart)
│       ├── frame/
│       │   ├── context/             # RequestContext, RequestIDGenerator
│       │   ├── filters/             # RequestLogFilter
│       │   ├── response/            # ResultValueWrapper, ErrorExceptionHandle
│       │   └── interceptor/         # RepeatSubmitInterceptor
│       └── user/                    # BaseLoginUser, UserProvider SPI
│
├── archforge-domain/                 # Business logic modules
│   ├── archforge-admin-user/         # User / role / menu / dept
│   ├── archforge-blog/               # Blog bounded context
│   └── archforge-meta-table/         # Metadata table / codegen
│
├── archforge-server-admin/           # Admin API entry point (:8080)
│   └── src/main/
│       ├── java/
│       │   ├── .../Application.java
│       │   └── controller/          # Login, file, quartz, monitor, system CRUD
│       └── resources/
│           ├── application.yaml
│           ├── application-dev.yaml
│           ├── application-test.yaml
│           ├── application-prod.yaml
│           ├── db/migration/        # Flyway scripts
│           └── log4j2-spring.xml
│
├── archforge-server-web/             # C-end API entry point (:8081)
│
├── archforge-example/
│   └── archforge-example-task/       # Example bounded context
│
├── archforge-starters/               # cache / lock / redisson / trace
├── archforge-dependencies/           # Centralized BOM (java-platform)
│
├── docker/                           # Deployment files
└── skills/                           # Agent skill snippets
```

## Frontend (ArchForgeAdmin)

```
ArchForgeAdmin/
├── src/
│   ├── api/                 # API endpoint definitions (Axios)
│   ├── assets/              # Static assets (images, SVGs)
│   ├── components/          # Shared Vue components
│   ├── config/              # App configuration
│   ├── directives/          # Vue custom directives
│   ├── layout/              # Page layouts (sidebar, header, tabs)
│   ├── plugins/             # Plugin registrations (Element Plus, i18n)
│   ├── router/              # Vue Router configuration
│   ├── store/               # Pinia state stores
│   ├── utils/               # Utility functions (auth, http, hasPerms)
│   ├── views/               # Page components
│   └── App.vue
├── Dockerfile
├── vite.config.ts
└── package.json
```

Dev server: `http://localhost:8848`, proxying to `http://localhost:8080`.

## C-end (ArchForgeWeb)

Next.js App Router application. Dev server: `http://localhost:3000`, talking to `http://localhost:8081`. Details: [C-end Web](./c-end-web.md).

## Module Dependencies

```
archforge-server-admin / archforge-server-web
  ├── archforge-infrastructure
  │     ├── archforge-common-base
  │     ├── archforge-common-jpa
  │     └── archforge-common-error
  └── archforge-domain/*
        ├── archforge-common-base
        ├── archforge-common-jpa
        └── archforge-common-error
```

The dependency flow is strictly top-down: server modules depend on infrastructure and domain modules, but domain modules never depend on the web layer.

Gradle task names use the prefixed project path:

```bash
./gradlew :archforge-server-admin:bootRun
./gradlew :archforge-server-web:bootRun
./gradlew :archforge-server-admin:test
./gradlew :archforge-cli:shadowJar
```

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Five sibling repos | Independent release cadence for backend, admin, web, docs, contracts |
| `archforge-` Gradle prefix | Avoids colliding module names and matches published artifact IDs |
| `archforge-dependencies/` BOM | Single source of truth for library versions |
| Domain per bounded context | `archforge-admin-user` can be replaced or extended independently |
| Split common modules | Utilities, errors, and persistence stay isolated |
| Flyway scripts in `archforge-server-admin/resources/` | Migrations deploy with the admin app |
| Separate `archforge-infrastructure/` | Auth, filters, file storage, i18n, and config are reusable |
| Dual servers | Admin (`:8080`, `{code,message,data}`) vs web (`:8081`, ProblemDetail) |

## Related Pages

- [Tech Stack](./tech-stack.md) — technology choices explained
- [CLI](./cli.md) — `./archforge` commands
- [Configuration](./configuration.md) — YAML config structure
- [Local Development Setup](./local-setup.md) — IDE and tooling
