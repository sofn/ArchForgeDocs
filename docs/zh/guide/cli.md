# ArchForge 命令行工具

开发者 CLI 位于 **ArchForge** 后端仓库。它是 picocli 打成的 fat-jar（`archforge-cli`），由仓库根目录的 `./archforge` 脚本启动，**不依赖 Spring**。

## 运行

```bash
cd ArchForge
./archforge --help
```

如果缺少 `archforge-cli/build/libs/archforge-cli.jar`，`./archforge` 会先构建：

```bash
./gradlew :archforge-cli:shadowJar -x test
```

也可以直接：

```bash
java --enable-preview -jar archforge-cli/build/libs/archforge-cli.jar --help
```

## 命令

| 命令 | 作用 |
|---------|----------------|
| `./archforge init [--write] [--profile dev\|test\|staging\|prod]` | 加 `--write`：把密钥写入 `.env`、修补 dev/test YAML 占位符，`dev` 还会启动 postgres/redis、同步数据库角色密码并执行 Flyway（迁移失败则命令失败）。不加 `--write` 只打印上述计划，不做任何改动。 |
| `./archforge infra up\|down\|stop [--profile dev]` | 通过 Docker Compose 启动 / 删除 / 暂停 postgres 与 redis。 |
| `./archforge db init` | 启动 postgres，并通过 `:archforge-server-admin:flywayMigrateAll` 执行 Flyway——先 `__root`，再逐个模块（各自独立的历史表），与应用启动时完全一致。会把 `DB_PASSWORD` / `DB_USERNAME` 传给 Gradle；失败时以非零码退出。 |
| `./archforge db update` | 应用最新 Flyway 迁移（同样是 `flywayMigrateAll`）。 |
| `./archforge db backup` | `pg_dump` 到 `backup/db/`。 |
| `./archforge db recovery --file <path> [--yes]` | 恢复备份（需输入 `YES`，或使用 `--yes` 自动化）。 |
| `./archforge up [--profile dev]` | 开发：启动基础设施，然后后台拉起 `archforge-server-admin`、`archforge-server-web` 以及已克隆的前端。会先执行 Flyway 迁移，失败则其余一概不启动。 |
| `./archforge down [--profile dev]` | 停止该 profile 的 compose 服务。 |
| `./archforge build [--profile dev]` | 为 admin + web 执行 `bootBuildImage`；可选构建前端镜像。 |
| `./archforge docker up\|down [--profile dev]` | 启动依赖、迁移，再拉起 / 停止 compose 服务。 |
| `./archforge doctor` | 检查本地环境（JDK 25、Docker / Compose、Node / pnpm、端口、`.env`）。输出 `[ OK ]` / `[FAIL]`（纯 ASCII，任何控制台都能正常显示），有失败项时退出码为 1。 |
| `./archforge meta export\|import\|check [--dir <dir>] [--table <code>]` | 元表格定义文件 ↔ 数据库。`import` 不加 `--apply` 只做演练。`check` 在出现漂移、**以及**登记了但物理表不存在时退出码为 1——同步本身从不执行 DDL。这个一次性进程不启动 Web 服务也不启动调度器，可以和运行中的服务同时用。 |
| `./archforge skills install\|update\|remove --tool <claude\|codex\|cursor\|devin>` | 安装或移除 AI skill 片段。 |
| `./archforge skills list` | 列出支持的 AI 工具。 |
| `./archforge --mcp` | 启动 MCP stdio 服务。 |

首次本地开发常用流程：

```bash
./archforge init --write
./archforge infra up
./archforge up
```

`up` 分离进程的日志在后端仓库的 `logs/` 下（`server-admin.log`、`server-web.log`、`admin.log`、`web.log`）。

## 相关页面

- [快速开始](/zh/guide/quick-start.md)
- [本地开发环境](/zh/guide/local-setup.md)
- [项目结构](/zh/guide/project-structure.md)
- [数据库迁移](/zh/guide/database-migration.md)
