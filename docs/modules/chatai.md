# ChatAI

Admin ChatAI talks to an **OpenAI- or Anthropic-compatible** HTTP API. You supply the endpoint; ArchForge does not ship a vendor SDK or a default key.

## Configuration

Set environment variables (or `arch-forge.llm.*`):

```bash
LLM_PROVIDER=openai          # or anthropic
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini
# anthropic only
LLM_ANTHROPIC_VERSION=2023-06-01
```

Any gateway that implements `/v1/chat/completions` (OpenAI) or `/v1/messages` (Anthropic) works.

`GET /admin/chat/config` returns `provider`, `model`, `baseUrl`, and `configured` — **never the key**.

`LlmClientFactory.requireConfigured()` refuses to call the model when the key is blank.

## APIs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/admin/chat/config` | Status only |
| GET | `/admin/chat/sessions` | Current user sessions |
| POST | `/admin/chat/sessions` | Create session |
| GET | `/admin/chat/sessions/{id}/messages` | History |
| DELETE | `/admin/chat/sessions/{id}` | Delete session |
| POST | `/admin/chat/sessions/{id}/messages` | SSE: `delta` / `done` / `error` |

Write methods require `@SaCheckPermission("chatai:use")`. Sessions are keyed by admin user id (`LoginContext.getAdminUserId()`), so one user cannot list another user's chats.

## SSE

```
event: delta
data: Hello

event: done
data: [DONE]
```

Rate limit: `@RateLimit` 20 messages / minute / user on send.

## Related

- UI: `ArchForgeAdmin` ChatAI page.
- Errors: `CHAT_AI` module (`107xx`) in `ArchForgeSpec/specs/error-codes.md`.
