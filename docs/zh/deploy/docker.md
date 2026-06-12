# Docker 部署

ArchForge 提供三种 Docker 部署模式，适用于不同场景。

## 部署模式

| 模式 | Compose 文件 | 镜像大小 | 启动时间 | 内存占用 | 适用场景 |
|------|-------------|---------|---------|---------|---------|
| **fulljre** | `docker-compose.fulljre.yml` | ~500MB | ~15s | ~300MB | 快速开始、调试 |
| **jlink**（默认） | `docker-compose.jlink.yml` | ~430MB | ~10s (CDS) | ~300MB | 均衡推荐 |
| **native** | `docker-compose.native.yml` | ~100MB | ~100ms | ~50MB | 生产环境 |

## 前置条件

构建 Docker 镜像前，需要设置 `JAVA_HOME` 指向 JDK 25+ 安装目录：

```bash
# 示例：在运行构建脚本前设置 JAVA_HOME
export JAVA_HOME=/path/to/jdk-25
export PATH=$JAVA_HOME/bin:$PATH
```

## 架构

```
┌─────────────┐     ┌────────────────┐
│  浏览器 /    │────►│  ArchForge     │
│  前端        │     │  (:8080)       │
└─────────────┘     └───────┬────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
           ┌─────┴──────┐       ┌─────┴─────┐
           │ PostgreSQL  │       │   Redis   │
           │  (:5432)   │       │  (:6379)  │
           └────────────┘       └───────────┘
```

后端直接暴露 8080 端口，无需 Nginx 反向代理。

## 快速开始

```bash
cd ArchForge/docker

# 默认：jlink 模式（推荐）
./start.sh

# 指定模式
./start.sh jlink     # 最小 JRE + Project Leyden CDS
./start.sh fulljre   # 完整 Azul Zulu JRE（最简单）
./start.sh native    # GraalVM Native Image（最快启动）

# 停止所有服务
./start.sh down
```

也可以直接使用 `docker compose`：

```bash
cd ArchForge/docker

# jlink 模式（默认）
docker compose -f docker-compose.jlink.yml up -d

# 完整 JRE 模式
docker compose -f docker-compose.fulljre.yml up -d

# Native 模式（构建时需要 --network=host）
docker compose -f docker-compose.native.yml up -d --build
```

## 构建 Docker 镜像

### 模式 1：完整 JRE（最简单）

使用完整的 Azul Zulu JRE — 镜像最大，但构建最简单。

```bash
# 1. 构建 bootJar
export JAVA_HOME=/path/to/jdk-25
./gradlew :server-admin:bootJar -x test

# 2. 构建 Docker 镜像
docker build -f docker/fulljre/Dockerfile -t archforge:fulljre .

# 或使用便捷脚本：
docker/fulljre/build.sh
```

### 模式 2：jlink（推荐）

使用 jlink 创建最小 JRE + Project Leyden CDS 加速启动。

```bash
# 1. 构建 bootJar
export JAVA_HOME=/path/to/jdk-25
./gradlew :server-admin:bootJar -x test

# 2. 构建 Docker 镜像（包含 CDS 训练 + jlink）
docker build -f docker/jlink/Dockerfile -t archforge:jlink .

# 或使用便捷脚本：
docker/jlink/build.sh
```

### 模式 3：Native Image

通过 GraalVM 编译为原生二进制 — 最小镜像、最快启动。

```bash
# 构建 Docker 镜像（Docker 内完整编译，需 10+ 分钟，8GB+ 内存）
docker build --network=host -f docker/native/Dockerfile -t archforge:native .

# 或使用便捷脚本：
docker/native/build.sh
```

::: warning
Native Image 编译需要 **8GB+ 内存**。使用 `--network=host` 允许 Docker 内的 Gradle 下载依赖。首次构建可能需要 10-20 分钟。
:::

## 环境变量

复制 `.env.example` 为 `.env` 并自定义：

```bash
cp .env.example .env
```

| 变量 | 默认值 | 说明 |
|------|-------|------|
| `DB_USERNAME` | `archforge` | PostgreSQL 用户名 |
| `DB_PASSWORD` | `archforge` | PostgreSQL 密码 |
| `JWT_SECRET` | （内置开发密钥） | JWT 签名密钥 |

## 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端 (ArchForge) | 8080 | REST API |
| PostgreSQL | 5432 | 数据库 |
| Redis | 6379 | 缓存 |

## 目录结构

```
docker/
├── fulljre/
│   ├── Dockerfile              # 完整 JRE (Azul Zulu 25)
│   └── build.sh                # 构建脚本
├── jlink/
│   ├── Dockerfile              # 最小 JRE (jlink + Leyden CDS)
│   └── build.sh                # 构建脚本
├── native/
│   ├── Dockerfile              # GraalVM Native Image
│   └── build.sh                # 构建脚本
├── docker-compose.yml          # 默认（jlink 模式）
├── docker-compose.jlink.yml    # jlink 模式
├── docker-compose.fulljre.yml  # 完整 JRE 模式
├── docker-compose.native.yml   # Native 模式
├── start.sh                    # 一键启动（jlink|fulljre|native|down）
├── .env.example                # 环境变量模板
├── init-db.sql                 # 数据库初始化
└── logs/                       # 应用日志（运行时创建）
```

## 模式对比

| 指标 | 完整 JRE | jlink + CDS | Native Image |
|------|---------|-------------|--------------|
| 构建时间 | ~30s | ~2min | ~10-20min |
| 镜像大小 | ~500MB | ~430MB | ~100MB |
| 启动时间 | ~15s | ~10s | ~100ms |
| 运行内存 | ~300MB | ~300MB | ~50MB |
| 构建内存需求 | 2GB | 4GB | 8GB+ |
| 调试支持 | 完整 | 完整 | 有限 |
| JFR/JMX | 支持 | 支持 | 不支持 |
| 推荐场景 | 开发/测试 | 预发/生产 | 生产 |

## 管理部署

```bash
# 查看日志
docker compose -f docker-compose.jlink.yml logs -f archforge

# 重启后端
docker compose -f docker-compose.jlink.yml restart archforge

# 停止所有
docker compose -f docker-compose.jlink.yml down

# 停止并重置数据库
docker compose -f docker-compose.jlink.yml down -v

# 仅重建后端
docker compose -f docker-compose.jlink.yml up -d --build archforge
```

## 相关页面

- [生产部署指南](./production.md) — 生产环境加固检查清单
- [数据库迁移](../guide/database-migration.md) — Flyway 在 Docker 启动时自动执行
- [配置说明](../guide/configuration.md) — 环境变量映射
