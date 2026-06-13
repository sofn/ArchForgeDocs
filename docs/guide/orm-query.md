# ORM Query Strategy

ArchForge uses **Hibernate Static Metamodel + SafeExpr / AliasExpr** for type-safe database queries, replacing the previous QueryDSL approach.

## Architecture Overview

| Layer | Tool | Purpose |
|-------|------|---------|
| Field References | Hibernate Static Metamodel (`Entity_` classes) | Compile-time type-safe field names |
| JPQL Expressions | `SafeExpr` / `AliasExpr` | Type-safe JPQL fragment builder |
| Dynamic Queries | `QueryHelp` + JPA Specifications | Annotation-driven dynamic predicates |
| Simple Queries | Spring Data JPA method names / `@Query` | Declarative queries |

## Hibernate Static Metamodel

### What It Does

The `hibernate-processor` annotation processor generates `Entity_` metamodel classes at compile time. For each `@Entity` class, a corresponding `Entity_` class is generated with `SingularAttribute` fields:

```java
// Entity
@Entity
@Table(name = "sys_user")
public class SysUser extends BaseEntity<SysUser> {
    @Id private Long userId;
    private String username;
    private String email;
    private Integer status;
}

// Generated: SysUser_ (auto-generated, do NOT edit)
@StaticMetamodel(SysUser.class)
public abstract class SysUser_ extends BaseEntity_ {
    public static volatile SingularAttribute<SysUser, Long> userId;
    public static volatile SingularAttribute<SysUser, String> username;
    public static volatile SingularAttribute<SysUser, String> email;
    public static volatile SingularAttribute<SysUser, Integer> status;
}
```

### Gradle Setup

```kotlin
// build.gradle.kts
dependencies {
    annotationProcessor("org.hibernate.orm:hibernate-processor:7.2.19.Final")
}
```

Generated classes are placed in `build/generated/sources/annotationProcessor/` and are automatically added to the compilation classpath.

## SafeExpr — Static Expression Builder

`SafeExpr` provides static methods for building JPQL expression fragments using metamodel attributes, **without** alias prefixes.

```java
import static com.lesofn.archforge.common.utils.query.SafeExpr.*;

// Aggregation
count(SysUser_.userId)           // → "COUNT(userId)"
countDistinct(SysUser_.deptId)   // → "COUNT(DISTINCT deptId)"
sum(SysUser_.status)             // → "SUM(status)"
min(SysUser_.userId)             // → "MIN(userId)"
max(SysUser_.userId)             // → "MAX(userId)"
avg(SysUser_.status)             // → "AVG(status)"

// DISTINCT
distinct(SysUser_.username)      // → "DISTINCT username"

// NULL handling
coalesce(SysUser_.email, "N/A")  // → "COALESCE(email, 'N/A')"
nullif(SysUser_.status, 0)       // → "NULLIF(status, 0)"

// Conditional
caseWhen(SysUser_.status, 1, "Active", "Inactive")
// → "CASE WHEN status = 1 THEN 'Active' ELSE 'Inactive' END"

// String functions
upper(SysUser_.username)         // → "UPPER(username)"
lower(SysUser_.email)            // → "LOWER(email)"
concat(SysUser_.username, SysUser_.nickname)
// → "CONCAT(username, nickname)"

// Path helpers
path(SysUser_.username)          // → "username"
path(SysUser_.deptId, SysDept_.name)  // → "deptId.name"
```

## AliasExpr — Alias-Aware Expression Builder

`AliasExpr` works like `SafeExpr` but prefixes all paths with a query alias, ready for direct JPQL embedding:

```java
AliasExpr o = AliasExpr.of("o");
AliasExpr u = AliasExpr.of("u");

o.path(SysUser_.username)        // → "o.username"
u.path(SysUser_.email)           // → "u.email"
o.count(SysUser_.userId)         // → "COUNT(o.userId)"
o.countDistinct(SysUser_.deptId) // → "COUNT(DISTINCT o.deptId)"
o.coalesce(SysUser_.email, "")   // → "COALESCE(o.email, '')"
o.upper(SysUser_.username)       // → "UPPER(o.username)"

// Nested path
o.path(SysUser_.deptId, SysDept_.name)  // → "o.deptId.name"
```

### Before / After Comparison

```java
// ❌ Raw string (typos only caught at runtime)
.select("COUNT(DISTINCT o.customer)")
.select("COALESCE(o.discountRate, 0)")
.where("UPPER(o.orderNo)").like("%ORD-2024%")

// ✅ Type-safe (rename refactoring + compile-time validation)
AliasExpr o = AliasExpr.of("o");
.select(o.countDistinct(Order_.customer))
.select(o.coalesce(Order_.discountRate, 0))
.where(o.upper(Order_.orderNo)).like("%ORD-2024%")
```

## QueryHelp — Dynamic Specification Builder

For list/search endpoints with dynamic filtering, use the `@Query` annotation on DTO fields combined with `QueryHelp`:

```java
// 1. Define criteria DTO with @Query annotations
@Data
public class SysUserQueryCriteria {
    @Query(blurry = "username,nickname,email")
    private String blurry;

    @Query(type = Query.Type.INNER_LIKE)
    private String username;

    @Query
    private Integer status;

    @Query(type = Query.Type.BETWEEN)
    private List<LocalDateTime> createTime;
}

// 2. Build Specification in controller
Specification<SysUser> spec = (root, q, cb) ->
    QueryHelp.getPredicate(root, criteria, cb);

// 3. Pass to repository
Page<SysUser> page = userRepository.findAll(spec, pageable);
```

### Supported Query Types

| Type | JPQL Equivalent | Example |
|------|----------------|---------|
| `EQUAL` | `= ?` | `@Query` (default) |
| `NOT_EQUAL` | `<> ?` | `@Query(type = NOT_EQUAL)` |
| `GREATER_THAN` | `>= ?` | `@Query(type = GREATER_THAN)` |
| `LESS_THAN` | `<= ?` | `@Query(type = LESS_THAN)` |
| `INNER_LIKE` | `LIKE %?%` | `@Query(type = INNER_LIKE)` |
| `LEFT_LIKE` | `LIKE %?` | `@Query(type = LEFT_LIKE)` |
| `RIGHT_LIKE` | `LIKE ?%` | `@Query(type = RIGHT_LIKE)` |
| `IN` | `IN (?)` | `@Query(type = IN)` |
| `NOT_IN` | `NOT IN (?)` | `@Query(type = NOT_IN)` |
| `IS_NULL` | `IS NULL` | `@Query(type = IS_NULL)` |
| `NOT_NULL` | `IS NOT NULL` | `@Query(type = NOT_NULL)` |
| `BETWEEN` | `BETWEEN ? AND ?` | `@Query(type = BETWEEN)` |
| `FIND_IN_SET` | `FIND_IN_SET(?, col)` | `@Query(type = FIND_IN_SET)` |

## Repository Pattern

Repositories extend `JpaRepository` + `JpaSpecificationExecutor`:

```java
@Repository
public interface SysUserRepository
        extends JpaRepository<SysUser, Long>,
                JpaSpecificationExecutor<SysUser> {

    // Spring Data derived queries
    SysUser findByUsername(String username);
    boolean existsByEmail(String email);

    // JPQL queries
    @Query("SELECT u FROM SysUser u WHERE u.deleted = false AND u.status = 1")
    List<SysUser> findAllActiveUsers();
}
```

## Migration from QueryDSL

| QueryDSL | New Approach |
|----------|-------------|
| `Q-classes` (e.g. `QSysUser`) | `Entity_` metamodel classes (e.g. `SysUser_`) |
| `QuerydslPredicateExecutor` | `JpaSpecificationExecutor` + `QueryHelp` |
| `JPAQueryFactory` complex joins | JPQL `@Query` annotations |
| `BooleanExpression` predicates | JPA `Specification<T>` |
| `querydsl-apt` annotation processor | `hibernate-processor` annotation processor |

## Related Pages

- [Tech Stack](./tech-stack.md) — full technology list
- [Database Migration](./database-migration.md) — Flyway schema management
- [Project Structure](./project-structure.md) — module organization
