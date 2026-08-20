# ChatAI

管理端 ChatAI 使用用户自行填写的 **OpenAI / Anthropic 兼容** HTTP 接口。ArchForge 不内置厂商 SDK，也没有默认密钥。

## 配置

```bash
LLM_PROVIDER=openai          # 或 anthropic
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
LLM_ANTHROPIC_VERSION=2023-06-01
```

兼容 `/v1/chat/completions`（OpenAI）或 `/v1/messages`（Anthropic）的网关即可。

`GET /admin/chat/config` 只返回 `provider` / `model` / `baseUrl` / `configured`，**从不返回密钥**。密钥为空时 `LlmClientFactory.requireConfigured()` 拒绝调用。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/chat/config` | 状态 |
| GET | `/admin/chat/sessions` | 当前用户会话 |
| POST | `/admin/chat/sessions` | 新建 |
| GET | `/admin/chat/sessions/{id}/messages` | 历史 |
| DELETE | `/admin/chat/sessions/{id}` | 删除 |
| POST | `/admin/chat/sessions/{id}/messages` | SSE：`delta` / `done` / `error` |

写操作需要 `@SaCheckPermission("chatai:use")`。会话按管理端用户 id 隔离。

发送消息限流 20 次/分钟/用户。错误码模块 `CHAT_AI`（`107xx`）。
