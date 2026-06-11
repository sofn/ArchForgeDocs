# 数据库迁移（Flyway）

ArchForge 使用 [Flyway](https://flywaydb.org/) 管理数据库结构迁移，确保测试和生产环境拥有一致的、可追踪的、可复现的数据库结构。

## 环境策略

| 环境 | DDL 管理 | 数据初始化 | Flyway |
|-------------|---------------|-------------------|--------|
| **dev** | Hibernate DDL `auto=update` | InitDbMockServer（种子 SQL） | 已禁用 |
| **test** | Flyway 迁移 | Flyway V2 种子数据 | 已启用 |
| **prod** | Flyway 迁移 | Flyway V2 种子数据（首次部署） | 已启用 |

在开发环境中，Hibernate 自动根据 Testcontainers PostgreSQL 数据库创建和更新表。在测试和生产环境中，Flyway 完全接管数据库结构管理，而 Hibernate 仅做校验（`ddl-auto: validate`）。

## 迁移脚本

脚本位于 `server-admin/src/main/resources/db/migration/`：

```
db/migration/
├── V1__init_schema.sql       # All table definitions
├── V2__init_seed_data.sql    # Base data (users, roles, departments, configs)
├── V3__init_menu_data.sql    # Menu and role-menu data
└── V4__xxx.sql               # Future incremental migrations...
```

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

在 `server-admin/src/main/resources/db/migration/` 中创建新文件：

```sql
-- V4__add_audit_log_table.sql
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    action      VARCHAR(100) NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 步骤二：在开发环境验证

在开发模式下（Testcontainers PostgreSQL + Hibernate DDL auto），添加对应的 JPA 实体并验证实体映射是否正确。开发环境中 Flyway 已禁用，因此迁移脚本本身不会被执行。

### 步骤三：在测试环境测试

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew server-admin:bootRun
```

Flyway 会在应用启动时自动检测并执行新脚本。

### 步骤四：部署到生产环境

```bash
SPRING_PROFILES_ACTIVE=prod java -jar server-admin.jar
```

Flyway 仅执行新增的增量迁移。

## 测试环境指南

### 首次部署

```bash
# 1. Create the database
psql -U postgres -c "CREATE DATABASE archforge_test;"

# 2. Configure the profile
cd server-admin/src/main/resources
cp application-test.yaml.example application-test.yaml
# Edit application-test.yaml with your database credentials

# 3. Start the application (Flyway runs automatically)
SPRING_PROFILES_ACTIVE=test ./gradlew server-admin:bootRun
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
cd server-admin/src/main/resources
cp application-prod.yaml.example application-prod.yaml
# Edit: database connections (master/slave), Redis, JWT secret

# 3. Start (Flyway auto-creates tables + seeds data)
SPRING_PROFILES_ACTIVE=prod java -jar server-admin.jar
```

### 数据库变更流程

```
1. 开发人员编写迁移脚本
   └─ server-admin/src/main/resources/db/migration/V{N}__description.sql

2. 开发环境验证
   └─ Testcontainers PostgreSQL + Hibernate DDL auto — 验证实体兼容性

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

### 开发环境 Profile

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update          # Hibernate manages DDL

arch-forge:
  flyway:
    enabled: false              # Flyway disabled
  embedded:
    postgresql: true            # Start PostgreSQL via Testcontainers
```

### 测试 / 生产环境 Profile

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway manages DDL, Hibernate only validates

arch-forge:
  flyway:
    enabled: true               # Flyway enabled
```

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
