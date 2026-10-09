# AI workflow

ArchForge is written so an agent can start without tribal knowledge. Humans and agents share the same files.

## Start here

1. Clone the four repos **side by side**. No submodules.
2. Read `ArchForge/repos.yaml` (machine map).
3. Read `ArchForge/docs/architecture.md` (ports and envelopes).
4. Open the current repo's `AGENTS.md` / `CLAUDE.md`.
5. Load **one** skill from `ArchForge/.agents/skills/index.yaml`.

Do not load every skill. Progressive disclosure keeps context small.

## Per-repo context

| Repo | What an agent should know |
|------|---------------------------|
| ArchForge | Java 25, Gradle, sa-token, two servers, Spotless. Owns the contract: `spec/openapi.yaml` is generated (`./gradlew generateOpenApi`). |
| ArchForgeAdmin | Vue 3 admin on `:8848`, `/api` → `:8080`. `{code,message,data}`. |
| ArchForgeWeb | Next.js C-end on `:3000` → `:8081`. ProblemDetail errors. Locale prefix `/en` `/zh`. |
| ArchForgeDocs | VitePress only. Describe, do not invent APIs. |

## CLI and MCP

From the backend repo:

```bash
./archforge --help
./archforge skills install --tool claude
./archforge --mcp
```

`skills install` copies agent skills into the tool's skill directory. `--mcp` runs a Phase-1 stdio MCP server so an IDE agent can call CLI commands without inventing shell.

## Cross-repo change

When an enum, path, or OpenAPI shape moves: change the backend and regenerate `spec/` first, then the clients (`pnpm gen:api`). See [contract-first](./contract-first.md) and each repo's `CONTRIBUTING.md`.

## Bootstrap

```bash
cd ArchForge
./archforge init --write
./archforge infra up
FILE_STORAGE_TYPE=local ./gradlew :archforge-server-admin:bootRun
```

Then start Admin (`pnpm dev` on 8848) or Web (`pnpm dev` on 3000) in their repos.
