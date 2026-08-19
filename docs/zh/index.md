---
layout: home

hero:
  name: ArchForge
  text: 五仓库企业级平台
  tagline: Spring Boot 4.1 + Java 25 后端、Vue 3 管理端、Next.js C 端、VitePress 文档与契约仓库，彼此独立、并列克隆。
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: 🚀
    title: Spring Boot 4.1 + Java 25
    details: 基于 Spring Boot 4.1.0 构建，支持 Java 25 虚拟线程、Liberica NIK 原生镜像、Sa-Token 1.45.0。
  - icon: 🎨
    title: Vue 3 管理界面
    details: 基于 vue-pure-admin 的后台界面（:8848 → 管理端 API :8080），集成 Element Plus、Tailwind CSS、动态菜单路由。
  - icon: 🔐
    title: 完整 RBAC
    details: 基于角色的访问控制，使用 Sa-Token（StpAdminUtil / StpWebUtil）、@SaCheckLogin、@SaCheckPermission、动态菜单与数据范围。
  - icon: 🛡️
    title: API 安全
    details: 登录限流（5 次/分钟/IP）、查询参数与请求头 XSS 过滤（跳过 multipart）、HMAC-SHA256 签名与幂等 Token。
  - icon: 📊
    title: 服务监控
    details: 基于 Oshi 的实时 CPU、内存、JVM、磁盘监控，自动刷新仪表盘。
  - icon: 🗄️
    title: 多数据源 + Flyway
    details: 动态数据源路由，支持读写分离。Flyway 12.4.0 管理生产环境数据库。
  - icon: 🐳
    title: Docker 原生 & JVM
    details: 双部署模式 — Liberica NIK 25 原生镜像（约 100ms 启动）或 JVM + Project Leyden CDS。一键部署。
  - icon: 📈
    title: 可观测性
    details: 开箱即用的 Prometheus + Grafana + Jaeger + Alertmanager，支持仪表盘、告警与 OpenTelemetry 1.62.0 Trace。
  - title: 文件管理
    details: 后台直接上传、列表、下载、删除文件。支持本地文件系统或 S3 (RustFS) 后端，可配置扩展名、大小、MIME 白名单。
  - title: 定时任务
    details: 基于 Quartz 的反射式 Cron 任务，支持暂停、恢复、立即执行与执行日志查看。
  - title: 国际化
    details: 后端 Spring MessageSource 与前端 vue-i18n 联动，默认提供简体中文与英文消息。
  - title: Spring Modulith
    details: 显式模块边界、依赖校验与模块文档生成测试，支撑领域与基础设施层的整洁架构。
  - title: 元表格
    details: 低代码动态表设计，支持 Schema 演进、数据 CRUD、导入导出，并可一键生成前后端完整模块脚手架。
  - title: C 端 Web
    details: Next.js C 端应用（:3000 → Web API :8081），支持国际化、Sa-Token（StpWebUtil）、文章仪表盘与 Playwright E2E 测试。
---

## 五个并列仓库

ArchForge 由 **五个独立 Git 仓库** 组成，并列克隆，没有 git submodule。

| 仓库 | 职责 | 本地端口 |
|------|------|----------|
| **ArchForge** | 后端（Gradle）。`archforge-server-admin` + `archforge-server-web` | `:8080` / `:8081` |
| **ArchForgeAdmin** | 管理端 UI（vue-pure-admin） | `:8848` → `:8080` |
| **ArchForgeWeb** | C 端（Next.js） | `:3000` → `:8081` |
| **ArchForgeDocs** | 本 VitePress 文档站点 | `npm run docs:dev` |
| **ArchForgeSpec** | 契约 / 架构 / AI 上下文 | — |

开发者 CLI 位于后端仓库：在 ArchForge 根目录运行 `./archforge`。参见 [命令行工具](/zh/guide/cli)。
