# AI 协作开发

ArchForge 按「Agent 无需口口相传」来写。人和 Agent 读同一批文件。

## 从这里开始

1. **并列克隆** 五个仓库，不要 submodule。
2. 读 `../ArchForgeSpec/repos.yaml`（机器地图）。
3. 读 `../ArchForgeSpec/architecture.md`（端口与信封）。
4. 打开当前仓的 `AGENTS.md` / `CLAUDE.md`。
5. 只加载 `../ArchForgeSpec/skills/index.yaml` 里匹配任务的 **一条** skill。

不要一次加载全部 skill。渐进披露是为了控制上下文。

## 各仓要点

| 仓库 | Agent 应知道 |
|------|----------------|
| ArchForge | Java 25、Gradle、sa-token、双服务、Spotless。契约同步：OpenAPI 在 Spec。 |
| ArchForgeAdmin | Vue 3 管理端 `:8848`，`/api` → `:8080`。`{code,message,data}`。 |
| ArchForgeWeb | Next.js C 端 `:3000` → `:8081`。ProblemDetail。语言前缀 `/en` `/zh`。 |
| ArchForgeDocs | 只有 VitePress。只描述，不发明 API。 |
| ArchForgeSpec | 项目宪法。契约对不上时先改这里。 |

## CLI 与 MCP

在后端仓：

```bash
./archforge --help
./archforge skills install --tool claude
./archforge --mcp
```

`skills install` 把 skill 装进对应工具目录。`--mcp` 提供 Phase-1 stdio MCP，IDE Agent 不必自己编 shell。

## 跨仓变更

枚举、路径、OpenAPI 形状变化时，用 Spec 的 `cross-repo-change` skill。顺序：Spec → 后端 → 客户端。见 [契约先行](./contract-first.md)。

## 启动

```bash
cd ArchForge
./archforge init --write
./archforge infra up
FILE_STORAGE_TYPE=local ./gradlew :archforge-server-admin:bootRun
```

然后在各自仓库启动 Admin（8848）或 Web（3000）。
