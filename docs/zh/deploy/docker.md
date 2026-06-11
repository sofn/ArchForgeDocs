# Docker 部署

ArchForge 提供两种 Docker Compose 部署模式：**Native Image**（BellSoft Liberica NIK 25）适用于生产环境，**JVM**（Project Leyden CDS）适用于开发/测试环境。

## 部署模式

| 模式 | Compose 文件 | 优势 | 适用场景 |
|------|-------------|------|----------|
| **Native**（默认） | `docker-compose.native.yml` | 约 100ms 启动，约 50MB 内存 | 生产环境 |
| **JVM** | `docker-compose.yml` | 构建快速，完整调试支持 | 开发/测试 |

## 架构

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  Browser     │────►│  Nginx (:80) │────►│ ArchForge  │
│              │     │  Static files│     │  (:8080)  │
│              │     │  /api/* proxy│     │           │
└─────────────┘     └──────────────┘     └─────┬─────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                              ┌─────┴──────┐        ┌────┴────┐
                              │PostgreSQL   │        │Redis(:6379)│
                              │(:5432)      │        └─────────┘
                              └────────────┘
```

## 快速开始

```bash
cd ArchForge/docker

# 默认：Native Image 模式
./start.sh

# 或显式指定模式
./start.sh native   # BellSoft Liberica NIK 25 Native Image
./start.sh jvm      # Project Leyden CDS (JVM with Class Data Sharing)
```

也可以直接使用 `docker compose`：

```bash
cd ArchForge/docker

# Native 模式
docker compose -f docker-compose.native.yml up -d --build

# JVM 模式
docker compose -f docker-compose.yml up -d --build
```

## 环境变量

将 `.env.example` 复制为 `.env` 并自定义配置：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `DB_PASSWORD` | `123` | PostgreSQL 密码 |
| `JWT_SECRET` | （内置开发密钥） | JWT 签名密钥 |

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端（Nginx） | 80 | 管理面板 |
| 后端（ArchForge） | 8080 | REST API |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

## 文件结构

```
docker/
├── jvm/
│   ├── docker-compose.yml          # JVM 模式，使用 Project Leyden CDS
│   └── Dockerfile                  # JVM Dockerfile，带 CDS 优化
├── native/
│   ├── docker-compose.native.yml   # Native 模式（BellSoft Liberica NIK 25）
│   └── Dockerfile                  # Native image Dockerfile
├── nginx/
│   └── default.conf                # Nginx 反向代理配置
├── start.sh                        # 一键启动脚本
├── .env.example                    # 环境变量模板
└── logs/                           # 应用日志（运行时创建）
```

## Nginx 配置

Nginx 服务负责提供前端静态文件，并将 API 请求代理到后端：

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend static files
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://archforge:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger UI proxy
    location /swagger-ui/ {
        proxy_pass http://archforge:8080/swagger-ui/;
    }

    # OpenAPI docs proxy
    location /v3/api-docs {
        proxy_pass http://archforge:8080/v3/api-docs;
    }
}
```

## Native (Liberica NIK 25) 与 JVM (Leyden CDS) 对比

| 指标 | Native (Liberica NIK 25) | JVM (Leyden CDS) |
|------|--------|-----|
| 首次构建时间 | 约 10 分钟 | 约 2 分钟 |
| Docker 镜像大小 | 约 100MB | 约 350MB |
| 启动时间 | 约 100ms | 约 10s |
| 运行时内存 | 约 50MB | 约 300MB |
| 吞吐量 | 略低 | 高 |
| 调试支持 | 有限 | 完整 |

## Docker Compose 详解

两种 compose 文件均定义了四个服务：

1. **postgresdb**：PostgreSQL 17，带健康检查和持久化存储卷
2. **redis**：Redis 7 Alpine，带健康检查
3. **archforge**：后端应用（依赖 postgresdb 和 redis 健康就绪）
4. **archforge-admin**：前端 Nginx 容器（依赖 archforge）

后端容器通过环境变量接收所有数据源配置：

```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
  SPRING_DATA_REDIS_HOST: redis
  DB_USERNAME: archforge
  DB_PASSWORD: ${DB_PASSWORD:-123}
  JWT_SECRET: ${JWT_SECRET:-...}
  SPRING_DATASOURCE_DYNAMIC_DATASOURCE_USER_MASTER_URL: jdbc:postgresql://postgresdb:5432/archforge
  SPRING_DATASOURCE_DYNAMIC_DATASOURCE_USER_SLAVE_URL: jdbc:postgresql://postgresdb:5432/archforge
```

## 管理部署

```bash
# 查看日志
docker compose -f docker-compose.native.yml logs -f archforge

# 重启服务
docker compose -f docker-compose.native.yml restart archforge

# 停止所有服务
docker compose -f docker-compose.native.yml down

# 停止并删除存储卷（重置数据库）
docker compose -f docker-compose.native.yml down -v

# 重新构建指定服务
docker compose -f docker-compose.native.yml up -d --build archforge
```

## 相关页面

- [生产环境指南](./production.md) — 生产环境加固清单
- [数据库迁移](/zh/guide/database-migration.md) — Flyway 在 Docker 启动时自动运行
- [配置说明](/zh/guide/configuration.md) — 环境变量映射
```

---
