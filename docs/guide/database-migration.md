# Database Migration (Flyway)

ArchForge uses [Flyway](https://flywaydb.org/) to manage database schema migrations, ensuring test and production environments have consistent, traceable, and reproducible database structures.

## Environment Strategy

Every profile (`dev`, `test`, `staging`, `prod`) runs Flyway at application startup (`arch-forge.flyway.enabled: true`) and Hibernate only validates the result (`spring.jpa.hibernate.ddl-auto: validate`). Nothing ever uses `ddl-auto: update` — the schema belongs to Flyway.

## Migration Scripts

| Location | History table | Versions |
|----------|---------------|----------|
| `archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/` | `flyway_schema_history` | Shared legacy sequence `V1`…`V28` (no `V5`, no `V19`); the next file is **`V29`** |
| `archforge-module-<name>/src/main/resources/db/migration/<name>/` | `flyway_schema_history_<name>` | Module-local, restarting at `V1` (`cms`, `task`) |

At startup `FlywayConfig` migrates `__root` first, then every module directory in name order. `server-admin` and `server-web` migrate the same `archforge` database; Flyway's history-table lock serialises them.

From the command line, `./archforge db init` / `./archforge db update` run `./gradlew :archforge-server-admin:flywayMigrateAll`, which does the same: `flywayMigrate` for `__root`, then one `flywayMigrate<Module>` per module with its own history table. Never put `__root` and module directories into a single Flyway run — `__root/V1` and `cms/V1` collide ("Found more than one migration with version 1").

### Naming Convention

```
V{version}__{description}.sql
```

- `V` prefix + version number (incrementing integer)
- Double underscore `__` separator
- Description in `snake_case`

**Examples:**
- `V4__add_audit_log_table.sql`
- `V5__alter_user_add_avatar_column.sql`

### Writing Rules

1. **Append only**: Never modify an already-executed migration script
2. **Idempotent design**: Use `CREATE TABLE IF NOT EXISTS`
3. **Backward compatible**: New columns must have `DEFAULT` values; avoid dropping existing columns
4. **Encoding**: Always UTF-8

## How to Add a New Migration

### Step 1: Write the Migration Script

Create the next `__root` version in `archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/` — or the next module-local version in your module's `db/migration/<module>/`:

```sql
-- V29__add_audit_log_table.sql
CREATE TABLE IF NOT EXISTS sys_audit_log (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL,
    action      VARCHAR(100) NOT NULL,
    detail      TEXT,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Step 2: Verify in Dev

Restart the app (or run `./archforge db update`): Flyway applies the new script to the dev database, and `ddl-auto: validate` fails the startup if the JPA entity does not match it.

### Step 3: Test in Test Environment

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew :archforge-server-admin:bootRun
```

Flyway auto-detects and executes new scripts on application startup.

### Step 4: Deploy to Production

```bash
SPRING_PROFILES_ACTIVE=prod java -jar archforge-server-admin.jar
```

Flyway executes only the new incremental migrations.

## Test Environment Guide

### First Deployment

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

### Check Migration Status

```sql
SELECT * FROM flyway_schema_history ORDER BY installed_rank;
```

## Production Environment Guide

### First Deployment

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

### Database Change Workflow

```
1. Developer writes migration script
   └─ archforge-common/archforge-common-jpa/src/main/resources/db/migration/__root/V{N}__description.sql
      (or archforge-module-<name>/src/main/resources/db/migration/<name>/V{N}__description.sql)

2. Dev environment validation
   └─ Flyway applies it on startup; ddl-auto: validate checks the entities

3. Test environment validation
   └─ Deploy to test, Flyway executes, verify SQL correctness

4. Production deployment
   └─ Release new version, Flyway runs incremental migration
```

### Production Checklist

1. **Backup**: Always backup the database before running migrations
2. **Code Review**: Migration scripts must go through code review
3. **Rollback**: Flyway Community Edition doesn't support auto-rollback — prepare rollback SQL manually
4. **Large tables**: For `ALTER TABLE` on large tables, consider using `pg_repack` or `CREATE INDEX CONCURRENTLY`
5. **Secrets**: `application-prod.yaml` is gitignored — never commit it

### Manual Rollback

```bash
# Execute reverse SQL
psql -h <master-host> -U archforge -d archforge -f rollback_V4.sql

# Fix Flyway history
psql -h <master-host> -U archforge -d archforge -c \
  "DELETE FROM flyway_schema_history WHERE version = '4';"
```

## Configuration Reference

All profiles:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway manages DDL, Hibernate only validates

arch-forge:
  flyway:
    enabled: true
```

`spring.flyway.*` binds to nothing in this project (Spring Boot 4 has no Flyway auto-configuration); everything is configured under `arch-forge.flyway.*`. `staging` / `prod` additionally set `ignore-migration-patterns: "*:missing"` so databases that still list deleted versions in their history can start.

## Docker Deployment

When using Docker Compose, Flyway runs automatically on application startup:

```bash
cd docker

# JVM mode
docker compose up -d --build

# Native mode
docker compose -f docker-compose.native.yml up -d --build
```

See [Docker Deployment](../deploy/docker.md) for the full Docker guide.

## Related Pages

- [Configuration](./configuration.md) — profile and datasource settings
- [Production Guide](../deploy/production.md) — production deployment checklist
```

---
