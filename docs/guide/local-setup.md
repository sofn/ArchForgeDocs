# Local Development Setup

Detailed instructions for setting up your development environment.

## Java 25

ArchForge requires Java 25. We recommend using [SDKMAN](https://sdkman.io/) to manage JDK installations:

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash

# Install Azul Zulu 25
sdk install java 25-zulu

# Verify
java -version
echo $JAVA_HOME
```

Alternatively, download directly from [Azul Zulu](https://www.azul.com/downloads/?version=java-25-ea&package=jdk) or [Adoptium](https://adoptium.net/).

::: warning
Ensure `JAVA_HOME` is set correctly. Gradle will fail with a clear error if it detects a different Java version.
:::

## IDE Configuration

### IntelliJ IDEA (Recommended)

1. **Open project**: File → Open → select the `ArchForge/` root directory
2. **Gradle import**: IntelliJ auto-detects `build.gradle.kts` and imports all modules
3. **JDK setup**: File → Project Structure → Project SDK → select Java 25
4. **Lombok plugin**: Settings → Plugins → search "Lombok" → Install
5. **Annotation processing**: Settings → Build → Compiler → Annotation Processors → Enable
6. **Code style**: Import Google Java Style (enforced by Spotless)

### VS Code

1. Install extensions: `Extension Pack for Java`, `Gradle for Java`
2. Set `java.configuration.runtimes` in settings to point to JDK 25
3. Install Lombok support: `vscjava.vscode-lombok`

## Gradle Tips

```bash
# Full build
./gradlew build

# Build without tests (faster)
./gradlew build -x test

# Run only backend
./gradlew server-admin:bootRun

# Run specific test class
./gradlew :server-admin:test --tests "com.lesofn.archforge.*"

# Check code formatting
./gradlew spotlessCheck

# Auto-fix code formatting
./gradlew spotlessApply

# Clean build (useful when switching branches)
./gradlew clean build
```

::: tip
Gradle 9.4.1 supports configuration cache. After the first build, subsequent builds are significantly faster.
:::

## Dev Profile Features

When running with the default `dev` profile, the following are automatically configured:

| Feature | Behavior |
|---------|----------|
| Database | Testcontainers PostgreSQL (auto-started via Docker) |
| Redis | Testcontainers Redis (auto-started via Docker) |
| File Storage | Testcontainers RustFS (S3-compatible, auto-started via Docker) |
| Schema | Hibernate DDL `auto=update` (auto-creates tables) |
| Seed Data | Loaded automatically via `InitDbMockServer` |
| Flyway | Disabled (not needed for dev) |
| Captcha | Disabled (skip captcha on login) |
| DevTools | Hot reload enabled with LiveReload on port 35729 |
| Swagger UI | Available at `http://localhost:8080/swagger-ui/index.html` |
| Tracing | 100% sampling to local OTLP endpoint |

## Hot Reload

Spring Boot DevTools is enabled in dev mode. When you modify Java files and recompile (Ctrl+F9 in IntelliJ), the application restarts automatically.

Monitored paths:
- `src/main/java`
- `src/main/resources`

Excluded from restart:
- `static/**`
- `public/**`

## Testcontainers (Dev Services)

In dev mode, Docker containers for PostgreSQL, Redis, and RustFS are automatically started by Testcontainers when you run `./gradlew server-admin:bootRun`. No manual setup is required.

::: tip
Make sure Docker Desktop (or Docker Engine) is running before starting the backend. Testcontainers will pull the required images on first launch.
:::

The auto-started services are:

| Service | Container Image | Purpose |
|---------|----------------|---------|
| PostgreSQL | `postgres:17` | Primary database |
| Redis | `redis:7-alpine` | Session cache, data caching |
| RustFS | `rustfs/rustfs` | S3-compatible file storage |

## Frontend Development

```bash
cd ArchForgeAdmin

# Install dependencies
pnpm install

# Start dev server (http://localhost:8848)
pnpm dev

# Build for production
pnpm build

# Lint and format
pnpm lint
```

The frontend dev server proxies API requests to `http://localhost:8080` by default.

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `Unsupported class file major version 69` | Wrong Java version — ensure JAVA_HOME points to JDK 25 |
| Port 8080 already in use | Kill the existing process or change `server.port` in YAML |
| Testcontainers startup failure | Ensure Docker is running; check `docker ps` and Docker logs |
| Gradle build hangs | Run `./gradlew --stop` to kill daemon, then rebuild |
| Redis connection refused | Ensure Docker is running — Testcontainers auto-starts Redis |

## Related Pages

- [Quick Start](./quick-start.md) — minimal setup guide
- [Configuration](./configuration.md) — customize YAML settings
- [Project Structure](./project-structure.md) — module overview
