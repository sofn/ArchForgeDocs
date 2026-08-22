# Architecture

ArchForge is five sibling Git repositories. This page explains **how the pieces fit together**, how a request travels through the backend, and which CI gates keep implementations honest against contracts.

## System context

Two Spring Boot apps are built from one backend codebase, each with its own sa-token realm and response style. The Spec repo is the shared constitution — its OpenAPI file and enum registry feed both frontends via generated TypeScript.

```mermaid
flowchart LR
  subgraph clients["Frontends"]
    A["ArchForgeAdmin<br/>Vue 3 · :8848"]
    W["ArchForgeWeb<br/>Next.js · :3000"]
  end
  subgraph backend["ArchForge — two Spring Boot apps"]
    SA["server-admin :8080<br/>B-end API · {code,message,data}"]
    SW["server-web :8081<br/>C-end API · ProblemDetail"]
  end
  PG[("PostgreSQL 17")]
  RD[("Redis 7")]
  SPEC["ArchForgeSpec<br/>OpenAPI · enums.yaml · rules"]

  A -->|"REST /api (vite proxy)"| SA
  W -->|"REST + SSE"| SW
  SA --> PG & RD
  SW --> PG & RD
  SPEC -. "openapi.yaml — breaking-change gate" .-> SA
  SPEC -. "schema.d.ts + enums.generated.ts" .-> A
  SPEC -. "schema.d.ts + enums.generated.ts" .-> W
```

Key consequences of this layout:

- **No cross-calls between the two apps.** `server-web` never imports `server-admin` code; an ArchUnit rule fails the build if that ever happens.
- **Frontends never hand-write API types.** `pnpm gen:api` regenerates them from `openapi.yaml`, and CI fails when committed artifacts drift.
- **Deleted paths stay deleted.** `/system/menu` and `/system/role` are gone from the contract and cannot reappear in a controller.

## Request lifecycle (admin)

A typical authenticated admin request — token issuance, the refresh queue, and permission checks:

```mermaid
sequenceDiagram
  autonumber
  participant UI as ArchForgeAdmin
  participant SA as server-admin :8080
  participant R as Redis

  UI->>SA: POST /auth/login (username, password)
  SA->>SA: captcha check · @RateLimit (5/min/IP)
  SA->>R: store session (sa-token, StpAdminUtil)
  SA-->>UI: {code:0, data:{accessToken, refreshToken}}

  UI->>SA: GET /admin/user (Authorization: Bearer)
  SA->>SA: @SaCheckLogin + @SaCheckPermission("user:list")
  SA-->>UI: {code:0, data:{list, total}}

  Note over UI,SA: ...access token expires...
  UI->>SA: POST /auth/refresh-token (refreshToken)
  SA-->>UI: new accessToken (single-use rotation)
  Note over UI: queued requests replay automatically
```

On the C-end the same job is done by `StpWebUtil` + `WebAuthInterceptor`; errors come back as RFC 9457 ProblemDetail with an ArchForge error code property instead of the admin envelope.

## Backend module layering

One Gradle root, layered modules. Arrows point in the allowed dependency direction:

```mermaid
flowchart TD
  subgraph apps["Applications"]
    ADMIN["server-admin :8080"]
    WEB["server-web :8081"]
    CLI["cli · ./archforge + MCP"]
  end
  subgraph domain["Domain modules (bounded contexts)"]
    USER["domain/admin-user<br/>users · roles · menus · dicts"]
    BLOG["domain/blog<br/>articles · categories"]
    META["domain/meta-table<br/>low-code tables"]
  end
  INFRA["infrastructure<br/>sa-token config · redis · dynamic datasources · security filters"]
  subgraph common["Common kernels"]
    BASE["common-base"]
    ERR["common-error"]
    JPA["common-jpa"]
  end
  STARTERS["starters<br/>cache · lock · redisson · trace"]

  ADMIN --> domain & INFRA & STARTERS
  WEB --> domain & INFRA & STARTERS
  USER --> JPA & INFRA
  BLOG --> JPA
  META --> JPA
  JPA --> BASE & ERR
```

The layering is not a drawing — it is enforced by [`ArchitectureTest`](https://github.com/sofn/ArchForge/blob/main/archforge-server-admin/src/test/java/com/lesofn/archforge/server/admin/architecture/ArchitectureTest.java):

- controllers must not touch repositories directly,
- domain modules must not depend on server packages,
- starters must stay business-free,
- every rule fails when it matches zero classes (`failOnEmptyShould=true`), so a typo'd package filter cannot silently disable architecture checks.

## Contract-first workflow

Contracts change in the Spec repo first; code follows. Every arrow below ends in a CI gate:

```mermaid
flowchart LR
  subgraph spec["ArchForgeSpec"]
    OAS["api/openapi.yaml"]
    ENUMS["enums/enums.yaml"]
    ERRC["specs/error-codes.md"]
  end
  subgraph be["ArchForge backend"]
    LIVE["live springdoc JSON"]
    CODES["ErrorCode enums"]
  end
  subgraph fe["Web + Admin"]
    SDKT["src/types/schema.d.ts"]
    ENUMTS["enums.generated.ts"]
  end

  OAS -->|"gen:api"| SDKT
  ENUMS -->|"gen-enums.mjs"| ENUMTS
  SDKT -->|"git diff --exit-code"| GATE1["sdk-sync gate"]
  ENUMTS -->|"git diff --exit-code"| GATE2["enum-sync gate"]
  LIVE -->|"oasdiff breaking"| GATE3["no-breaking-changes gate"]
  CODES -->|"check-error-codes.py"| GATE4["error-code registry gate"]
```

To add or change an endpoint: edit `openapi.yaml`, implement it behind controllers/services, export the live springdoc document (`OpenApiSnapshotTest`), and let `oasdiff` prove nothing broke for existing consumers.

## Deployment topology

Development and production both start from `docker/` compose files:

```mermaid
flowchart LR
  subgraph host["Docker host"]
    NGINX["nginx / gateway"]
    SA["server-admin :8080"]
    SW["server-web :8081"]
    PG[("PostgreSQL 17<br/>Flyway migrations")]
    RD[("Redis 7<br/>sa-token sessions · cache · locks")]
    OTEL["OpenTelemetry collector :4318"]
    MINIO[("S3-compatible storage")]
  end
  USERS(["B-end & C-end users"]) --> NGINX
  NGINX --> SA & SW
  SA --> PG & RD & MINIO & OTEL
  SW --> PG & RD & MINIO & OTEL
```

Details per environment live in the deployment guides ([Docker](/deploy/docker), [observability](/deploy/observability), [production](/deploy/production)).

## Quality gates summary

| Concern | Enforcement |
|---------|-------------|
| Module boundaries | Spring Modulith verification + ArchUnit |
| Coverage | aggregated JaCoCo; changed-line coverage ≥ 60% on PRs |
| Test tiers | JUnit `@Tag`: `P0` / `P1` / `contract` / `slow` (container tests) |
| Contract drift | oasdiff + sdk-sync + enum-sync + error-code registry |
| Style | Spotless, JSpecify `@NullMarked` on every package |
