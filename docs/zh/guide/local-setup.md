# 本地开发环境配置

开发环境搭建详细指南。

## Java 25

ArchForge 需要 Java 25。推荐使用 [SDKMAN](https://sdkman.io/) 管理 JDK 安装：

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash

# Install Azul Zulu 25
sdk install java 25-zulu

# Verify
java -version
echo $JAVA_HOME
```

也可以直接从 [Azul Zulu](https://www.azul.com/downloads/?version=java-25-ea&package=jdk) 或 [Adoptium](https://adoptium.net/) 下载。

::: warning
请确保 `JAVA_HOME` 设置正确。如果 Gradle 检测到不同的 Java 版本，会给出明确的错误提示。
:::

## IDE 配置

### IntelliJ IDEA（推荐）

1. **打开项目**：File → Open → 选择 `ArchForge/` 根目录
2. **Gradle 导入**：IntelliJ 自动检测 `build.gradle.kts` 并导入所有模块
3. **JDK 设置**：File → Project Structure → Project SDK → 选择 Java 25
4. **Lombok 插件**：Settings → Plugins → 搜索 "Lombok" → 安装
5. **注解处理**：Settings → Build → Compiler → Annotation Processors → 启用
6. **代码风格**：导入 Google Java Style（由 Spotless 强制执行）

### VS Code

1. 安装扩展：`Extension Pack for Java`、`Gradle for Java`
2. 在设置中将 `java.configuration.runtimes` 指向 JDK 25
3. 安装 Lombok 支持：`vscjava.vscode-lombok`

## Gradle 使用技巧

```bash
# Full build
./gradlew build

# Build without tests (faster)
./gradlew build -x test

# Run only backend
./gradlew server-admin:bootRun

# Run specific test class
./gradlew :server-admin:test --tests "com.lesofn.archforge.*"

# Check code formatting
./gradlew spotlessCheck

# Auto-fix code formatting
./gradlew spotlessApply

# Clean build (useful when switching branches)
./gradlew clean build
```

::: tip
Gradle 9.4.1 支持配置缓存。首次构建后，后续构建速度将显著提升。
:::

## 开发环境特性

使用默认的 `dev` 配置时，以下功能会自动配置：

| 特性 | 行为 |
|---------|----------|
| 数据库 | Testcontainers PostgreSQL（通过 Docker 自动启动） |
| Redis | Testcontainers Redis（通过 Docker 自动启动） |
| 文件存储 | Testcontainers RustFS（S3 兼容，通过 Docker 自动启动） |
| 表结构 | Hibernate DDL `auto=update`（自动创建表） |
| 种子数据 | 通过 `InitDbMockServer` 自动加载 |
| Flyway | 已禁用（开发环境不需要） |
| 验证码 | 已禁用（登录时跳过验证码） |
| DevTools | 热重载已启用，LiveReload 端口 35729 |
| Swagger UI | 访问地址：`http://localhost:8080/swagger-ui/index.html` |
| 链路追踪 | 100% 采样率，发送至本地 OTLP 端点 |

## 热重载

开发模式下 Spring Boot DevTools 已启用。修改 Java 文件并重新编译（IntelliJ 中按 Ctrl+F9）后，应用会自动重启。

监控的路径：
- `src/main/java`
- `src/main/resources`

排除在重启范围之外的路径：
- `static/**`
- `public/**`

## Testcontainers（开发服务）

在开发模式下，运行 `./gradlew server-admin:bootRun` 时，Testcontainers 会自动启动 PostgreSQL、Redis 和 RustFS 的 Docker 容器。无需手动配置。

::: tip
启动后端之前，请确保 Docker Desktop（或 Docker Engine）正在运行。Testcontainers 会在首次启动时拉取所需的镜像。
:::

自动启动的服务：

| 服务 | 容器镜像 | 用途 |
|---------|----------------|---------|
| PostgreSQL | `postgres:17` | 主数据库 |
| Redis | `redis:7-alpine` | 会话缓存、数据缓存 |
| RustFS | `rustfs/rustfs` | S3 兼容文件存储 |

## 前端开发

```bash
cd ArchForgeAdmin

# Install dependencies
pnpm install

# Start dev server (http://localhost:8848)
pnpm dev

# Build for production
pnpm build

# Lint and format
pnpm lint
```

前端开发服务器默认将 API 请求代理到 `http://localhost:8080`。

## 常见问题排查

| 问题 | 解决方案 |
|---------|----------|
| `Unsupported class file major version 69` | Java 版本错误——请确保 JAVA_HOME 指向 JDK 25 |
| 端口 8080 已被占用 | 终止已有进程，或在 YAML 中修改 `server.port` |
| Testcontainers 启动失败 | 确保 Docker 正在运行；检查 `docker ps` 和 Docker 日志 |
| Gradle 构建卡住 | 运行 `./gradlew --stop` 终止守护进程，然后重新构建 |
| Redis 连接被拒绝 | 确保 Docker 正在运行——Testcontainers 会自动启动 Redis |

## 相关页面

- [快速开始](/zh/guide/quick-start.md) — 最简安装指南
- [配置说明](/zh/guide/configuration.md) — 自定义 YAML 配置
- [项目结构](/zh/guide/project-structure.md) — 模块概览
