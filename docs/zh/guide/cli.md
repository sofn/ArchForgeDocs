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
| `./archforge init [--write] [--profile dev\|test\|staging\|prod]` | 生成密钥（不加 `--write` 为演练），修补 dev/test YAML 占位符。`dev` 还会启动 postgres/redis 并执行 Flyway。 |
| `./archforge infra up\|down\|stop [--profile dev]` | 通过 Docker Compose 启动 / 删除 / 暂停 postgres 与 redis。 |
| `./archforge db init` | 启动 postgres 并执行 Flyway（`:archforge-server-admin:flywayMigrate`）。 |
| `./archforge db update` | 应用最新 Flyway 迁移。 |
| `./archforge db backup` | `pg_dump` 到 `backup/db/`。 |
| `./archforge db recovery --file <path> [--yes]` | 恢复备份（需输入 `YES`，或使用 `--yes` 自动化）。 |
| `./archforge up [--profile dev]` | 开发：启动基础设施，然后后台拉起 `archforge-server-admin`、`archforge-server-web` 以及已克隆的前端。 |
| `./archforge down [--profile dev]` | 停止该 profile 的 compose 服务。 |
| `./archforge build [--profile dev]` | 为 admin + web 执行 `bootBuildImage`；可选构建前端镜像。 |
| `./archforge docker up\|down [--profile dev]` | 启动依赖、迁移，再拉起 / 停止 compose 服务。 |
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
