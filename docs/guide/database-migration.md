# Database Migration (Flyway)

ArchForge uses [Flyway](https://flywaydb.org/) to manage database schema migrations, ensuring test and production environments have consistent, traceable, and reproducible database structures.

## Environment Strategy

| Environment | DDL Management | Data Initialization | Flyway |
|-------------|---------------|-------------------|--------|
| **dev** | Hibernate DDL `auto=update` | InitDbMockServer (seed SQL) | Disabled |
| **test** | Flyway migration | Flyway V2 seed data | Enabled |
| **prod** | Flyway migration | Flyway V2 seed data (first deploy) | Enabled |

In development, Hibernate automatically creates and updates tables against the Testcontainers PostgreSQL database. For test and production, Flyway takes full control of schema management while Hibernate only validates the schema (`ddl-auto: validate`).

## Migration Scripts

Scripts are located in `server-admin/src/main/resources/db/migration/`:

```
db/migration/
├── V1__init_schema.sql       # All table definitions
├── V2__init_seed_data.sql    # Base data (users, roles, departments, configs)
├── V3__init_menu_data.sql    # Menu and role-menu data
└── V4__xxx.sql               # Future incremental migrations...
```

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

Create a new file in `server-admin/src/main/resources/db/migration/`:

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

### Step 2: Verify in Dev

In dev mode (Testcontainers PostgreSQL + Hibernate DDL auto), add the corresponding JPA entity and verify that the entity mapping is correct. Flyway is disabled in dev, so the migration script itself is not executed.

### Step 3: Test in Test Environment

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew server-admin:bootRun
```

Flyway auto-detects and executes new scripts on application startup.

### Step 4: Deploy to Production

```bash
SPRING_PROFILES_ACTIVE=prod java -jar server-admin.jar
```

Flyway executes only the new incremental migrations.

## Test Environment Guide

### First Deployment

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
cd server-admin/src/main/resources
cp application-prod.yaml.example application-prod.yaml
# Edit: database connections (master/slave), Redis, JWT secret

# 3. Start (Flyway auto-creates tables + seeds data)
SPRING_PROFILES_ACTIVE=prod java -jar server-admin.jar
```

### Database Change Workflow

```
1. Developer writes migration script
   └─ server-admin/src/main/resources/db/migration/V{N}__description.sql

2. Dev environment validation
   └─ Testcontainers PostgreSQL + Hibernate DDL auto — verify entity compatibility

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

### Dev Profile

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

### Test / Prod Profile

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate        # Flyway manages DDL, Hibernate only validates

arch-forge:
  flyway:
    enabled: true               # Flyway enabled
```

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
