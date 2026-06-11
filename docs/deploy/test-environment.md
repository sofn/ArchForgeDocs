# Test Environment Setup

Guide for setting up ArchForge in a test/staging environment.

## Prerequisites

- Linux server (Ubuntu 22.04+ or CentOS 8+ recommended)
- Docker 24+ and Docker Compose v2 (for PostgreSQL and Redis)
- JDK 25 (Azul Zulu recommended)

## Database Setup

### Install PostgreSQL 17

Option A: Docker (recommended for test):

```bash
docker run -d --name archforge-pg \
  -e POSTGRES_USER=archforge \
  -e POSTGRES_PASSWORD=<your-password> \
  -p 5432:5432 postgres:17-alpine

# Create databases
docker exec -i archforge-pg psql -U archforge -c "CREATE DATABASE archforge_user;"
docker exec -i archforge-pg psql -U archforge -c "CREATE DATABASE archforge_task;"
```

Option B: Native install (apt/yum).

### Schema Creation (Flyway)

ArchForge uses **Flyway** for automatic schema management. On first startup, Flyway executes migration scripts located in `server-admin/src/main/resources/db/migration/`:

- `V1__init_schema.sql` -- Creates all tables (sys_user, sys_role, sys_menu, sys_dept, etc.)
- `V2__init_data.sql` -- Inserts initial admin user and system configuration
- `V3__init_menu_data.sql` -- Inserts menu structure and permissions

No manual SQL execution needed -- just configure the connection and enable Flyway:

```yaml
arch-forge:
  flyway:
    enabled: true
```

### Verify Schema

```sql
-- Check migration history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- Verify tables created
\dt
```

## Redis Setup

```bash
docker run -d --name archforge-redis \
  -p 6379:6379 redis:7-alpine \
  redis-server --requirepass <your-password>
```

## Application Configuration

Copy the template and fill in real values:

```bash
cd server-admin/src/main/resources/
cp application-test.yaml.example application-test.yaml
```

Key settings to configure:

- Database connection URLs and credentials
- Redis host and password
- JWT secret (generate with `openssl rand -base64 64`)
- `arch-forge.flyway.enabled: true` (to run migrations)

## Start the Application

```bash
SPRING_PROFILES_ACTIVE=test ./gradlew server-admin:bootRun
```

Or with the built JAR:

```bash
./gradlew :server-admin:bootJar -x test
SPRING_PROFILES_ACTIVE=test java --enable-preview -jar server-admin/build/libs/server-admin.jar
```

## Verify

- Health: `curl http://localhost:8080/actuator/health`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- Login: POST `/login` with `{"username": "admin", "password": "admin123"}`

## Import Test Data

Flyway V2 and V3 migrations automatically seed:

- Admin user (admin/admin123)
- Default roles (admin, common)
- Full menu tree with permissions
- System configuration entries

For additional test data, place SQL files in `db/migration/` following the naming convention `V{N}__description.sql`.
