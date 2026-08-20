# ADR 0004 — JPA + 静态元模型，而不是 MyBatis

**状态：** 已接受

## 背景

RuoYi / JeecgBoot / AgileBoot 默认 MyBatis 或 MyBatis-Plus。XML mapper 与实体会漂移。ArchForge 已经用 DDD 聚合和 Hibernate。

## 决策

Spring Data JPA + Hibernate Static Metamodel（`Entity_`）+ `QueryHelp` / `SafeExpr` 做动态过滤。Flyway 管 schema。

## 后果

编译期字段名类型安全。元表格代码生成产出 JPA，不是 Mapper XML。从 MyBatis 过来的团队需要短适应期，可接受。
