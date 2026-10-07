# What's New

Manual changelog for the documentation site. Data as of **2026-10**.

## 2026-10 — security and operations hardening

- **Meta table**: every value that reaches DDL is validated *and* rendered strictly — typed default values, a whitelist grammar for REFERENCE display expressions (`ref.<column>`, `'text'`, `||`), `prefix + code` checked as a whole; creating a table whose physical name already exists is refused (use Import). Every endpoint carries its own `meta-table:*` permission. `meta check` also reports registered tables without a physical table.
- **Operations**: `staging` / `prod` serve the actuator on a separate management port (admin `8089`, web `8091`); probes are `/livez` and `/readyz` on the business port. Log lines carry `[traceId,requestId]`. Prometheus discovers the backends by DNS.
- **Secrets**: prod Redis requires `REDIS_PASSWORD`; Redis values are deserialized through a type allow-list; `AESEncrypter` has no built-in key any more (AES-GCM); request logs mask credential key variants (`accessToken`, `refresh_token`, …) and staging/prod do not log bodies.
- **CLI**: `db init` / `db update` / `init` / `up` run the module-aware `flywayMigrateAll`, pass the DB credentials and fail on migration errors; `doctor` prints ASCII `[ OK ]` / `[FAIL]`.
- **C-end API**: client mistakes return `404` / `405` / `400` problem details instead of `500`.
- **Permissions**: every admin handler has its own permission, and every checked permission is grantable through a menu or button (the scheduler, file upload/delete and CMS image upload used to check codes nobody could be given). Meta-table code generation needs `meta-table:generate`; `copy` returns the new `tableCode`.
- **Hardening**: `500` responses no longer reveal exception details outside dev/test; staging needs explicit CORS origins; API signatures cover the request body; `JWT_SECRET` is gone (sa-token, no JWT).
- **Alerts**: per-application error rate with a traffic floor, whole-heap memory, two disk tiers, DB pool exhaustion; Alertmanager delivers to `ALERT_WEBHOOK_URL`; prod/staging sample 10% of traces.
- **CLI**: `init` without `--write` is a pure dry-run.

## 2026-04

- Contract-first and AI workflow guides; first four ADRs.
- Homepage restated around five-repo + AI agents (not a 14-feature dump).
- Comparison table talks architecture, not stale Spring Boot 2.x claims. yudao / RuoYi-Vue-Pro now ships Spring Boot 4.1 + JDK 25 on `master-jdk25` (see [their 2026-06 notes](https://doc.iocoder.cn/changelog/2026-06/)).
- ArchForgeSpec gained GitHub Actions (OpenAPI lint + path/enum checks).
- C-end uploads reject SVG/HTML; menu types aligned to backend 1/2/3/4.
- RSA default removed; Compose passwords required; OpenAPI write paths and extra enums documented.

Hosted public demo is still **not** provided. Run locally.
