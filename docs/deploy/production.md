# Production Guide

A checklist and guide for deploying ArchForge to a production environment.

## Pre-Deployment Checklist

| # | Task | Priority | Notes |
|---|------|----------|-------|
| 1 | Change JWT secret | **Critical** | Generate a new HMAC-SHA512 key |
| 2 | Change RSA private key | **Critical** | Generate a new RSA key pair |
| 3 | Change PostgreSQL password | **Critical** | Use a strong password |
| 4 | Enable captcha | High | Set `arch-forge.captcha.enabled: true` |
| 5 | Configure PostgreSQL (master/slave) | High | Set up replication if needed |
| 6 | Configure Redis | High | Use a dedicated Redis instance |
| 7 | Enable Flyway | High | Set `arch-forge.flyway.enabled: true` |
| 8 | Set JPA DDL to validate | High | `spring.jpa.hibernate.ddl-auto: validate` |
| 9 | Configure HTTPS | High | Terminate SSL at Nginx or load balancer |
| 10 | Set up database backups | High | Automated daily backups |
| 11 | Adjust OTLP sampling | Medium | Set to 10% for production |
| 12 | Review log levels | Medium | Avoid DEBUG in production |
| 13 | Set memory limits | Medium | JVM flags or Docker resource limits |

## Generate Secrets

### JWT Secret

Generate a secure Base64-encoded key:

```bash
openssl rand -base64 64
```

Set it in your `application-prod.yaml` or as an environment variable:

```yaml
arch-forge:
  jwt:
    secret: "YOUR_GENERATED_BASE64_KEY"
```

Or via Docker:

```bash
JWT_SECRET="YOUR_GENERATED_BASE64_KEY" docker compose up -d
```

### RSA Key Pair

Generate a new RSA private key:

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:1024
openssl pkcs8 -topk8 -inform PEM -outform DER -in private.pem -out private.der -nocrypt
base64 private.der
```

Set the Base64-encoded private key in `arch-forge.rsa-private-key`. Share the corresponding public key with the frontend.

## Production Configuration

Create `server-admin/src/main/resources/application-prod.yaml` from the example:

```bash
cp application-prod.yaml.example application-prod.yaml
```

### Key Settings

```yaml
server:
  port: 8080

spring:
  jpa:
    hibernate:
      ddl-auto: validate         # Flyway manages DDL
  datasource:
    dynamic:
      primary: user_master
      datasource:
        user_master:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://master:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
        user_slave:
          driver-class-name: org.postgresql.Driver
          url: jdbc:postgresql://slave:5432/archforge
          username: ${DB_USERNAME}
          password: ${DB_PASSWORD}
  data:
    redis:
      host: ${REDIS_HOST:redis}
      port: 6379

arch-forge:
  jwt:
    secret: ${JWT_SECRET}
    expire-seconds: 86400        # 24 hours for production
  captcha:
    enabled: true
  flyway:
    enabled: true
  monitor:
    enabled: true
  embedded:
    redis: false                 # Use real Redis
    postgresql: false            # Use real PostgreSQL

management:
  tracing:
    sampling:
      probability: 0.1           # 10% sampling in production
```

## Database Setup

### Install PostgreSQL 17

Option A: Docker (recommended for most deployments):

```bash
docker run -d --name archforge-pg \
  --restart unless-stopped \
  -e POSTGRES_USER=archforge \
  -e POSTGRES_PASSWORD=${DB_PASSWORD} \
  -e POSTGRES_INITDB_ARGS="--encoding=UTF8 --locale=en_US.UTF-8" \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 postgres:17-alpine
```

Option B: Native install (Ubuntu):

```bash
sudo apt install -y postgresql-17
sudo -u postgres createuser --createdb archforge
sudo -u postgres psql -c "ALTER USER archforge PASSWORD '<your-password>';"
```

### Create Databases

```bash
psql -h <master-host> -U archforge -c \
  "CREATE DATABASE archforge_user ENCODING 'UTF8' LC_COLLATE 'en_US.UTF-8' LC_CTYPE 'en_US.UTF-8';"
```

### Master/Slave Replication

For read/write split with `dynamic-datasource`, set up PostgreSQL streaming replication between master and slave instances. ArchForge routes queries automatically via the `@DS` annotation and datasource groups configured in `application-prod.yaml`.

Refer to the [PostgreSQL Replication Documentation](https://www.postgresql.org/docs/17/high-availability.html) for detailed setup instructions.

### First Deployment

On first startup, Flyway creates all tables and seeds initial data automatically:

```bash
# Start application — Flyway runs V1 (schema), V2 (data), V3 (menus)
SPRING_PROFILES_ACTIVE=prod java -jar server-admin.jar
```

### Subsequent Deployments

Flyway automatically detects and runs new migration scripts. Always:

1. Backup the database before deploying
2. Review migration scripts via code review
3. Test migrations in the test environment first

See [Database Migration](../guide/database-migration.md) for the full guide.

## HTTPS Setup

### Option A: Nginx SSL Termination

```nginx
server {
    listen 443 ssl http2;
    server_name admin.yourdomain.com;

    ssl_certificate     /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://archforge:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto https;
    }
}

server {
    listen 80;
    server_name admin.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Option B: Cloud Load Balancer

If using AWS ALB, GCP Load Balancer, or similar, terminate SSL at the load balancer and proxy HTTP to Nginx on port 80.

## Backup Strategy

### Database Backup

```bash
# Daily automated backup
pg_dump -h <master-host> -U archforge archforge_user | gzip > backup_$(date +%Y%m%d).sql.gz
```

Schedule via cron for daily backups and retain 30 days:

```bash
# /etc/cron.d/archforge-backup
0 2 * * * archforge pg_dump -h localhost -U archforge archforge_user | gzip > /backups/archforge_$(date +\%Y\%m\%d).sql.gz && find /backups -name "archforge_*.sql.gz" -mtime +30 -delete
```

### Application Backup

- Docker volumes for PostgreSQL data: `postgres-data`
- Application logs: `docker/logs/`
- Configuration: `application-prod.yaml` (keep in a secure vault, not git)

## Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Prometheus Metrics

Expose to your Prometheus scraper:

