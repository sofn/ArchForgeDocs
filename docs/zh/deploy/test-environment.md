# 测试环境搭建

本指南介绍如何在测试/预发布环境中搭建 ArchForge。

## 前置条件

- Linux 服务器（推荐 Ubuntu 22.04+ 或 CentOS 8+）
- Docker 24+ 和 Docker Compose v2（用于 PostgreSQL 和 Redis）
- JDK 25（推荐 Azul Zulu）

## 数据库搭建

### 安装 PostgreSQL 17

方案 A：Docker（推荐用于测试环境）：

```bash
docker run -d --name archforge-pg \
  -e POSTGRES_USER=archforge \
  -e POSTGRES_PASSWORD=<your-password> \
  -p 5432:5432 postgres:17-alpine

# Create databases
docker exec -i archforge-pg psql -U archforge -c "CREATE DATABASE archforge_user;"
docker exec -i archforge-pg psql -U archforge -c "CREATE DATABASE archforge_task;"
```

方案 B：原生安装（apt/yum）。

### Schema 创建（Flyway）

ArchForge 使用 **Flyway** 进行自动化 Schema 管理。首次启动时，Flyway 会执行位于 `server-admin/src/main/resources/db/migration/` 目录下的迁移脚本：

- `V1__init_schema.sql` -- 创建所有表（sys_user、sys_role、sys_menu、sys_dept 等）
- `V2__init_data.sql` -- 插入初始管理员用户和系统配置
- `V3__init_menu_data.sql` -- 插入菜单结构和权限数据

无需手动执行 SQL —— 只需配置数据库连接并启用 Flyway：

```yaml
arch-forge:
  flyway:
    enabled: true
```

### 验证 Schema

```sql
-- Check migration history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Verify tables created
\dt
```

## Redis 搭建

```bash
docker run -d --name archforge-redis \
  -p 6379:6379 redis:7-alpine \
  redis-server --requirepass <your-password>
```

## 应用配置

复制配置模板并填入实际值：

```bash
cd server-admin/src/main/resources/
cp application-test.yaml.example application-test.yaml
```

需要配置的关键项：

- 数据库连接 URL 和凭据
- Redis 主机地址和密码
- JWT 密钥（使用 `openssl rand -base64 64` 生成）
- `arch-forge.flyway.enabled: true`（启用数据库迁移）

## 启动应用

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew server-admin:bootRun
```

或使用构建好的 JAR 包：

```bash
./gradlew :server-admin:bootJar -x test
SPRING_PROFILES_ACTIVE=test java --enable-preview -jar server-admin/build/libs/server-admin.jar
```

## 验证

- 健康检查：`curl http://localhost:8080/actuator/health`
- Swagger：`http://localhost:8080/swagger-ui/index.html`
- 登录：POST `/login`，请求体 `{"username": "admin", "password": "admin123"}`

## 导入测试数据

Flyway V2 和 V3 迁移脚本会自动初始化以下数据：

- 管理员用户（admin/admin123）
- 默认角色（admin、common）
- 完整的菜单树及权限
- 系统配置项

如需添加额外的测试数据，请将 SQL 文件放置在 `db/migration/` 目录下，遵循 `V{N}__description.sql` 的命名规范。
