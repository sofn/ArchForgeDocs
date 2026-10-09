# ChatAI

管理端 ChatAI 调用 **OpenAI / Anthropic 兼容** 的 HTTP 接口，接口地址由你提供。ArchForge 不内置厂商 SDK，也没有默认密钥。

## 配置

设置环境变量（或 `arch-forge.llm.*`）：

```bash
LLM_PROVIDER=openai          # 或 anthropic
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
# 仅 anthropic
LLM_ANTHROPIC_VERSION=2023-06-01
```

实现了 `/v1/chat/completions`（OpenAI）或 `/v1/messages`（Anthropic）的网关都可以用。

`GET /admin/chat/config` 返回 `provider`、`model`、`baseUrl`、`configured`——**从不返回密钥**。

密钥为空时 `LlmClientFactory.requireConfigured()` 拒绝调用模型。

## 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/admin/chat/config` | 只返回状态 |
| GET | `/admin/chat/sessions` | 当前用户的会话 |
| POST | `/admin/chat/sessions` | 新建会话 |
| GET | `/admin/chat/sessions/{id}/messages` | 历史消息 |
| DELETE | `/admin/chat/sessions/{id}` | 删除会话 |
| POST | `/admin/chat/sessions/{id}/messages` | SSE：`delta` / `done` / `error` |

写操作需要 `@SaCheckPermission("chatai:use")`。会话按管理端用户 id（`LoginContext.getAdminUserId()`）隔离，一个用户看不到另一个用户的会话。

## SSE

```
event: delta
data: Hello

event: done
data: [DONE]
```

限流：发送消息 `@RateLimit` 每用户每分钟 20 条。

## 相关

- 界面：`ArchForgeAdmin` 的 ChatAI 页面。
- 错误码：`CHAT_AI` 模块（`107xx`），见 `ArchForge/docs/specs/error-codes.md`。
