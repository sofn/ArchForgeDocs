# Project Structure

ArchForge follows a domain-driven, multi-module architecture. Each module has a clear responsibility and well-defined boundaries.

## Backend (ArchForge)

```
ArchForge/
├── common/                          # Shared libraries
│   ├── common-core/                 # Core utilities
│   │   └── src/main/java/
│   │       ├── enums/               # BasicEnum, DictionaryEnum
│   │       ├── repository/          # BaseEntity, base repository
│   │       ├── utils/               # Encryption, IP, string utilities
│   │       └── annotation/          # @Sensitive, @Dictionary, @BaseInfo
│   └── common-error/                # Error handling
│       └── src/main/java/
│           ├── ErrorCode.java       # Error code interface
│           ├── ErrorInfo.java       # Error response model
│           └── BizException.java    # Business exception base class
│
├── infrastructure/                  # Cross-cutting concerns
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
├── domain/                          # Business logic modules
│   └── admin-user/                  # User management bounded context
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
├── server-admin/                    # Web application entry point
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
│           ├── application.yaml          # Shared base configuration
│           ├── application-dev.yaml      # Dev profile (Testcontainers PostgreSQL, Redis, RustFS)
│           ├── application-test.yaml.example
│           ├── application-prod.yaml.example
│           ├── db/migration/             # Flyway migration scripts
│           └── log4j2-spring.xml         # Logging config with SpringProfile
│
├── example/                         # Example/extension modules
│   └── example-task/                # Task domain example
│
├── dependencies/                    # Centralized version management
│   └── build.gradle.kts            # java-platform BOM
│
├── docker/                          # Deployment files
│   ├── jvm/                         # JVM mode with Project Leyden CDS
│   ├── native/                      # Native Image (BellSoft Liberica NIK 25)
│   ├── nginx/default.conf           # Nginx reverse proxy config
│   ├── start.sh                     # One-click startup script
│   └── .env.example                 # Environment variable template
│
├── Dockerfile                       # JVM Docker image (Leyden CDS)
└── Dockerfile.native                # Native Docker image (Liberica NIK 25)
```

## Frontend (ArchForgeAdmin)

```
ArchForgeAdmin/
├── src/
│   ├── api/                 # API endpoint definitions (Axios)
│   ├── assets/              # Static assets (images, SVGs)
│   ├── components/          # Shared Vue components
│   ├── config/              # App configuration
│   ├── directives/          # Vue custom directives
│   ├── layout/              # Page layouts (sidebar, header, tabs)
│   ├── plugins/             # Plugin registrations (Element Plus, i18n)
│   ├── router/              # Vue Router configuration
│   │   └── modules/         # Route module definitions
│   ├── store/               # Pinia state stores
│   │   └── modules/         # Store modules (user, permission, app)
│   ├── utils/               # Utility functions (auth, http, hasPerms)
│   ├── views/               # Page components
│   │   ├── login/           # Login page
│   │   ├── system/          # System management pages
│   │   └── monitor/         # Server monitoring page
│   └── App.vue              # Root component
├── Dockerfile               # Nginx-based Docker image
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # TailwindCSS configuration
└── package.json             # Dependencies and scripts
```

## Module Dependencies

```
server-admin
  ├── infrastructure
  │     ├── common-core
  │     └── common-error
  └── domain/admin-user
        ├── common-core
        └── common-error
```

The dependency flow is strictly top-down: `server-admin` depends on `infrastructure` and `domain` modules, but domain modules never depend on the web layer. This ensures business logic remains portable and testable.

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| Multi-module Gradle | Clear boundaries between layers, parallel compilation |
| `dependencies/` BOM module | Single source of truth for all library versions |
| Domain per bounded context | `admin-user` module can be replaced or extended independently |
| QueryDSL predicates in `domain/` | Type-safe filtering logic stays close to entities |
| Flyway scripts in `server-admin/resources/` | Migration scripts deploy with the application |
| Separate `infrastructure/` | Auth, filters, and config are reusable across domains |

## Related Pages

- [Tech Stack](./tech-stack.md) — technology choices explained
- [Configuration](./configuration.md) — YAML config structure
- [Local Development Setup](./local-setup.md) — IDE and tooling
