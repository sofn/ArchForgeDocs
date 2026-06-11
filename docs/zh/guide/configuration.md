# 配置说明

ArchForge 使用 Spring Boot 基于 Profile 的配置系统，自定义属性前缀为 `arch-forge`。

## Profile 体系

| Profile | 文件 | 数据库 | Redis | Flyway | 验证码 |
|---------|------|----------|-------|--------|---------|
| **dev**（默认） | `application-dev.yaml` | Testcontainers PostgreSQL | Testcontainers Redis | 已禁用 | 已禁用 |
| **test** | `application-test.yaml` | PostgreSQL | 真实 Redis | 已启用 | 已启用 |
| **prod** | `application-prod.yaml` | PostgreSQL（主从） | 真实 Redis | 已启用 | 已启用 |

通过环境变量或 JVM 参数切换 Profile：

```bash
# Environment variable
SPRING_PROFILES_ACTIVE=prod ./gradlew server-admin:bootRun

# JVM argument
java -Dspring.profiles.active=prod -jar server-admin.jar
```

## 配置文件

```
server-admin/src/main/resources/
├── application.yaml              # 共享基础配置（所有 Profile）
├── application-dev.yaml          # 开发环境覆盖配置
├── application-test.yaml.example # 测试环境模板（复制后编辑）
├── application-prod.yaml.example # 生产环境模板（复制后编辑）
└── log4j2-spring.xml            # 日志配置（含 <SpringProfile> 区分）
```

::: warning
`application-test.yaml` 和 `application-prod.yaml` 已被 gitignore。请始终从 `.example` 文件复制并填入真实配置值。
:::

## ArchForge 属性（`arch-forge.*`）

### 核心设置

```yaml
arch-forge:
  name: ArchForge                      # Application name
  version: 1.0.0                      # Version string
  copyright-year: 2025                # Footer copyright year
  captcha-type: math                  # Captcha type: "math" or "text"
  rsa-private-key: "MIICeAIB..."     # RSA key for frontend encryption
```

### JWT 配置

```yaml
arch-forge:
  jwt:
    secret: "your-base64-secret-key"  # HMAC-SHA512 signing key
    expire-seconds: 604800            # Token TTL (default: 7 days)
```

::: danger
生产环境务必更改 `jwt.secret`！默认密钥仅用于开发环境。
:::

### Token 配置

```yaml
arch-forge:
  token:
    header: Authorization             # HTTP header name
    auto-refresh-time: 20             # Auto-refresh threshold (minutes)
```

### 验证码配置

```yaml
arch-forge:
  captcha:
    enabled: true                     # Enable/disable login captcha
```

### 服务器监控

```yaml
arch-forge:
  monitor:
    enabled: true                     # Enable Oshi system monitoring
```

### 内嵌服务（仅开发环境）

```yaml
arch-forge:
  embedded:
    redis: true                       # Start Redis via Testcontainers
    postgresql: true                  # Start PostgreSQL via Testcontainers
    rustfs: true                       # Start RustFS (S3) via Testcontainers
```

### 数据脱敏

```yaml
arch-forge:
  sensitive:
    enabled: true                     # Enable sensitive data masking in responses
```

## 数据源配置

ArchForge 使用 `dynamic-datasource-spring-boot4-starter` 实现多数据源支持和主从路由。

### 开发环境（Testcontainers PostgreSQL）

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
在开发模式下，Testcontainers 会自动启动 PostgreSQL 并注入连接属性。无需手动配置这些值。
:::

### 生产环境（PostgreSQL）

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

在 Service 方法中使用 `@DS("group_name")` 注解进行显式数据源路由。

## Flyway 配置

```yaml
arch-forge:
  flyway:
    enabled: true    # Enable Flyway migrations (test/prod only)

spring:
  jpa:
    hibernate:
      ddl-auto: validate   # Flyway manages DDL; Hibernate only validates
```

详见 [数据库迁移](/zh/guide/database-migration.md) 获取完整的 Flyway 指南。

## 文件存储配置

ArchForge 支持文件上传/下载，提供两种后端选项：**本地**文件系统和 **S3 兼容**存储（如 RustFS）。

### 本地存储

```yaml
arch-forge:
  file-storage:
    type: local
    local:
      base-path: /data/archforge/uploads    # Directory for stored files
```

### S3 / RustFS 存储

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
在开发模式下，RustFS 通过 Testcontainers 自动启动。S3 端点和凭据会自动注入——无需手动配置。
:::

## 日志

日志通过 `log4j2-spring.xml` 配置，使用 `<SpringProfile>` 实现不同 Profile 的差异化行为：

- **dev**：控制台输出，彩色格式
- **非 dev**：仅文件输出，支持日志轮转

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

在生产环境中通过 `OTEL_EXPORTER_OTLP_ENDPOINT` 环境变量覆盖 OTLP 端点。

## Actuator 端点

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
```

| 端点 | URL |
|----------|-----|
| 健康检查 | `http://localhost:8080/actuator/health` |
| 指标 | `http://localhost:8080/actuator/metrics` |
| Prometheus | `http://localhost:8080/actuator/prometheus` |

## 相关页面

- [本地开发环境](/zh/guide/local-setup.md) — 开发环境详细配置
- [数据库迁移](/zh/guide/database-migration.md) — Flyway 配置说明
- [生产部署指南](/zh/deploy/production.md) — 生产环境配置清单
```

---
