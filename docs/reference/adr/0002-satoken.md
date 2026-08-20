# ADR 0002 — sa-token instead of Spring Security JWT

**Status:** accepted

## Context

Typical Java admin templates ship a custom JWT filter chain. Dual login types (admin vs C-end) then grow a second filter copy. Spring Security is excellent, but we needed two isolated sessions with annotation-level permissions and a small mental model for agents.

## Decision

Use **sa-token 1.45**. Admin: `StpAdminUtil`. Web: `StpWebUtil`. Header `Authorization: Bearer <token>`. Permissions via `@SaCheckPermission`, matching `sys_menu.permission`.

## Consequences

Not Spring Security JWT. Do not reintroduce `JwtAuthenticationFilter`. Login / refresh stay public; everything else requires login unless Spec says otherwise.
