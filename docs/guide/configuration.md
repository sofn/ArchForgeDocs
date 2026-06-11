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
SPRING_PROFILES_ACTIVE=prod ./gradlew server-admin:bootRun

# JVM argument
java -Dspring.profiles.active=prod -jar server-admin.jar
```

## Configuration Files

```
server-admin/src/main/resources/
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

### JWT Configuration

```yaml
arch-forge:
  jwt:
    secret: "your-base64-secret-key"  # HMAC-SHA512 signing key
    expire-seconds: 604800            # Token TTL (default: 7 days)
```

::: danger
Always change `jwt.secret` in production! The default key is for development only.
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

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

| Endpoint | URL |
|----------|-----|
| Health | `http://localhost:8080/actuator/health` |
| Metrics | `http://localhost:8080/actuator/metrics` |
| Prometheus | `http://localhost:8080/actuator/prometheus` |

## Related Pages

- [Local Development Setup](./local-setup.md) — dev environment details
- [Database Migration](./database-migration.md) — Flyway configuration
- [Production Guide](../deploy/production.md) — production config checklist
```

---
