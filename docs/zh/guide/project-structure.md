# 项目结构

ArchForge 采用领域驱动的多模块架构。每个模块职责清晰、边界明确。

## 后端（ArchForge）

```
ArchForge/
├── common/                          # 公共库
│   ├── common-core/                 # 核心工具
│   │   └── src/main/java/
│   │       ├── enums/               # BasicEnum, DictionaryEnum
│   │       ├── repository/          # BaseEntity, base repository
│   │       ├── utils/               # Encryption, IP, string utilities
│   │       └── annotation/          # @Sensitive, @Dictionary, @BaseInfo
│   └── common-error/                # 错误处理
│       └── src/main/java/
│           ├── ErrorCode.java       # Error code interface
│           ├── ErrorInfo.java       # Error response model
│           └── BizException.java    # Business exception base class
│
├── infrastructure/                  # 横切关注点
│   └── src/main/java/
│       ├── auth/                    # Authentication service, JWT, login models
│       ├── config/                  # ArchForgeConfig, SwaggerConfig, CaptchaConfig
│       ├── db/                      # RedisUtil, GroupDataSourceProxy
│       ├── frame/
│       │   ├── context/             # RequestContext, RequestIDGenerator
│       │   ├── filters/             # AuthResourceFilter, RequestLogFilter
│       │   ├── response/            # ResultValueWrapper, ErrorExceptionHandle
│       │   ├── database/            # GroupDataSourceProxy (dynamic-datasource bridge)
│       │   └── spring/              # ApplicationContextHolder
│       └── user/                    # BaseLoginUser, UserProvider SPI
│
├── domain/                          # 业务逻辑模块
│   └── admin-user/                  # 用户管理限界上下文
│       └── src/main/java/
│           ├── domain/              # JPA entities
│           │   ├── SysUser.java
│           │   ├── SysRole.java
│           │   ├── SysMenu.java
│           │   ├── SysDept.java
│           │   ├── SysConfig.java
│           │   ├── SysNotice.java
│           │   ├── SysOperLog.java
│           │   ├── SysLoginLog.java
│           │   └── SysRoleMenu.java
│           ├── dao/                 # Spring Data JPA repositories
│           ├── service/             # Business services
│           ├── menu/                # Menu-specific logic, DTOs, custom repository
│           ├── enums/               # MenuTypeEnum, status enums
│           └── errors/              # AdminUserErrorCode, AdminUserException
│
├── server-admin/                    # Web 应用入口
│   └── src/main/
│       ├── java/
│       │   ├── Application.java     # @SpringBootApplication main class
│       │   ├── controller/
│       │   │   ├── LoginController.java      # Login, captcha, token, routes
│       │   │   ├── AdminApiController.java   # Admin CRUD APIs
│       │   │   └── system/                   # RESTful system controllers
│       │   ├── security/            # Spring Security filter chain config
│       │   └── error/               # Error controller
│       └── resources/
│           ├── application.yaml          # 共享基础配置
│           ├── application-dev.yaml      # 开发环境配置（Testcontainers PostgreSQL、Redis、RustFS）
│           ├── application-test.yaml.example
│           ├── application-prod.yaml.example
│           ├── db/migration/             # Flyway 迁移脚本
│           └── log4j2-spring.xml         # 日志配置（含 SpringProfile）
│
├── example/                         # 示例/扩展模块
│   └── example-task/                # Task domain example
│
├── dependencies/                    # 集中版本管理
│   └── build.gradle.kts            # java-platform BOM
│
├── docker/                          # 部署文件
│   ├── jvm/                         # JVM 模式 + Project Leyden CDS
│   ├── native/                      # Native Image（BellSoft Liberica NIK 25）
│   ├── nginx/default.conf           # Nginx 反向代理配置
│   ├── start.sh                     # 一键启动脚本
│   └── .env.example                 # 环境变量模板
│
├── Dockerfile                       # JVM Docker 镜像（Leyden CDS）
└── Dockerfile.native                # Native Docker 镜像（Liberica NIK 25）
```

## 前端（ArchForgeAdmin）

```
ArchForgeAdmin/
├── src/
│   ├── api/                 # API 端点定义（Axios）
│   ├── assets/              # 静态资源（图片、SVG）
│   ├── components/          # 公共 Vue 组件
│   ├── config/              # 应用配置
│   ├── directives/          # Vue 自定义指令
│   ├── layout/              # 页面布局（侧边栏、顶栏、标签页）
│   ├── plugins/             # 插件注册（Element Plus、i18n）
│   ├── router/              # Vue Router 配置
│   │   └── modules/         # 路由模块定义
│   ├── store/               # Pinia 状态管理
│   │   └── modules/         # Store 模块（user、permission、app）
│   ├── utils/               # 工具函数（auth、http、hasPerms）
│   ├── views/               # 页面组件
│   │   ├── login/           # 登录页
│   │   ├── system/          # 系统管理页面
│   │   └── monitor/         # 服务器监控页
│   └── App.vue              # 根组件
├── Dockerfile               # 基于 Nginx 的 Docker 镜像
├── vite.config.ts           # Vite 配置
├── tailwind.config.ts       # TailwindCSS 配置
└── package.json             # 依赖与脚本
```

## 模块依赖关系

```
server-admin
  ├── infrastructure
  │     ├── common-core
  │     └── common-error
  └── domain/admin-user
        ├── common-core
        └── common-error
```

依赖关系严格自上而下：`server-admin` 依赖 `infrastructure` 和 `domain` 模块，但领域模块绝不依赖 Web 层。这确保了业务逻辑的可移植性和可测试性。

## 关键设计决策

| 决策 | 理由 |
|----------|-----------|
| 多模块 Gradle | 层间边界清晰，支持并行编译 |
| `dependencies/` BOM 模块 | 所有库版本的单一可信源 |
| 按限界上下文划分领域 | `admin-user` 模块可独立替换或扩展 |
| QueryDSL 谓词放在 `domain/` | 类型安全的过滤逻辑紧贴实体 |
| Flyway 脚本放在 `server-admin/resources/` | 迁移脚本随应用一起部署 |
| 独立 `infrastructure/` 模块 | 认证、过滤器和配置可跨领域复用 |

## 相关页面

- [技术栈](/zh/guide/tech-stack.md) — 技术选型说明
- [配置说明](/zh/guide/configuration.md) — YAML 配置结构
- [本地开发环境](/zh/guide/local-setup.md) — IDE 与工具配置
