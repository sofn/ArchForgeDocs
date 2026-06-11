# Quick Start

Get ArchForge running locally in under 5 minutes.

## Prerequisites

| Tool | Version | Check Command |
|------|---------|---------------|
| Java | 25+ (Azul Zulu recommended) | `java -version` |
| Node.js | 20+ | `node -v` |
| pnpm | 9+ | `pnpm -v` |
| Git | any | `git --version` |
| Docker | required | `docker -v` |

::: tip
Make sure `JAVA_HOME` points to a JDK 25 installation. Docker is required for Testcontainers (PostgreSQL, Redis, RustFS auto-start in dev mode). You can verify with:
```bash
echo $JAVA_HOME
java -version
```
:::

## Option 1: Manual Setup

### 1. Clone the Repositories

```bash
# Backend
git clone https://github.com/sofn/ArchForge.git

# Frontend
git clone https://github.com/sofn/ArchForgeAdmin.git
```

### 2. Start the Backend

```bash
cd ArchForge
./gradlew server-admin:bootRun
```

The dev profile activates automatically, using:
- **Testcontainers PostgreSQL** — auto-started via Docker (no manual DB setup needed)
- **Testcontainers Redis** — auto-started via Docker (no Redis installation needed)
- **Testcontainers RustFS** — S3-compatible file storage auto-started via Docker
- **Hibernate DDL auto** for schema creation
- Pre-loaded seed data (admin user, roles, menus, etc.)

Wait for the startup log:

