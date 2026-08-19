# 技术栈与架构选型

ArchForge 采用现代技术，每项选择都有清晰的考量。

## 运行时

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| JDK | 25 (Azul Zulu) | ScopedValue、结构化并发、模式匹配、Stream Gatherers、虚拟线程 |
| Spring Boot | 4.1.0 | Spring Framework 7、Jakarta EE、Observation API、ProblemDetail (RFC 9457) |
| Gradle | 9.5.1 | 配置缓存、Kotlin DSL、java-platform 实现 BOM |

## 数据库与存储

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| PostgreSQL | 17 | GENERATED ALWAYS AS IDENTITY、高级 JSON 支持、行级安全 |
| Flyway | 12.4.0 | 版本化的数据库结构迁移，PostgreSQL 方言模块 |
| Redis | 7 | 会话缓存、限流、分布式锁 |
| Dynamic Datasource | 4.5.0 | 主从路由、@DS 注解、JPA 组代理 |
| AWS S3 SDK | 2.x | 文件存储抽象（开发环境配合 RustFS 使用） |

## ORM 与查询

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Spring Data JPA | 4.x | Repository 抽象、Specification 动态查询 |
| Hibernate Static Metamodel | 7.x | 编译期类型安全的字段引用（`Entity_` 类） |
| SafeExpr / AliasExpr | -- | 基于 `SingularAttribute` 的类型安全 JPQL 表达式构建器 |
| JPA Criteria API | 3.2 | 使用 Metamodel 构造查询，避免原始 JPQL 字符串 |
| QueryHelp | -- | 注解驱动的列表/搜索动态谓词构建器 |

## Web 与 API

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Sa-Token | 1.45.0 | 双 STP 类型：`StpAdminUtil`（管理端）与 `StpWebUtil`（C 端）。不是 JWT / Spring Security |
| SpringDoc OpenAPI | 3.0.x | 自动生成 Swagger UI、Schema 校验 |
| Jackson | （Boot 管理） | JSON 序列化、自定义转换器、敏感数据脱敏 |
| MapStruct | 1.6 | 编译期类型安全的 DTO 映射，零反射 |

## 可观测性

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Micrometer | （Boot 管理） | 统一指标 API，Observation 整合指标+链路追踪+日志 |
| OpenTelemetry | 1.62.0 | 分布式链路追踪、OTLP 导出 |
| Log4j2 | （Boot 管理） | 异步日志、结构化输出、Spring Profile 支持 |
| Spring Actuator | 4.1 | 健康检查、Prometheus 指标端点 |

## 代码质量

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Spotless | 8.4 | 构建时强制执行 Google Java Style (AOSP) |
| google-java-format | 1.35 | 团队统一的代码格式 |
| JSpecify | 1.0 | 标准空安全注解（@NullMarked、@Nullable） |
| Lombok | 1.18.46 | 减少样板代码（@Data、@Builder、@RequiredArgsConstructor） |

## 测试

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| JUnit | 6.0 (Jupiter) | 现代断言、参数化测试 |
| Spock | 2.4 (Groovy 5) | BDD 风格规范、数据驱动测试、Mock |
| Testcontainers | 2.0 | 开发/测试环境自动配置 PostgreSQL、Redis、RustFS |
| RestClient | （Spring 内置） | 针对运行中应用的集成测试 |

## 前端

| 类别 | 技术 | 版本 | 用途 |
|----------|-----------|---------|---------|
| 框架 | Vue | 3.5 | 响应式 UI 框架 |
| 构建 | Vite | 8 | 新一代前端构建工具 |
| 语言 | TypeScript | 6 | 类型安全的 JavaScript |
| UI 库 | Element Plus | 2.13 | 企业级 UI 组件 |
| 状态管理 | Pinia | 3 | Vue 3 状态管理 |
| 路由 | Vue Router | 5 | SPA 路由 |
| CSS | TailwindCSS | 4 | 原子化 CSS 框架 |
| HTTP | Axios | -- | 带拦截器的 HTTP 客户端 |
| 国际化 | vue-i18n | -- | 多语言支持 |
| 基础模板 | vue-pure-admin | -- | 企业级后台管理模板 |
| 开发端口 | 8848 | -- | 代理到管理端 API `:8080` |

## 前端（C 端）

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | Next.js | 16.x | React 框架，App Router |
| UI | React | 19.x | 组件库 |
| 语言 | TypeScript | 7.x | 类型安全的 JavaScript |
| 样式 | Tailwind CSS | 4.x | 原子化 CSS |
| 组件 | shadcn/ui + lucide-react | -- | 无头 UI 原语与图标 |
| 国际化 | next-intl | -- | 英文 / 中文多语言 |
| 认证 | Sa-Token（`StpWebUtil`） | 1.45.0 | C 端 Token 认证 |
| Markdown | react-markdown + remark-gfm + rehype-highlight | -- | 文章内容渲染 |
| E2E 测试 | Playwright | -- | 端到端测试 |
| 组件文档 | Storybook | -- | 可视化组件文档 |
| 构建 | Turborepo + pnpm workspaces | -- | Monorepo 编排 |
| 开发端口 | 3000 | -- | 请求 Web API `:8081` |

## 部署

| 技术 | 选型理由 |
|-----------|-----|
| Docker + jlink | 最小化 JRE（约 60MB，完整 JDK 约 300MB） |
| Project Leyden CDS | AOT 缓存加速启动 |
| Liberica NIK 25 | Native Image 选项，实现即时启动 |
| Nginx | 反向代理、静态文件服务、SSL 终止 |
| `./archforge` | 开发者 CLI，覆盖 init / infra / db / up |

## 使用的 JDK 25 特性

| 特性 | 使用位置 | 收益 |
|---------|-------|---------|
| ScopedValue | ScopedValueContext | 替代 ThreadLocal，虚拟线程安全，自动清理 |
| 结构化并发 | ServerMonitorService | 并行采集系统信息，生命周期可控 |
| 模式匹配 switch | JsonUtil、ErrorHandler、ResultValueWrapper | 更简洁的类型分派，穷举检查 |
| Stream Gatherers | CollectionUtils.partition() | 内置窗口操作，无需外部依赖 |
| 虚拟线程 | application.yaml | 可扩展的 I/O 密集型并发 |
| JSpecify 空安全 | 包级别 @NullMarked | 编译期空值检查 |

## 相关页面

- [项目结构](/zh/guide/project-structure.md) -- 模块组织方式
- [命令行工具](/zh/guide/cli.md) -- `./archforge` 开发命令
- [依赖管理](/zh/guide/dependency-management.md) -- 使用 Gradle BOM 集中管理版本
- [配置说明](/zh/guide/configuration.md) -- 各项技术的运行时配置
- [本地开发环境](/zh/guide/local-setup.md) -- IDE 配置指南
