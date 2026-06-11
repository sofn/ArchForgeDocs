# What is ArchForge?

ArchForge is a modern enterprise admin platform built with **Spring Boot 4** and **Vue 3**, designed for teams that want a production-ready management system with the latest Java and frontend technologies.

## Why ArchForge?

Most open-source admin frameworks in the Java ecosystem are stuck on older stacks — Spring Boot 2.x, Java 8, and Webpack-based frontends. ArchForge takes a different approach: start fresh with the newest stable releases and apply clean architecture from day one.

### Core Highlights

- **Spring Boot 4.0.5 + Java 25** — virtual threads enabled by default for massive concurrency without reactive complexity
- **BellSoft Liberica NIK 25 Native Image** — optional ahead-of-time compilation for ~100ms startup and ~50MB memory footprint
- **Vue 3 + Vite 8** — instant HMR, tree-shaking, and TypeScript-first frontend development
- **Clean Architecture** — domain-driven multi-module Gradle project, not a monolithic `src/` dump
- **Flyway Migrations** — version-controlled schema management instead of manual SQL scripts
- **Real-time Server Monitoring** — CPU, memory, JVM, and disk metrics via Oshi, viewable in the admin panel
- **Dual Docker Deployment** — choose between Native Image (fast startup) or JVM with Leyden CDS (easy debugging)
- **File Upload/Download** — pluggable storage backends with local filesystem and S3 (RustFS) support

## Comparison with Similar Projects

| Feature | ArchForge | RuoYi | JeecgBoot | AgileBoot |
|---------|----------|-------|-----------|-----------|
| Spring Boot | **4.0.5** | 2.x | 3.x | 3.x |
| Java Version | **25 (Azul Zulu, virtual threads)** | 8 | 8/17 | 17 |
| Build Tool | **Gradle 9.4.1** | Maven | Maven | Maven |
| Frontend | **Vue 3 + Vite 8** | Vue 3 + Vite | Vue 3 + Vite | Vue 3 + Vite |
| CSS Framework | **TailwindCSS 4** | Element Plus only | Ant Design Vue | Element Plus |
| Architecture | **DDD multi-module** | Monolithic packages | Code generation focused | Layered |
| DB Migration | **Flyway** | Manual SQL | Liquibase (optional) | Manual SQL |
| Native Image | **Yes (Liberica NIK 25, ~100ms startup)** | No | No | No |
| ORM | **Spring Data JPA + QueryDSL** | MyBatis | MyBatis-Plus | MyBatis-Plus |
| Server Monitor | **Oshi (built-in)** | Oshi | Separate module | No |
| Multi-datasource | **dynamic-datasource (master/slave)** | Druid only | Dynamic datasource | Single |
| API Docs | **SpringDoc OpenAPI 3.0** | Swagger 2 | Swagger/Knife4j | SpringDoc |

## Who is it for?

- Teams starting new enterprise admin projects who want a modern stack
- Developers tired of maintaining Spring Boot 2.x / Java 8 legacy codebases
- Organizations that need fast container startup for cloud-native deployments
- Anyone who prefers JPA/QueryDSL over MyBatis for type-safe queries

## Architecture Overview

