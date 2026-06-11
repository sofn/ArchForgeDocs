# 什么是 ArchForge？

ArchForge 是一个基于 **Spring Boot 4** 和 **Vue 3** 构建的现代企业级管理平台，专为希望使用最新 Java 和前端技术的团队打造，提供开箱即用的生产级管理系统。

## 为什么选择 ArchForge？

Java 生态中大多数开源管理框架仍然停留在老旧技术栈上——Spring Boot 2.x、Java 8 以及基于 Webpack 的前端。ArchForge 采用了不同的方式：从最新的稳定版本起步，从第一天起就应用整洁架构。

### 核心亮点

- **Spring Boot 4.0.5 + Java 25** —— 默认启用虚拟线程，无需响应式编程即可实现大规模并发
- **BellSoft Liberica NIK 25 Native Image** —— 可选的提前编译，启动时间约 100ms，内存占用约 50MB
- **Vue 3 + Vite 8** —— 即时热更新、Tree-shaking 和 TypeScript 优先的前端开发
- **整洁架构** —— 领域驱动的多模块 Gradle 项目，而非单体式 `src/` 堆砌
- **Flyway 迁移** —— 版本化的数据库结构管理，告别手动 SQL 脚本
- **实时服务器监控** —— 通过 Oshi 采集 CPU、内存、JVM 和磁盘指标，可在管理面板中查看
- **双模式 Docker 部署** —— 可选择 Native Image（快速启动）或 JVM + Leyden CDS（便于调试）
- **文件上传/下载** —— 可插拔的存储后端，支持本地文件系统和 S3（RustFS）

## 与同类项目对比

| 特性 | ArchForge | RuoYi | JeecgBoot | AgileBoot |
|---------|----------|-------|-----------|-----------|
| Spring Boot | **4.0.5** | 2.x | 3.x | 3.x |
| Java 版本 | **25（Azul Zulu，虚拟线程）** | 8 | 8/17 | 17 |
| 构建工具 | **Gradle 9.4.1** | Maven | Maven | Maven |
| 前端 | **Vue 3 + Vite 8** | Vue 3 + Vite | Vue 3 + Vite | Vue 3 + Vite |
| CSS 框架 | **TailwindCSS 4** | 仅 Element Plus | Ant Design Vue | Element Plus |
| 架构 | **DDD 多模块** | 单体包结构 | 代码生成为主 | 分层架构 |
| 数据库迁移 | **Flyway** | 手动 SQL | Liquibase（可选） | 手动 SQL |
| Native Image | **支持（Liberica NIK 25，约 100ms 启动）** | 不支持 | 不支持 | 不支持 |
| ORM | **Spring Data JPA + QueryDSL** | MyBatis | MyBatis-Plus | MyBatis-Plus |
| 服务器监控 | **Oshi（内置）** | Oshi | 独立模块 | 无 |
| 多数据源 | **dynamic-datasource（主从分离）** | 仅 Druid | 动态数据源 | 单数据源 |
| API 文档 | **SpringDoc OpenAPI 3.0** | Swagger 2 | Swagger/Knife4j | SpringDoc |

## 适用人群

- 正在启动新的企业级管理项目、希望使用现代技术栈的团队
- 厌倦了维护 Spring Boot 2.x / Java 8 遗留代码库的开发者
- 需要容器快速启动以适应云原生部署的组织
- 偏好使用 JPA/QueryDSL 进行类型安全查询而非 MyBatis 的开发者

## 架构概览
