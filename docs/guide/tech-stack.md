# Tech Stack & Architecture Choices

ArchForge adopts modern technologies with clear rationale for each choice.

## Runtime

| Technology | Version | Why |
|-----------|---------|-----|
| JDK | 25 (Azul Zulu) | ScopedValue, Structured Concurrency, Pattern Matching, Stream Gatherers, Virtual Threads |
| Spring Boot | 4.0.5 | Spring Framework 7, Jakarta EE, Observation API, ProblemDetail (RFC 9457) |
| Gradle | 9.4.1 | Configuration cache, Kotlin DSL, java-platform for BOM |

## Database & Storage

| Technology | Version | Why |
|-----------|---------|-----|
| PostgreSQL | 17 | GENERATED ALWAYS AS IDENTITY, advanced JSON, row-level security |
| Flyway | 11.14 | Version-controlled schema migration, repeatable and undo support |
| Redis | 7 | Session cache, rate limiting, distributed locks |
| Dynamic Datasource | 4.5.0 | Master/slave routing, @DS annotation, group proxy for JPA |
| AWS S3 SDK | 2.31 | File storage abstraction (works with RustFS in dev) |

## ORM & Query

| Technology | Version | Why |
|-----------|---------|-----|
| Spring Data JPA | 4.x | Repository abstraction, Specification for dynamic queries |
| Hibernate Static Metamodel | 7.2.x | Compile-time type-safe field references (`Entity_` classes), replaces QueryDSL Q-classes |
| SafeExpr / AliasExpr | -- | Type-safe JPQL expression builder using `SingularAttribute` |
| JPA Criteria API | 3.2 | Type-safe query construction with metamodel, no raw JPQL strings |
| QueryHelp | -- | Annotation-driven dynamic predicate builder for list/search endpoints |

## Web & API

| Technology | Version | Why |
|-----------|---------|-----|
| Spring Security | 7.x | SecurityFilterChain, JWT authentication, RBAC |
| SpringDoc OpenAPI | 2.8 | Auto-generated Swagger UI, schema validation |
| Jackson | 2.21 | JSON serialization, custom converters, sensitive data masking |
| MapStruct | 1.6 | Compile-time type-safe DTO mapping, zero reflection |

## Observability

| Technology | Version | Why |
|-----------|---------|-----|
| Micrometer | 1.16 | Unified metrics API, Observation for metrics+tracing+logging |
| OpenTelemetry | 1.55 | Distributed tracing, OTLP export |
| Log4j2 | (Boot managed) | Async logging, structured output, Spring profile support |
| Spring Actuator | 4.0 | Health checks, Prometheus metrics endpoint |

## Code Quality

| Technology | Version | Why |
|-----------|---------|-----|
| Spotless | 8.4 | Google Java Style (AOSP) enforcement on build |
| google-java-format | 1.35 | Consistent formatting across team |
| JSpecify | 1.0 | Standard null safety annotations (@NullMarked, @Nullable) |
| Lombok | 1.18 | Reduce boilerplate (@Data, @Builder, @RequiredArgsConstructor) |

## Testing

| Technology | Version | Why |
|-----------|---------|-----|
| JUnit | 6.0 (Jupiter) | Modern assertions, parameterized tests |
| Spock | 2.4 (Groovy 5) | BDD-style specs, data-driven testing, mocking |
| Testcontainers | 2.0 | Auto-provisioned PostgreSQL, Redis, RustFS in dev/test |
| RestClient | (Spring) | Integration tests against running application |

## Frontend

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Vue | 3.5 | Reactive UI framework |
| Build | Vite | 8 | Next-gen frontend build tool |
| Language | TypeScript | 6 | Type-safe JavaScript |
| UI Library | Element Plus | 2.13 | Enterprise UI components |
| State | Pinia | 3 | Vue 3 state management |
| Router | Vue Router | 5 | SPA routing |
| CSS | TailwindCSS | 4 | Utility-first CSS framework |
| HTTP | Axios | -- | HTTP client with interceptors |
| i18n | vue-i18n | -- | Internationalization |
| Base Template | vue-pure-admin | -- | Enterprise admin template |

## Deployment

| Technology | Why |
|-----------|-----|
| Docker + jlink | Minimal JRE (~60MB vs ~300MB full JDK) |
| Project Leyden CDS | AOT cache for faster startup |
| Liberica NIK 25 | Native Image option for instant startup |
| Nginx | Reverse proxy, static file serving, SSL termination |

## JDK 25 Features Used

| Feature | Where | Benefit |
|---------|-------|---------|
| ScopedValue | ScopedValueContext | Replace ThreadLocal, virtual-thread safe, auto-cleanup |
| Structured Concurrency | ServerMonitorService | Parallel system info collection, bounded lifecycle |
| Pattern Matching switch | JsonUtil, ErrorHandler, ResultValueWrapper | Cleaner type dispatch, exhaustive checks |
| Stream Gatherers | CollectionUtils.partition() | Built-in windowing, no external deps |
| Virtual Threads | application.yaml | Scalable concurrency for I/O-bound work |
| JSpecify Null Safety | Package-level @NullMarked | Compile-time null checking |

## Related Pages

- [ORM Query Strategy](./orm-query.md) -- type-safe query patterns with Metamodel + SafeExpr
- [Project Structure](./project-structure.md) -- how the modules are organized
- [Dependency Management](./dependency-management.md) -- centralized version control with Gradle BOMs
- [Configuration](./configuration.md) -- runtime configuration for each technology
- [Local Development Setup](./local-setup.md) -- getting your IDE ready
