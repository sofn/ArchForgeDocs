# 项目结构

ArchForge 由 **五个独立 Git 仓库** 并列组成。后端本身是领域驱动的多模块 Gradle 工程。每个 Gradle 模块名都以 `archforge-` 为前缀。

## 五个并列仓库

```
workspace/
├── ArchForge/          # 后端（本 Gradle 工程）
├── ArchForgeAdmin/     # 管理端 UI（vue-pure-admin）:8848 → :8080
├── ArchForgeWeb/       # C 端 UI（Next.js）:3000 → :8081
├── ArchForgeDocs/      # VitePress 文档
└── ArchForgeSpec/      # 契约 / 架构 / AI 上下文
```

没有 git submodule。契约位于 ArchForgeSpec；本文档仓库只做说明。

## 后端（ArchForge）

```
ArchForge/
├── archforge                         # CLI 启动脚本（`./archforge`）
├── archforge-cli/                    # picocli 开发者 CLI（不依赖 Spring）
├── archforge-common/                 # 公共库
│   ├── archforge-common-base/        # 核心工具
│   │   └── src/main/java/
│   │       ├── enums/               # BasicEnum, DictionaryEnum
│   │       ├── utils/               # Encryption, IP, Jackson, i18n utilities
│   │       ├── sensitive/           # @Sensitive 脱敏
│   │       └── validation/          # 校验注解
│   ├── archforge-common-error/       # 错误处理
│   │   └── src/main/java/
│   │       ├── ErrorCode.java
│   │       ├── ErrorInfo.java       # {code, message}
│   │       └── BizException.java
│   └── archforge-common-jpa/         # JPA 基础设施
│       └── src/main/java/
│           ├── repository/          # BaseEntity, JPA converters
│           ├── utils/query/         # QueryHelp, SafeExpr, AliasExpr
│           └── annotation/          # @Query
│
├── archforge-infrastructure/         # 横切关注点
│   └── src/main/java/
│       ├── annotation/              # @Log, @RepeatSubmit, @RateLimit
│       ├── auth/                    # Sa-Token：StpAdminUtil、StpWebUtil、LoginContext
│       ├── config/                  # ArchForgeProperties、Swagger、I18n
│       ├── file/                    # FileStorageService，自适应 local/S3
│       ├── web/                     # XssFilter（查询参数/请求头；跳过 multipart）
│       ├── frame/
│       │   ├── context/             # RequestContext, RequestIDGenerator
│       │   ├── filters/             # RequestLogFilter
│       │   ├── response/            # ResultValueWrapper, ErrorExceptionHandle
│       │   └── interceptor/         # RepeatSubmitInterceptor
│       └── user/                    # BaseLoginUser, UserProvider SPI
│
├── archforge-domain/                 # 业务逻辑模块
│   ├── archforge-admin-user/         # 用户 / 角色 / 菜单 / 部门
│   ├── archforge-blog/               # 博客限界上下文
│   └── archforge-meta-table/         # 元表格 / 代码生成
│
├── archforge-server-admin/           # 管理端 API 入口（:8080）
│   └── src/main/
│       ├── java/
│       │   ├── .../Application.java
│       │   └── controller/          # 登录、文件、定时任务、监控、系统 CRUD
│       └── resources/
│           ├── application.yaml
│           ├── application-dev.yaml
│           ├── application-test.yaml
│           ├── application-prod.yaml
│           ├── db/migration/        # Flyway 脚本
│           └── log4j2-spring.xml
│
├── archforge-server-web/             # C 端 API 入口（:8081）
│
├── archforge-example/
│   └── archforge-example-task/       # 示例限界上下文
│
├── archforge-starters/               # cache / lock / redisson / trace
├── archforge-dependencies/           # 集中 BOM（java-platform）
│
├── docker/                           # 部署文件
└── skills/                           # Agent skill 片段
```

## 前端（ArchForgeAdmin）

```
ArchForgeAdmin/
├── src/
│   ├── api/                 # API 端点定义（Axios）
│   ├── assets/              # 静态资源
│   ├── components/          # 公共 Vue 组件
│   ├── config/              # 应用配置
│   ├── directives/          # Vue 自定义指令
│   ├── layout/              # 页面布局
│   ├── plugins/             # 插件注册
│   ├── router/              # Vue Router 配置
│   ├── store/               # Pinia 状态管理
│   ├── utils/               # 工具函数
│   ├── views/               # 页面组件
│   └── App.vue
├── Dockerfile
├── vite.config.ts
└── package.json
```

开发服务器：`http://localhost:8848`，代理到 `http://localhost:8080`。

## C 端（ArchForgeWeb）

Next.js App Router 应用。开发服务器：`http://localhost:3000`，请求 `http://localhost:8081`。详见 [C 端 Web](/zh/guide/c-end-web.md)。

## 模块依赖关系

```
archforge-server-admin / archforge-server-web
  ├── archforge-infrastructure
  │     ├── archforge-common-base
  │     ├── archforge-common-jpa
  │     └── archforge-common-error
  └── archforge-domain/*
        ├── archforge-common-base
        ├── archforge-common-jpa
        └── archforge-common-error
```

依赖关系严格自上而下：server 模块依赖 infrastructure 和 domain，领域模块绝不依赖 Web 层。

Gradle 任务名使用带前缀的项目路径：

```bash
./gradlew :archforge-server-admin:bootRun
./gradlew :archforge-server-web:bootRun
./gradlew :archforge-server-admin:test
./gradlew :archforge-cli:shadowJar
```

## 关键设计决策

| 决策 | 理由 |
|----------|-----------|
| 五个并列仓库 | 后端、管理端、C 端、文档、契约可独立发布 |
| `archforge-` Gradle 前缀 | 避免模块名冲突，与发布的 artifact ID 一致 |
| `archforge-dependencies/` BOM | 所有库版本的单一可信源 |
| 按限界上下文划分领域 | `archforge-admin-user` 可独立替换或扩展 |
| 拆分 common 模块 | 工具、错误、持久化关注点隔离 |
| Flyway 脚本放在 `archforge-server-admin/resources/` | 迁移脚本随管理端应用一起部署 |
| 独立 `archforge-infrastructure/` | 认证、过滤器、文件存储、国际化、配置可跨领域复用 |
| 双 Server | 管理端（`:8080`，`{code,message,data}`）与 C 端（`:8081`，ProblemDetail） |

## 相关页面

- [技术栈](/zh/guide/tech-stack.md) — 技术选型说明
- [命令行工具](/zh/guide/cli.md) — `./archforge` 命令
- [配置说明](/zh/guide/configuration.md) — YAML 配置结构
- [本地开发环境](/zh/guide/local-setup.md) — IDE 与工具配置
