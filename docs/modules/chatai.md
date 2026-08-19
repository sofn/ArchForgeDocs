# ChatAI

Admin ChatAI talks to an **OpenAI- or Anthropic-compatible** HTTP API. You supply the endpoint; ArchForge does not ship a vendor SDK or a default key.

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

APIs:

- `GET /admin/chat/config` — provider/model/configured flag, never the key
- `POST /admin/chat/sessions`
- `POST /admin/chat/sessions/{id}/messages` — SSE events `delta`, `done`, `error`
