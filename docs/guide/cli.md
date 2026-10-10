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
| `./archforge init [--write] [--profile dev\|test\|staging\|prod]` | With `--write`: generate secrets into `.env`, patch dev/test YAML placeholders, and for `dev` start postgres/redis, sync the DB role password and run Flyway (a failed migration fails the command). Without `--write` it only prints that plan and changes nothing. |
| `./archforge infra up\|down\|stop [--profile dev]` | Start / remove / pause postgres and redis via Docker Compose. |
| `./archforge db init` | Start postgres and apply Flyway via `:archforge-server-admin:flywayMigrateAll` — `__root` first, then every module with its own history table, exactly like application startup. `DB_PASSWORD` / `DB_USERNAME` are passed to Gradle; a failure exits non-zero. |
| `./archforge db update` | Apply the latest Flyway migrations (same `flywayMigrateAll`). |
| `./archforge db backup` | `pg_dump` into `backup/db/`. |
| `./archforge db recovery --file <path> [--yes]` | Restore a dump (type `YES`, or `--yes` for automation). |
| `./archforge up [--profile dev]` | Dev: start infra, then detach `archforge-server-admin`, `archforge-server-web`, and sibling frontends if present. The Flyway migration runs first; if it fails nothing else is started. |
| `./archforge down [--profile dev]` | Stop compose services for the profile. |
| `./archforge build [--profile dev]` | `bootBuildImage` for admin + web; optional frontend Docker images. |
| `./archforge docker up\|down [--profile dev]` | Start deps, migrate, then bring compose services up / down. |
| `./archforge doctor` | Check the local environment (JDK 25, Docker / Compose, Node / pnpm, ports, `.env`). Prints `[ OK ]` / `[FAIL]` lines (ASCII, readable on any console) and exits 1 when something fails. |
| `./archforge meta export\|import\|check [--dir <dir>] [--table <code>]` | Meta-table definition files ↔ DB. `import` is a dry-run unless `--apply`. `check` exits 1 on drift **and** when a registered table has no physical table — the sync never runs DDL. The one-shot process starts no web server and no scheduler, so it is safe next to a running server. |
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
