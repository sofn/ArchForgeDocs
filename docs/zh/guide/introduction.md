# 什么是 ArchForge？

ArchForge 是一套拆成 **五个并列 Git 仓库** 的现代企业级平台：Spring Boot 4.1 后端、Vue 3 管理端、Next.js C 端、本 VitePress 文档站，以及契约仓库。

## 为什么选择 ArchForge？

Java 生态中大多数开源管理框架仍然停留在老旧技术栈上——Spring Boot 2.x、Java 8 以及基于 Webpack 的前端。ArchForge 采用不同方式：从最新稳定版本起步，从第一天起就应用整洁架构。

### 核心亮点

- **Spring Boot 4.1.0 + Java 25** —— 默认启用虚拟线程，无需响应式编程即可实现大规模并发
- **Sa-Token 1.45.0** —— 双登录类型：`StpAdminUtil`（管理端 `:8080`）与 `StpWebUtil`（C 端 `:8081`）；不是 JWT / Spring Security
- **BellSoft Liberica NIK 25 Native Image** —— 可选提前编译，启动约 100ms，内存约 50MB
- **Vue 3 + Vite 8** —— 管理端 UI 运行在 `:8848`，代理到 `:8080`
- **Next.js C 端** —— 面向消费者的站点运行在 `:3000`，请求 `:8081`
- **开发者 CLI** —— 在后端仓库根目录运行 `./archforge`
- **整洁架构** —— 领域驱动的多模块 Gradle 项目，模块带 `archforge-` 前缀
- **Flyway 12.4.0** —— 版本化的数据库结构管理
- **实时服务器监控** —— 通过 Oshi 采集 CPU、内存、JVM 和磁盘指标
- **双模式 Docker 部署** —— Native Image 或 JVM + Leyden CDS
- **文件管理** —— 本地文件系统与 S3（RustFS），可配置扩展名/大小/MIME 白名单
- **定时任务** —— 基于 Quartz 的反射式 Cron 任务，支持暂停/恢复/立即执行
- **国际化** —— 后端与前端默认提供简体中文与英文
- **Spring Modulith 2.0** —— 显式模块边界与依赖校验

## 五个并列仓库

请将五个仓库 **并列克隆**。没有 git submodule。

```
workspace/
├── ArchForge/          # 后端：archforge-server-admin :8080 + archforge-server-web :8081
├── ArchForgeAdmin/     # 管理端（vue-pure-admin）—— 调用 :8080
├── ArchForgeWeb/       # C 端（Next.js）—— 调用 :8081
├── ArchForgeDocs/      # 本文档站（VitePress）
└── ArchForgeSpec/      # 契约 / 架构 / AI 上下文
```

| 仓库 | 职责 | 如何运行 |
|------|------|----------|
| [ArchForge](https://github.com/sofn/ArchForge) | Gradle 多模块后端 | `./gradlew :archforge-server-admin:bootRun` / `:archforge-server-web:bootRun`，或 `./archforge up` |
| [ArchForgeAdmin](https://github.com/sofn/ArchForgeAdmin) | 管理端 UI | `pnpm dev` → `http://localhost:8848` |
| ArchForgeWeb | C 端 UI | `pnpm dev` → `http://localhost:3000` |
| [ArchForgeDocs](https://github.com/sofn/ArchForgeDocs) | 文档 | `npm run docs:dev` |
| ArchForgeSpec | OpenAPI / 架构说明 | 契约只读参考 |

两套应用的 API 信封不同：

- **管理端（`:8080`）** 将 JSON 包装为 `{code, message, data}`
- **C 端（`:8081`）** 错误使用 RFC 9457 `ProblemDetail`

## 与同类项目对比

| 特性 | ArchForge | RuoYi | JeecgBoot | AgileBoot |
|---------|----------|-------|-----------|-----------|
| Spring Boot | **4.1.0** | 2.x | 3.x | 3.x |
| Java 版本 | **25（Azul Zulu，虚拟线程）** | 8 | 8/17 | 17 |
| 构建工具 | **Gradle 9.5.1** | Maven | Maven | Maven |
| 认证 | **Sa-Token 1.45.0** | Spring Security / JWT | Spring Security / JWT | Spring Security |
| 前端 | **Vue 3 + Vite 8 + Next.js** | Vue 3 + Vite | Vue 3 + Vite | Vue 3 + Vite |
| CSS 框架 | **TailwindCSS 4** | 仅 Element Plus | Ant Design Vue | Element Plus |
| 架构 | **五仓库 + DDD 多模块** | 单体包结构 | 代码生成为主 | 分层架构 |
| 数据库迁移 | **Flyway 12.4.0** | 手动 SQL | Liquibase（可选） | 手动 SQL |
| Native Image | **支持（Liberica NIK 25）** | 不支持 | 不支持 | 不支持 |
| ORM | **Spring Data JPA + Metamodel** | MyBatis | MyBatis-Plus | MyBatis-Plus |
| 服务器监控 | **Oshi（内置）** | Oshi | 独立模块 | 无 |
| 多数据源 | **dynamic-datasource（主从分离）** | 仅 Druid | 动态数据源 | 单数据源 |
| API 文档 | **SpringDoc OpenAPI** | Swagger 2 | Swagger/Knife4j | SpringDoc |

## 适用人群

- 正在启动新的企业级管理端 + C 端项目、希望使用现代技术栈的团队
- 厌倦维护 Spring Boot 2.x / Java 8 / JWT 过滤器链代码库的开发者
- 需要容器快速启动以适应云原生部署的组织
- 偏好使用 JPA + Hibernate Static Metamodel 进行类型安全查询而非 MyBatis 的开发者

## 架构概览

模块树见 [项目结构](./project-structure.md)，`./archforge` 见 [命令行工具](./cli.md)，Sa-Token 见 [认证鉴权](../modules/authentication.md)。
