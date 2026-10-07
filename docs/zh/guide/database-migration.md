# 数据库迁移（Flyway）

ArchForge 使用 [Flyway](https://flywaydb.org/) 管理数据库结构迁移，确保测试和生产环境拥有一致的、可追踪的、可复现的数据库结构。

## 环境策略

所有 profile（`dev`、`test`、`staging`、`prod`）都在应用启动时执行 Flyway（`arch-forge.flyway.enabled: true`），Hibernate 只做校验（`spring.jpa.hibernate.ddl-auto: validate`）。任何地方都不使用 `ddl-auto: update`——数据库结构只归 Flyway 管。

## 迁移脚本

| 位置 | 历史表 | 版本 |
|------|--------|------|
| `archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/` | `flyway_schema_history` | 共享的存量序列 `V1`…`V27`（没有 `V5`、`V19`）；下一个文件是 **`V28`** |
| `archforge-module-<name>/src/main/resources/db/migration/<name>/` | `flyway_schema_history_<name>` | 模块内独立编号，从 `V1` 开始（`cms`、`task`） |

启动时 `FlywayConfig` 先迁移 `__root`，再按名称顺序逐个迁移模块目录。`server-admin` 与 `server-web` 迁移同一个 `archforge` 库，Flyway 的历史表锁会把它们串行化。

命令行上 `./archforge db init` / `./archforge db update` 执行 `./gradlew :archforge-server-admin:flywayMigrateAll`，效果相同：先对 `__root` 执行 `flywayMigrate`，再为每个模块执行一个带独立历史表的 `flywayMigrate<Module>`。不要把 `__root` 和模块目录放进同一次 Flyway 执行——`__root/V1` 与 `cms/V1` 会撞版本（"Found more than one migration with version 1"）。

### 命名规范

```
V{version}__{description}.sql
```

- `V` 前缀 + 版本号（递增整数）
- 双下划线 `__` 分隔符
- 描述部分使用 `snake_case`

**示例：**
- `V4__add_audit_log_table.sql`
- `V5__alter_user_add_avatar_column.sql`

### 编写规则

1. **只追加不修改**：切勿修改已执行过的迁移脚本
2. **幂等设计**：使用 `CREATE TABLE IF NOT EXISTS`
3. **向后兼容**：新增列必须有 `DEFAULT` 值；避免删除已有列
4. **编码**：始终使用 UTF-8

## 如何添加新迁移

### 步骤一：编写迁移脚本

在 `archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/` 中创建下一个 `__root` 版本——或在你的模块的 `db/migration/<module>/` 中创建下一个模块内版本：

```sql
-- V28__add_audit_log_table.sql
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    action      VARCHAR(100) NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 步骤二：在开发环境验证

重启应用（或执行 `./archforge db update`）：Flyway 会把新脚本应用到开发库；若 JPA 实体与之不符，`ddl-auto: validate` 会让启动失败。

### 步骤三：在测试环境测试

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew :archforge-server-admin:bootRun
```

Flyway 会在应用启动时自动检测并执行新脚本。

### 步骤四：部署到生产环境

```bash
SPRING_PROFILES_ACTIVE=prod java -jar archforge-server-admin.jar
```

Flyway 仅执行新增的增量迁移。

## 测试环境指南

### 首次部署

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE archforge_test;"

# 2. Configure the profile
cd archforge-server-admin/src/main/resources
cp application-test.yaml.example application-test.yaml
# Edit application-test.yaml with your database credentials

# 3. Start the application (Flyway runs automatically)
SPRING_PROFILES_ACTIVE=test ./gradlew :archforge-server-admin:bootRun
```

### 查看迁移状态

```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## 生产环境指南

### 首次部署

```bash
# 1. Create database (on master, replication handles slave)
psql -h <master-host> -U postgres -c "CREATE DATABASE archforge;"

# 2. Configure the profile
cd archforge-server-admin/src/main/resources
cp application-prod.yaml.example application-prod.yaml
# Edit: database connections (master/slave), Redis, and other secrets (no JWT key)

# 3. Start (Flyway auto-creates tables + seeds data)
SPRING_PROFILES_ACTIVE=prod java -jar archforge-server-admin.jar
```

### 数据库变更流程

```
1. 开发人员编写迁移脚本
   └─ archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/V{N}__description.sql
      （或 archforge-module-<name>/src/main/resources/db/migration/<name>/V{N}__description.sql）

2. 开发环境验证
   └─ 启动时 Flyway 执行脚本，ddl-auto: validate 校验实体

3. 测试环境验证
   └─ 部署到测试环境，Flyway 执行迁移，验证 SQL 正确性

4. 生产环境部署
   └─ 发布新版本，Flyway 运行增量迁移
```

### 生产环境检查清单

1. **备份**：运行迁移前务必备份数据库
2. **代码审查**：迁移脚本必须经过代码审查
3. **回滚**：Flyway 社区版不支持自动回滚——需手动准备回滚 SQL
4. **大表操作**：对大表执行 `ALTER TABLE` 时，考虑使用 `pg_repack` 或 `CREATE INDEX CONCURRENTLY`
5. **敏感信息**：`application-prod.yaml` 已被 gitignore——切勿提交到仓库

### 手动回滚

```bash
# Execute reverse SQL
psql -h <master-host> -U archforge -d archforge -f rollback_V4.sql

# Fix Flyway history
psql -h <master-host> -U archforge -d archforge -c \
  "DELETE FROM flyway_schema_history WHERE version = '4';"
```

## 配置参考

所有 profile：

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway 管理 DDL，Hibernate 只做校验

arch-forge:
  flyway:
    enabled: true
```

本项目里 `spring.flyway.*` 不绑定任何东西（Spring Boot 4 没有 Flyway 自动配置），全部配置在 `arch-forge.flyway.*` 下。`staging` / `prod` 另外设置了 `ignore-migration-patterns: "*:missing"`，让历史表里仍记着已删除版本的库也能启动。

## Docker 部署

使用 Docker Compose 时，Flyway 会在应用启动时自动运行：

```bash
cd docker

# JVM mode
docker compose up -d --build

# Native mode
docker compose -f docker-compose.native.yml up -d --build
```

详见 [Docker 部署](/zh/deploy/docker.md) 获取完整的 Docker 指南。

## 相关页面

- [配置说明](/zh/guide/configuration.md) — Profile 和数据源设置
- [生产部署指南](/zh/deploy/production.md) — 生产环境部署检查清单
```

---
