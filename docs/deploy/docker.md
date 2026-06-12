# Docker Deployment

ArchForge provides three Docker deployment modes to suit different needs.

## Deployment Modes

| Mode | Compose File | Image Size | Startup | Memory | Best For |
|------|-------------|-----------|---------|--------|----------|
| **fulljre** | `docker-compose.fulljre.yml` | ~500MB | ~15s | ~300MB | Quick start, debugging |
| **jlink** (default) | `docker-compose.jlink.yml` | ~430MB | ~10s (CDS) | ~300MB | Balanced (recommended) |
| **native** | `docker-compose.native.yml` | ~100MB | ~100ms | ~50MB | Production |

## Prerequisites

Before building Docker images, ensure `JAVA_HOME` is set to a JDK 25+ installation:

```bash
# Example: set JAVA_HOME before running build scripts
export JAVA_HOME=/path/to/jdk-25
export PATH=$JAVA_HOME/bin:$PATH
```

## Architecture

```
┌─────────────┐     ┌────────────────┐
│  Browser /   │────►│  ArchForge     │
│  Frontend    │     │  (:8080)       │
└─────────────┘     └───────┬────────┘
                            │
                 ┌──────────┴──────────┐
                 │                     │
           ┌─────┴──────┐       ┌─────┴─────┐
           │ PostgreSQL  │       │   Redis   │
           │  (:5432)   │       │  (:6379)  │
           └────────────┘       └───────────┘
```

The backend exposes port 8080 directly — no Nginx reverse proxy is needed for the API.

## Quick Start

```bash
cd ArchForge/docker

# Default: jlink mode (recommended)
./start.sh

# Or specify mode explicitly
./start.sh jlink     # Minimal JRE + Project Leyden CDS
./start.sh fulljre   # Full Azul Zulu JRE (simplest)
./start.sh native    # GraalVM Native Image (fastest startup)

# Stop all services
./start.sh down
```

Or use `docker compose` directly:

```bash
cd ArchForge/docker

# jlink mode (default)
docker compose -f docker-compose.jlink.yml up -d

# Full JRE mode
docker compose -f docker-compose.fulljre.yml up -d

# Native mode (requires --network=host for build)
docker compose -f docker-compose.native.yml up -d --build
```

## Building Docker Images

### Mode 1: Full JRE (simplest)

Uses the complete Azul Zulu JRE — largest image but zero build complexity.

```bash
# 1. Build the bootJar
export JAVA_HOME=/path/to/jdk-25
./gradlew :server-admin:bootJar -x test

# 2. Build Docker image
docker build -f docker/fulljre/Dockerfile -t archforge:fulljre .

# Or use the convenience script:
docker/fulljre/build.sh
```

### Mode 2: jlink (recommended)

Uses jlink to create a minimal JRE + Project Leyden CDS for faster startup.

```bash
# 1. Build the bootJar
export JAVA_HOME=/path/to/jdk-25
./gradlew :server-admin:bootJar -x test

# 2. Build Docker image (includes CDS training + jlink)
docker build -f docker/jlink/Dockerfile -t archforge:jlink .

# Or use the convenience script:
docker/jlink/build.sh
```

### Mode 3: Native Image

Compiles to a native binary via GraalVM — smallest image, fastest startup.

```bash
# Build Docker image (full compilation inside Docker, takes 10+ min, needs 8GB+ RAM)
docker build --network=host -f docker/native/Dockerfile -t archforge:native .

# Or use the convenience script:
docker/native/build.sh
```

::: warning
Native image compilation requires **8GB+ RAM**. Use `--network=host` to allow Gradle to download dependencies inside Docker. The first build may take 10-20 minutes.
:::

## Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_USERNAME` | `archforge` | PostgreSQL username |
| `DB_PASSWORD` | `archforge` | PostgreSQL password |
| `JWT_SECRET` | (built-in dev key) | JWT signing secret |

## Service Ports

| Service | Port | Description |
|---------|------|-------------|
| Backend (ArchForge) | 8080 | REST API |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |

## File Structure

```
docker/
├── fulljre/
│   ├── Dockerfile              # Full JRE (Azul Zulu 25)
│   └── build.sh                # Build script
├── jlink/
│   ├── Dockerfile              # Minimal JRE (jlink + Leyden CDS)
│   └── build.sh                # Build script
├── native/
│   ├── Dockerfile              # GraalVM Native Image
│   └── build.sh                # Build script
├── docker-compose.yml          # Default (jlink mode)
├── docker-compose.jlink.yml    # jlink mode
├── docker-compose.fulljre.yml  # Full JRE mode
├── docker-compose.native.yml   # Native mode
├── start.sh                    # One-click startup (jlink|fulljre|native|down)
├── .env.example                # Environment variable template
├── init-db.sql                 # Database initialization
└── logs/                       # Application logs (created at runtime)
```

## Mode Comparison

| Metric | Full JRE | jlink + CDS | Native Image |
|--------|----------|-------------|--------------|
| Build time | ~30s | ~2min | ~10-20min |
| Image size | ~500MB | ~430MB | ~100MB |
| Startup time | ~15s | ~10s | ~100ms |
| Runtime memory | ~300MB | ~300MB | ~50MB |
| Build RAM required | 2GB | 4GB | 8GB+ |
| Debug support | Full | Full | Limited |
| JFR/JMX | Yes | Yes | No |
| Recommended for | Dev/testing | Staging/prod | Production |

## Managing the Deployment

```bash
# View logs
docker compose -f docker-compose.jlink.yml logs -f archforge

# Restart the backend
docker compose -f docker-compose.jlink.yml restart archforge

# Stop everything
docker compose -f docker-compose.jlink.yml down

# Stop and reset database
docker compose -f docker-compose.jlink.yml down -v

# Rebuild only the backend
docker compose -f docker-compose.jlink.yml up -d --build archforge
```

## Related Pages

- [Production Guide](./production.md) — production hardening checklist
- [Database Migration](../guide/database-migration.md) — Flyway runs on Docker startup
- [Configuration](../guide/configuration.md) — environment variable mapping
