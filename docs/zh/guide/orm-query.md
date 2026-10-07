# ORM 查询策略

ArchForge 使用 **Hibernate 静态元模型 + SafeExpr / AliasExpr** 做类型安全的数据库查询，取代了以前的 QueryDSL 方案。

## 架构概览

| 层次 | 工具 | 作用 |
|------|------|------|
| 字段引用 | Hibernate 静态元模型（`Entity_` 类） | 编译期类型安全的字段名 |
| JPQL 表达式 | `SafeExpr` / `AliasExpr` | 类型安全的 JPQL 片段构建器 |
| 动态查询 | `QueryHelp` + JPA Specification | 注解驱动的动态条件 |
| 简单查询 | Spring Data JPA 方法名 / `@Query` | 声明式查询 |

## Hibernate 静态元模型

### 作用

`hibernate-processor` 注解处理器在编译期生成 `Entity_` 元模型类：每个 `@Entity` 类都会生成一个对应的 `Entity_` 类，里面是 `SingularAttribute` 字段：

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

### Gradle 配置

```kotlin
// build.gradle.kts
dependencies {
    annotationProcessor("org.hibernate.orm:hibernate-processor:7.2.19.Final")
}
```

生成的类位于 `build/generated/sources/annotationProcessor/`，会自动加入编译 classpath。

## SafeExpr —— 静态表达式构建器

`SafeExpr` 提供一组静态方法，用元模型属性构建 JPQL 表达式片段，**不带**别名前缀。

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

## AliasExpr —— 带别名的表达式构建器

`AliasExpr` 与 `SafeExpr` 用法相同，但会给所有路径加上查询别名前缀，可直接嵌入 JPQL：

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

### 前后对比

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

## QueryHelp —— 动态 Specification 构建器

带动态过滤的列表/搜索接口，在 DTO 字段上用 `@Query` 注解，再配合 `QueryHelp`：

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

### 支持的查询类型

| 类型 | 对应 JPQL | 示例 |
|------|-----------|------|
| `EQUAL` | `= ?` | `@Query`（默认） |
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

## Repository 模式

Repository 继承 `JpaRepository` + `JpaSpecificationExecutor`：

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

## 从 QueryDSL 迁移

| QueryDSL | 新方案 |
|----------|--------|
| `Q` 类（如 `QSysUser`） | `Entity_` 元模型类（如 `SysUser_`） |
| `QuerydslPredicateExecutor` | `JpaSpecificationExecutor` + `QueryHelp` |
| `JPAQueryFactory` 复杂关联 | JPQL `@Query` 注解 |
| `BooleanExpression` 条件 | JPA `Specification<T>` |
| `querydsl-apt` 注解处理器 | `hibernate-processor` 注解处理器 |

## 相关页面

- [技术选型](./tech-stack.md) —— 完整技术清单
- [数据库迁移](./database-migration.md) —— Flyway 结构管理
- [项目结构](./project-structure.md) —— 模块组织
