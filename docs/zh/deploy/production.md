# 生产环境指南

ArchForge 生产环境部署的检查清单与指南。

## 部署前检查清单

| # | 任务 | 优先级 | 备注 |
|---|------|--------|------|
| 1 | 配置生产密钥 | **关键** | 无默认值 — `DB_PASSWORD`、Redis、RSA、Sa-Token Redis 等 |
| 2 | 更换 RSA 私钥 | **关键** | 生成新的 RSA 密钥对，并以 `ARCH_FORGE_RSA_PRIVATE_KEY` 传入（不设置管理端不启动） |
| 3 | 更换 PostgreSQL 密码 | **关键** | 使用强密码 |
| 4 | 启用验证码 | 高 | 设置 `arch-forge.captcha.enabled: true` |
| 5 | 配置 PostgreSQL（主/从） | 高 | 按需设置数据库复制 |
| 6 | 配置 Redis | 高 | 使用独立实例并**设置密码**——`REDIS_PASSWORD`（`docker-compose.prod.yml` 以 `--requirepass` 启动 Redis，不设置就起不来） |
| 7 | 启用 Flyway | 高 | 设置 `arch-forge.flyway.enabled: true` |
| 8 | 设置 JPA DDL 为 validate | 高 | `spring.jpa.hibernate.ddl-auto: validate` |
| 9 | 配置 HTTPS | 高 | 在 Nginx 或负载均衡器处终止 SSL |
| 10 | 设置数据库备份 | 高 | 自动化每日备份 |
| 11 | 检查 OTLP 采样率 | 中 | prod/staging 下 `SAMPLING_PROBABILITY` 默认 10% |
| 12 | 检查日志级别 | 中 | 生产环境避免使用 DEBUG 级别 |
| 13 | 设置内存限制 | 中 | JVM 参数或 Docker 资源限制 |
| 14 | 设置 `CORS_ALLOWED_ORIGINS` | **关键** | 写明具体来源，不能用 `*`——除 dev/test 外的 profile 不配置就拒绝启动 |
| 15 | 设置 `ALERT_WEBHOOK_URL` | 高 | Alertmanager 投递告警的地址（见[可观测性](./observability.md)） |
| 16 | 设置 `WEB_PUBLIC_URL` | 高 | C 端站点的公网地址（邮件、通知里的链接） |

`docker-compose.prod.yml` 在 `DB_PASSWORD`、`REDIS_PASSWORD`、`ARCH_FORGE_RSA_PRIVATE_KEY`、`CORS_ALLOWED_ORIGINS`、`WEB_PUBLIC_URL` 设齐之前拒绝启动（`scripts/prod/.env.example` 列出了它们）。有一条契约测试保证 compose 文件覆盖 prod/staging profile 要求的每个变量。

## 生成密钥

### 生产密钥

认证是 Sa-Token（Redis 中的 UUID 令牌），不是签名 JWT。生产 YAML **没有默认密码或 RSA 密钥**。

```bash
# 示例：生成传输用 RSA 与 Redis/DB 密码
openssl rand -base64 32
./archforge init --write --profile prod
```

把值写入 `.env` 或密钥管理系统。不要提交 `application-prod.yaml` 中的密钥。

### RSA 密钥对

生成新的 RSA 私钥：

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:1024
openssl pkcs8 -topk8 -inform PEM -outform DER -in private.pem -out private.der -nocrypt
base64 private.der
```

将 Base64 编码的私钥设置到 `arch-forge.rsa-private-key` 中。将对应的公钥分享给前端。

## 生产环境配置

从示例文件创建 `archforge-server-admin/src/main/resources/application-prod.yaml`：

```bash
cp application-prod.yaml.example application-prod.yaml
```

### 关键配置项

```yaml
server:
  port: 8080

spring:
  jpa:
    hibernate:
      ddl-auto: validate         # Flyway manages DDL
  datasource:
    dynamic:
      primary: user_master
      datasource:
        user_master:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://master:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
        user_slave:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://slave:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
  data:
    redis:
      host: ${REDIS_HOST:redis}
      port: 6379
      password: ${REDIS_PASSWORD}

sa-token:
  timeout: 86400                 # 生产环境 24 小时
arch-forge:
  captcha:
    enabled: true
  flyway:
    enabled: true
  monitor:
    enabled: true
  embedded:
    redis: false                 # Use real Redis
    postgresql: false            # Use real PostgreSQL

management:
  server:
    port: ${MANAGEMENT_SERVER_PORT:8089}   # actuator 不在业务端口（web 为 8091）
  endpoints:
    web:
      exposure:
        include: health,info,prometheus
  tracing:
    sampling:
      probability: 0.1           # 10% sampling in production
```

## 数据库搭建

### 安装 PostgreSQL 17

方案 A：Docker（推荐用于大多数部署场景）：

```bash
docker run -d --name archforge-pg \
  --restart unless-stopped \
  -e POSTGRES_USER=archforge \
  -e POSTGRES_PASSWORD=${DB_PASSWORD} \
  -e POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=en_US.UTF-8" \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 postgres:17-alpine
```

方案 B：原生安装（Ubuntu）：

```bash
sudo apt install -y postgresql-17
sudo -u postgres createuser --createdb archforge
sudo -u postgres psql -c "ALTER USER archforge PASSWORD '<your-password>';"
```

### 创建数据库

```bash
psql -h <master-host> -U archforge -c \
  "CREATE DATABASE archforge_user ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';"
```

### 主从复制

使用 `dynamic-datasource` 进行读写分离时，需要在主库和从库实例之间搭建 PostgreSQL 流复制。ArchForge 通过 `@DS` 注解和 `application-prod.yaml` 中配置的数据源组自动路由查询。

详细搭建说明请参考 [PostgreSQL 复制文档](https://www.postgresql.org/docs/17/high-availability.html)。

### 首次部署

首次启动时，Flyway 会自动创建所有表并初始化数据：

```bash
# Start application — Flyway runs V1 (schema), V2 (data), V3 (menus)
SPRING_PROFILES_ACTIVE=prod java -jar archforge-server-admin.jar
```

### 后续部署

Flyway 会自动检测并执行新的迁移脚本。请始终注意：

1. 部署前备份数据库
2. 通过代码审查检查迁移脚本
3. 先在测试环境验证迁移

完整指南请参阅[数据库迁移](/zh/guide/database-migration.md)。

## HTTPS 配置

### 方案 A：Nginx SSL 终止

```nginx
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://archforge:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### 方案 B：云负载均衡器

如果使用 AWS ALB、GCP Load Balancer 或类似服务，在负载均衡器处终止 SSL，然后通过 HTTP 代理到 Nginx 的 80 端口。

## 备份策略

### 数据库备份

```bash
# Daily automated backup
pg_dump -h <master-host> -U archforge archforge_user | gzip > backup_$(date +%Y%m%d).sql.gz
```

通过 cron 定时任务实现每日备份并保留 30 天：

```bash
# /etc/cron.d/archforge-backup
0 2 * * * archforge pg_dump -h localhost -U archforge archforge_user | gzip > /backups/archforge_$(date +\%Y\%m\%d).sql.gz && find /backups -name "archforge_*.sql.gz" -mtime +30 -delete
```

### 应用备份

- PostgreSQL 数据的 Docker 存储卷：`postgres-data`
- 应用日志：`docker/logs/`
- 配置文件：`application-prod.yaml`（请存放在安全的密钥管理系统中，不要提交到 git）

## 监控

### 健康检查与探针

```bash
curl http://localhost:8080/livez     # 存活：只看进程
curl http://localhost:8080/readyz    # 就绪：再加数据库与 Redis
```

`prod`（以及 `staging`）下 actuator 本身监听管理端口——admin `8089`、web `8091`，可在服务的环境变量里用 `MANAGEMENT_SERVER_PORT` 覆盖（compose 文件没有设置它）。Prometheus 抓取的是 8089/8091——改端口时要同时改 `docker/observability/prometheus/prometheus.yml`。此时业务端口上的 `/actuator/health` 返回 `404`，编排器探针请改用 `/livez` 与 `/readyz`。管理端口不要发布出去。

### Prometheus 指标

在内网采集管理端口上的 `/actuator/prometheus`：`docker/docker-compose.prod.yml` 中为 `backend:8089` 与 `backend-web:8091`，两者都已加入 `archforge-observability` 网络。自带的 Prometheus 配置通过 DNS 发现它们，见[可观测性](./observability.md)。
