# ArchForge CLI

The developer CLI lives in the **ArchForge** backend repo. It is a picocli fat-jar (`archforge-cli`) launched by the `./archforge` script at the repo root. It does **not** depend on Spring.

## Run it

```bash
cd ArchForge
./archforge --help
```

If `archforge-cli/build/libs/archforge-cli.jar` is missing, `./archforge` builds it first:

```bash
./gradlew :archforge-cli:shadowJar -x test
```

Then:

```bash
java --enable-preview -jar archforge-cli/build/libs/archforge-cli.jar --help
```

## Commands

| Command | What it does |
|---------|----------------|
| `./archforge init [--write] [--profile dev\|test\|staging\|prod]` | Generate secrets (dry-run unless `--write`), patch dev/test YAML placeholders. `dev` also starts postgres/redis and runs Flyway. |
| `./archforge infra up\|down\|stop [--profile dev]` | Start / remove / pause postgres and redis via Docker Compose. |
| `./archforge db init` | Start postgres and apply Flyway (`:archforge-server-admin:flywayMigrate`). |
| `./archforge db update` | Apply latest Flyway migrations. |
| `./archforge db backup` | `pg_dump` into `backup/db/`. |
| `./archforge db recovery --file <path> [--yes]` | Restore a dump (type `YES`, or `--yes` for automation). |
| `./archforge up [--profile dev]` | Dev: start infra, then detach `archforge-server-admin`, `archforge-server-web`, and sibling frontends if present. |
| `./archforge down [--profile dev]` | Stop compose services for the profile. |
| `./archforge build [--profile dev]` | `bootBuildImage` for admin + web; optional frontend Docker images. |
| `./archforge docker up\|down [--profile dev]` | Start deps, migrate, then bring compose services up / down. |
| `./archforge skills install\|update\|remove --tool <claude\|codex\|cursor\|devin>` | Install or remove agent skill snippets. |
| `./archforge skills list` | List supported AI tools. |
| `./archforge --mcp` | Start the MCP stdio server. |

Typical first-time local flow:

```bash
./archforge init --write
./archforge infra up
./archforge up
```

Logs for detached `up` processes go under `logs/` in the backend repo (`server-admin.log`, `server-web.log`, `admin.log`, `web.log`).

## Related Pages

- [Quick Start](./quick-start.md)
- [Local Setup](./local-setup.md)
- [Project Structure](./project-structure.md)
- [Database Migration](./database-migration.md)
