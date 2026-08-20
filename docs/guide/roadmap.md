# Roadmap

Dated **2026-08**. Order from `codeplans/ArchPlans/2026-08-20-five-repo-todo-plan.md`.

## This week (P0)

- OpenAPI YAML parse + Spec CI green
- Empty RSA default + prod fail-fast
- Docker Compose required `DB_PASSWORD` / `JWT_SECRET`
- Production docs tell the truth about secrets

## Next 2–4 weeks (P1)

- Raise OpenAPI coverage (RBAC writes first)
- Register remaining UI-facing enums
- Keep Actuator allow-list documented

## Later (needs product decisions)

- Admin Function Calling / RAG / Copilot / Chat2BI depend on **LLM access** (metatable path stays Skill/CLI with no backend LLM).
- C-end comments / likes / tags need **Spec → backend → Web**. Do not invent those APIs in the client first.

## Not in this cycle

Hosted public demo, Page Agent / A2A, full OpenAPI code generation.
