# Docker Deployment

ArchForge provides two Docker Compose deployment modes: **Native Image** (BellSoft Liberica NIK 25) for production and **JVM** (Project Leyden CDS) for development/testing.

## Deployment Modes

| Mode | Compose File | Advantages | Best For |
|------|-------------|-----------|----------|
| **Native** (default) | `docker-compose.native.yml` | ~100ms startup, ~50MB memory | Production |
| **JVM** | `docker-compose.yml` | Fast build, full debugging | Development/Testing |

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────┐
│  Browser     │────►│  Nginx (:80) │────►│ ArchForge  │
│              │     │  Static files│     │  (:8080)  │
│              │     │  /api/* proxy│     │           │
└─────────────┘     └──────────────┘     └─────┬─────┘
                                               │
                                    ┌──────────┴──────────┐
                                    │                     │
                              ┌─────┴──────┐        ┌────┴────┐
                              │PostgreSQL   │        │Redis(:6379)│
                              │(:5432)      │        └─────────┘
                              └────────────┘
```

## Quick Start

```bash
cd ArchForge/docker

# Default: Native Image mode
./start.sh

# Or specify mode explicitly
./start.sh native   # BellSoft Liberica NIK 25 Native Image
./start.sh jvm      # Project Leyden CDS (JVM with Class Data Sharing)
```

Or use `docker compose` directly:

```bash
cd ArchForge/docker

# Native mode
docker compose -f docker-compose.native.yml up -d --build

# JVM mode
docker compose -f docker-compose.yml up -d --build
```

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_PASSWORD` | `123` | PostgreSQL password |
| `JWT_SECRET` | (built-in dev key) | JWT signing secret |

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Frontend (Nginx) | 80 | Admin panel |
| Backend (ArchForge) | 8080 | REST API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

## File Structure

```
docker/
├── jvm/
│   ├── docker-compose.yml          # JVM mode with Project Leyden CDS
│   └── Dockerfile                  # JVM Dockerfile with CDS optimization
├── native/
│   ├── docker-compose.native.yml   # Native mode (BellSoft Liberica NIK 25)
│   └── Dockerfile                  # Native image Dockerfile
├── nginx/
│   └── default.conf                # Nginx reverse proxy config
├── start.sh                        # One-click startup script
├── .env.example                    # Environment variable template
└── logs/                           # Application logs (created at runtime)
```

## Nginx Configuration

The Nginx service serves the frontend static files and proxies API requests to the backend:

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend static files
    location / {
        root   /usr/share/nginx/html;
        index  index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://archforge:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger UI proxy
    location /swagger-ui/ {
        proxy_pass http://archforge:8080/swagger-ui/;
    }

    # OpenAPI docs proxy
    location /v3/api-docs {
        proxy_pass http://archforge:8080/v3/api-docs;
    }
}
```

## Native (Liberica NIK 25) vs JVM (Leyden CDS) Comparison

| Metric | Native (Liberica NIK 25) | JVM (Leyden CDS) |
|--------|--------|-----|
| First build time | ~10 minutes | ~2 minutes |
| Docker image size | ~100MB | ~350MB |
| Startup time | ~100ms | ~10s |
| Runtime memory | ~50MB | ~300MB |
| Throughput | Slightly lower | High |
| Debug support | Limited | Full |

## Docker Compose Details

Both compose files define four services:

1. **postgresdb**: PostgreSQL 17 with health check and persistent volume
2. **redis**: Redis 7 Alpine with health check
3. **archforge**: Backend application (depends on postgresdb and redis being healthy)
4. **archforge-admin**: Frontend Nginx container (depends on archforge)

The backend container receives all datasource configuration via environment variables:

```yaml
environment:
  SPRING_PROFILES_ACTIVE: prod
  SPRING_DATA_REDIS_HOST: redis
  DB_USERNAME: archforge
  DB_PASSWORD: ${DB_PASSWORD:-123}
  JWT_SECRET: ${JWT_SECRET:-...}
  SPRING_DATASOURCE_DYNAMIC_DATASOURCE_USER_MASTER_URL: jdbc:postgresql://postgresdb:5432/archforge
  SPRING_DATASOURCE_DYNAMIC_DATASOURCE_USER_SLAVE_URL: jdbc:postgresql://postgresdb:5432/archforge
```

## Managing the Deployment

```bash
# View logs
docker compose -f docker-compose.native.yml logs -f archforge

# Restart a service
docker compose -f docker-compose.native.yml restart archforge

# Stop everything
docker compose -f docker-compose.native.yml down

# Stop and remove volumes (reset database)
docker compose -f docker-compose.native.yml down -v

# Rebuild a specific service
docker compose -f docker-compose.native.yml up -d --build archforge
```

## Related Pages

- [Production Guide](./production.md) — production hardening checklist
- [Database Migration](../guide/database-migration.md) — Flyway runs on Docker startup
- [Configuration](../guide/configuration.md) — environment variable mapping
```

---
