# 系统架构

ArchForge 由五个并列 Git 仓库组成。本页说明**各部分如何协作**：一次请求如何穿过后端、CI 用哪些门禁保证实现不偏离契约。

## 系统上下文

一套后端代码构建两个 Spring Boot 应用，各自拥有独立的 sa-token 认证域与响应风格。Spec 仓库是共同"宪法"——它的 OpenAPI 与枚举登记表通过生成的 TypeScript 喂给两个前端。

```mermaid
flowchart LR
  subgraph clients["前端"]
    A["ArchForgeAdmin<br/>Vue 3 · :8848"]
    W["ArchForgeWeb<br/>Next.js · :3000"]
  end
  subgraph backend["ArchForge —— 两个 Spring Boot 应用"]
    SA["server-admin :8080<br/>B 端 API · {code,message,data}"]
    SW["server-web :8081<br/>C 端 API · ProblemDetail"]
  end
  PG[("PostgreSQL 17")]
  RD[("Redis 7")]
  SPEC["ArchForgeSpec<br/>OpenAPI · enums.yaml · rules"]

  A -->|"REST /api（vite 代理）"| SA
  W -->|"REST + SSE"| SW
  SA --> PG & RD
  SW --> PG & RD
  SPEC -. "openapi.yaml —— 破坏性变更门禁" .-> SA
  SPEC -. "schema.d.ts + enums.generated.ts" .-> A
  SPEC -. "schema.d.ts + enums.generated.ts" .-> W
```

这种布局带来的直接约束：

- **两个应用互不调用。** `server-web` 不 import `server-admin` 的代码，违反会被 ArchUnit 规则拦下。
- **前端不手写 API 类型。** `pnpm gen:api` 从 `openapi.yaml` 重新生成，提交物漂移会让 CI 变红。
- **删除的路径保持删除。** `/system/menu`、`/system/role` 已从契约移除，不允许在 Controller 里复活。

## 请求链路（管理端）

一次典型的带认证请求 —— 令牌签发、刷新队列与权限校验：

```mermaid
sequenceDiagram
  autonumber
  participant UI as ArchForgeAdmin
  participant SA as server-admin :8080
  participant R as Redis

  UI->>SA: POST /auth/login (username, password)
  SA->>SA: 验证码 · @RateLimit（5 次/分/IP）
  SA->>R: 写入会话（sa-token, StpAdminUtil）
  SA-->>UI: {code:0, data:{accessToken, refreshToken}}

  UI->>SA: GET /admin/user (Authorization: Bearer)
  SA->>SA: @SaCheckLogin + @SaCheckPermission("user:list")
  SA-->>UI: {code:0, data:{list, total}}

  Note over UI,SA: ……access token 过期……
  UI->>SA: POST /auth/refresh-token (refreshToken)
  SA-->>UI: 新 accessToken（单次轮换）
  Note over UI: 排队中的请求自动重放
```

C 端由 `StpWebUtil` + `WebAuthInterceptor` 承担同样职责；错误以 RFC 9457 ProblemDetail 返回并附带 ArchForge 错误码属性，而不是管理端 envelope。

## 后端模块分层

一个 Gradle 根、分层模块。箭头方向即允许的依赖方向：

```mermaid
flowchart TD
  subgraph apps["应用"]
    ADMIN["server-admin :8080"]
    WEB["server-web :8081"]
    CLI["cli · ./archforge + MCP"]
  end
  subgraph domain["领域模块（限界上下文）"]
    USER["domain/admin-user<br/>用户 · 角色 · 菜单 · 字典"]
    BLOG["domain/blog<br/>文章 · 分类"]
    META["domain/meta-table<br/>低代码表格"]
  end
  INFRA["infrastructure<br/>sa-token 配置 · redis · 动态数据源 · 安全过滤"]
  subgraph common["公共内核"]
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

分层不是一张画 —— 它由 [`ArchitectureTest`](https://github.com/sofn/ArchForge/blob/main/archforge-server-admin/src/test/java/com/lesofn/archforge/server/admin/architecture/ArchitectureTest.java) 强制执行：

- Controller 不允许直接触碰 Repository；
- 领域模块不允许依赖 server 包；
- starters 必须与业务无关；
- 任何规则匹配到 0 个类时直接失败（`failOnEmptyShould=true`），包名写错不会让架构检查静默失效。

## 契约先行工作流

契约永远先改 Spec 仓库；代码随后跟上。下面每条箭头的终点都是一个 CI 门禁：

```mermaid
flowchart LR
  subgraph spec["ArchForgeSpec"]
    OAS["api/openapi.yaml"]
    ENUMS["enums/enums.yaml"]
    ERRC["specs/error-codes.md"]
  end
  subgraph be["ArchForge 后端"]
    LIVE["live springdoc JSON"]
    CODES["ErrorCode 枚举"]
  end
  subgraph fe["Web + Admin"]
    SDKT["src/types/schema.d.ts"]
    ENUMTS["enums.generated.ts"]
  end

  OAS -->|"gen:api"| SDKT
  ENUMS -->|"gen-enums.mjs"| ENUMTS
  SDKT -->|"git diff --exit-code"| GATE1["sdk-sync 门禁"]
  ENUMTS -->|"git diff --exit-code"| GATE2["enum-sync 门禁"]
  LIVE -->|"oasdiff breaking"| GATE3["无破坏性变更门禁"]
  CODES -->|"check-error-codes.py"| GATE4["错误码登记门禁"]
```

新增或修改接口的路径：先改 `openapi.yaml` → 在 controller/service 后面实现 → 用 `OpenApiSnapshotTest` 导出 live springdoc 文档 → 让 `oasdiff` 证明对既有消费方零破坏。

## 部署拓扑

开发与生产都从 `docker/` 下的 compose 文件出发：

```mermaid
flowchart LR
  subgraph host["Docker 宿主机"]
    NGINX["nginx / 网关"]
    SA["server-admin :8080"]
    SW["server-web :8081"]
    PG[("PostgreSQL 17<br/>Flyway 迁移")]
    RD[("Redis 7<br/>会话 · 缓存 · 分布式锁")]
    OTEL["OpenTelemetry collector :4318"]
    MINIO[("S3 兼容存储")]
  end
  USERS(["B 端 & C 端用户"]) --> NGINX
  NGINX --> SA & SW
  SA --> PG & RD & MINIO & OTEL
  SW --> PG & RD & MINIO & OTEL
```

各环境细节见部署指南（[Docker](/zh/deploy/docker)、[可观测性](/zh/deploy/observability)、[生产环境](/zh/deploy/production)）。

## 质量门禁一览

| 关注点 | 强制手段 |
|--------|----------|
| 模块边界 | Spring Modulith 校验 + ArchUnit |
| 覆盖率 | 聚合 JaCoCo；PR 变更行覆盖率 ≥ 60% |
| 测试分级 | JUnit `@Tag`：`P0` / `P1` / `contract` / `slow`（容器测试） |
| 契约漂移 | oasdiff + sdk-sync + enum-sync + 错误码登记检查 |
| 代码风格 | Spotless、每个包 JSpecify `@NullMarked` |
