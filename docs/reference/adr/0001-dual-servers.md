# ADR 0001 — Two servers, two envelopes

**Status:** accepted

## Context

Admin consoles and consumer sites have different auth realms, error shapes, and clients. Folding them into one Spring Boot app shares cookies and leaks permissions.

## Decision

- `archforge-server-admin` on **8080**, consumed only by ArchForgeAdmin.
- `archforge-server-web` on **8081**, consumed only by ArchForgeWeb.
- Admin success: `{code, message, data}`.
- Web errors: RFC 9457 ProblemDetail.

Tokens from one realm must not be sent to the other (`StpAdminUtil` vs `StpWebUtil`).

## Consequences

Two boot processes, two CORS configs, two rate-limit keys. Spec documents both surfaces. Clients never cross-wire ports.
