# 技术栈与架构选型

ArchForge 采用现代技术，每项选择都有清晰的考量。

## 运行时

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| JDK | 25 (Azul Zulu) | ScopedValue、结构化并发、模式匹配、Stream Gatherers、虚拟线程 |
| Spring Boot | 4.0.5 | Spring Framework 7、Jakarta EE、Observation API、ProblemDetail (RFC 9457) |
| Gradle | 9.4.1 | 配置缓存、Kotlin DSL、java-platform 实现 BOM |

## 数据库与存储

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| PostgreSQL | 17 | GENERATED ALWAYS AS IDENTITY、高级 JSON 支持、行级安全 |
| Flyway | 11.14 | 版本化的数据库结构迁移，支持可重复和回退脚本 |
| Redis | 7 | 会话缓存、限流、分布式锁 |
| Dynamic Datasource | 4.5.0 | 主从路由、@DS 注解、JPA 组代理 |
| AWS S3 SDK | 2.31 | 文件存储抽象（开发环境配合 RustFS 使用） |

## Web 与 API

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Spring Security | 7.x | SecurityFilterChain、JWT 认证、RBAC |
| SpringDoc OpenAPI | 2.8 | 自动生成 Swagger UI、Schema 校验 |
| Jackson | 2.21 | JSON 序列化、自定义转换器、敏感数据脱敏 |
| MapStruct | 1.6 | 编译期类型安全的 DTO 映射，零反射 |

## 可观测性

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Micrometer | 1.16 | 统一指标 API，Observation 整合指标+链路追踪+日志 |
| OpenTelemetry | 1.55 | 分布式链路追踪、OTLP 导出 |
| Log4j2 | （Boot 管理） | 异步日志、结构化输出、Spring Profile 支持 |
| Spring Actuator | 4.0 | 健康检查、Prometheus 指标端点 |

## 代码质量

| 技术 | 版本 | 选型理由 |
|-----------|---------|-----|
| Spotless | 8.4 | 构建时强制执行 Google Java Style (AOSP) |
| google-java-format | 1.35 | 团队统一的代码格式 |
| JSpecify | 1.0 | 标准空安全注解（@NullMarked、@Nullable） |
| Lombok | 1.18 | 减少样板代码（@Data、@Builder、@RequiredArgsConstructor） |

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

## 部署

| 技术 | 选型理由 |
|-----------|-----|
| Docker + jlink | 最小化 JRE（约 60MB，完整 JDK 约 300MB） |
| Project Leyden CDS | AOT 缓存加速启动 |
| Liberica NIK 25 | Native Image 选项，实现即时启动 |
| Nginx | 反向代理、静态文件服务、SSL 终止 |

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
- [依赖管理](/zh/guide/dependency-management.md) -- 使用 Gradle BOM 集中管理版本
- [配置说明](/zh/guide/configuration.md) -- 各项技术的运行时配置
- [本地开发环境](/zh/guide/local-setup.md) -- IDE 配置指南
