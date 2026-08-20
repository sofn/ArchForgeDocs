# ADR 0004 — JPA + static metamodel instead of MyBatis

**Status:** accepted

## Context

RuoYi / JeecgBoot / AgileBoot default to MyBatis or MyBatis-Plus. XML mappers drift from entities. ArchForge already uses DDD aggregates and Hibernate.

## Decision

Spring Data JPA + Hibernate Static Metamodel (`Entity_` classes) + `QueryHelp` / `SafeExpr` for dynamic filters. Flyway owns schema.

## Consequences

Type-safe field names at compile time. Codegen (meta-table) emits JPA, not Mapper XML. Teams coming from MyBatis need a short ramp; that is accepted.
