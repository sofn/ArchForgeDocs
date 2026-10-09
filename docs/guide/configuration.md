# Configuration

ArchForge uses Spring Boot's profile-based configuration system with a custom `arch-forge` properties prefix.

## Profile System

| Profile | File | Database | Redis | Flyway | Captcha |
|---------|------|----------|-------|--------|---------|
| **dev** (default) | `application-dev.yaml` | Testcontainers PostgreSQL | Testcontainers Redis | Disabled | Disabled |
| **test** | `application-test.yaml` | PostgreSQL | Real Redis | Enabled | Enabled |
| **prod** | `application-prod.yaml` | PostgreSQL (master/slave) | Real Redis | Enabled | Enabled |

Switch profiles via environment variable or JVM argument:

```bash
# Environment variable
SPRING_PROFILES_ACTIVE=prod ./gradlew :archforge-server-admin:bootRun

# JVM argument
java -Dspring.profiles.active=prod -jar archforge-server-admin.jar
```

## Configuration Files

```
archforge-archforge-server-admin/src/main/resources/
├── application.yaml              # Shared base config (all profiles)
├── application-dev.yaml          # Dev overrides
├── application-test.yaml.example # Template for test (copy and edit)
├── application-prod.yaml.example # Template for prod (copy and edit)
└── log4j2-spring.xml            # Logging with <SpringProfile> sections
```

::: warning
`application-test.yaml` and `application-prod.yaml` are gitignored. Always copy from the `.example` files and fill in real values.
:::

## ArchForge Properties (`arch-forge.*`)

### Core Settings

```yaml
arch-forge:
  name: ArchForge                      # Application name
  version: 1.0.0                      # Version string
  copyright-year: 2025                # Footer copyright year
  captcha-type: math                  # Captcha type: "math" or "text"
  rsa-private-key: "MIICeAIB..."     # RSA key for frontend encryption
```

### Sa-Token Configuration

Auth is **Sa-Token**, not JWT / Spring Security. Admin uses `StpAdminUtil`; web uses `StpWebUtil`.

```yaml
sa-token:
  token-name: Authorization
  token-prefix: Bearer
  timeout: 604800                     # 7 days
  token-style: uuid
  is-read-cookie: false
```

::: danger
Production secrets have **no defaults**. Set `DB_PASSWORD`, Redis credentials, RSA keys, and related env vars explicitly.
:::

### Token Configuration

```yaml
arch-forge:
  token:
    header: Authorization             # HTTP header name
    auto-refresh-time: 20             # Auto-refresh threshold (minutes)
```

### Captcha Configuration

```yaml
arch-forge:
  captcha:
    enabled: true                     # Enable/disable login captcha
```

### Server Monitor

```yaml
arch-forge:
  monitor:
    enabled: true                     # Enable Oshi system monitoring
```

### Embedded Services (Dev Only)

```yaml
arch-forge:
  embedded:
    redis: true                       # Start Redis via Testcontainers
    postgresql: true                  # Start PostgreSQL via Testcontainers
    rustfs: true                       # Start RustFS (S3) via Testcontainers
```

### Data Sensitivity

```yaml
arch-forge:
  sensitive:
    enabled: true                     # Enable sensitive data masking in responses
```

## Datasource Configuration

ArchForge uses `dynamic-datasource-spring-boot4-starter` for multi-datasource support with master/slave routing.

### Dev Profile (Testcontainers PostgreSQL)

```yaml
spring:
  datasource:
    dynamic:
      primary: user_master
      strict: false
      datasource:
        user_master:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://${TESTCONTAINERS_PG_HOST}:${TESTCONTAINERS_PG_PORT}/archforge
          username: archforge
          password: archforge
        user_slave:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://${TESTCONTAINERS_PG_HOST}:${TESTCONTAINERS_PG_PORT}/archforge
          username: archforge
          password: archforge
```

::: tip
In dev mode, Testcontainers automatically starts PostgreSQL and injects the connection properties. You do not need to configure these values manually.
:::

### Production Profile (PostgreSQL)

```yaml
spring:
  datasource:
    dynamic:
      primary: user_master
      strict: false
      datasource:
        user_master:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://master-host:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
        user_slave:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://slave-host:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
```

Use `@DS("group_name")` annotation for explicit datasource routing in service methods.

## Flyway Configuration

```yaml
arch-forge:
  flyway:
    enabled: true    # Enable Flyway migrations (test/prod only)

spring:
  jpa:
    hibernate:
      ddl-auto: validate   # Flyway manages DDL; Hibernate only validates
```

See [Database Migration](./database-migration.md) for the full Flyway guide.

## File Storage Configuration

ArchForge supports file upload/download with two backend options: **local** filesystem and **S3-compatible** storage (e.g., RustFS).

### Local Storage

```yaml
arch-forge:
  file-storage:
    type: local
    local:
      base-path: /data/archforge/uploads    # Directory for stored files
```

### S3 / RustFS Storage

```yaml
arch-forge:
  file-storage:
    type: s3
    s3:
      endpoint: http://localhost:9000       # RustFS or S3 endpoint
      access-key: ${MINIO_ACCESS_KEY}
      secret-key: ${MINIO_SECRET_KEY}
      bucket: archforge                      # Default bucket name
      region: us-east-1                     # AWS region (or leave default for RustFS)
```

::: tip
In dev mode, RustFS is auto-started via Testcontainers. The S3 endpoint and credentials are injected automatically — no manual configuration needed.
:::

## Logging

Logging is configured in `log4j2-spring.xml` using `<SpringProfile>` for profile-specific behavior:

- **dev**: Console output with colored formatting
- **non-dev**: File-only output with rotation

## OpenTelemetry

```yaml
management:
  tracing:
    sampling:
      probability: 1.0          # dev: 100%, prod: 0.1 (10%)
  otlp:
    tracing:
      endpoint: http://localhost:4318/v1/traces
    metrics:
      endpoint: http://localhost:4318/v1/metrics
```

Override the OTLP endpoint in production via `OTEL_EXPORTER_OTLP_ENDPOINT` environment variable.

## Actuator Endpoints

`dev` (and the default profile) expose the actuator on the business port:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

| Endpoint | URL (dev) |
|----------|-----|
| Liveness / readiness probes | `http://localhost:8080/livez`, `http://localhost:8080/readyz` |
| Health | `http://localhost:8080/actuator/health` |
| Metrics | `http://localhost:8080/actuator/metrics` |
| Prometheus | `http://localhost:8080/actuator/prometheus` |

`staging` and `prod` move the actuator to a **separate management port**. It is never published and never proxied by the frontend nginx, so `/actuator/prometheus` cannot be reached from outside; only `health,info,prometheus` are exposed there:

```yaml
management:
  server:
    port: ${MANAGEMENT_SERVER_PORT:8089}   # server-web: 8091
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
```

Orchestrator probes keep using the business port through `/livez` and `/readyz` (`management.endpoint.health.probes.add-additional-paths`). Liveness only looks at the process; readiness also checks the database and Redis. server-web follows the same layout on `8081` / `8091`.

## Errors and CORS

- A `500` response carries a generic message; the exception class and root cause (SQL, table names, …) go to the log only. `arch-forge.error.expose-details: true` puts them back into the response — the dev and test profiles set it, staging and prod must not.
- Business errors keep HTTP 200 with the error `code` in the body and are counted as `archforge_business_errors_total{code}`.
- `arch-forge.cors.allowed-origins` must list explicit origins in every profile except dev/test; an empty list or `*` stops the application at startup.

## Request Log

`arch-forge.request-log` writes one line per request (API, method, status, time, plus bodies where enabled):

- `mask-fields` entries are **key fragments**: a key that *contains* one (case-insensitive, `_` and `-` ignored) is masked, so `token` also covers `accessToken` and `refresh_token`.
- `staging` and `prod` set `include-request-payload` and `include-response-payload` to `false` — bodies carry session tokens and personal data.
- Payloads longer than 64 KB (or `max-payload-length`, if larger) are logged as their length only.
- Every log line carries `[traceId,requestId]`; paste the traceId into Jaeger / Grafana to open the request's trace.
- The logged client IP trusts forwarding headers only from `arch-forge.security.trusted-proxies` (the list rate limiting uses): behind such a proxy it is the right-most `X-Forwarded-For` entry the proxies did not add; otherwise it is the peer address. A client cannot choose the IP that lands in the log.

## Related Pages

- [Local Development Setup](./local-setup.md) — dev environment details
- [Database Migration](./database-migration.md) — Flyway configuration
- [Production Guide](../deploy/production.md) — production config checklist
```

---
