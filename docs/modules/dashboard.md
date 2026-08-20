# Dashboard

Admin Welcome (`src/views/welcome/index.vue`) reads live APIs instead of static demo numbers. Auth: sa-token admin realm, class-level `@SaCheckLogin`.

## Endpoints

| Method | Path | Meaning |
|--------|------|---------|
| GET | `/admin/dashboard/metrics` | Counts: users, articles, meta tables, tasks |
| GET | `/admin/dashboard/trends?days=7` | Time series for the last N days |
| GET | `/admin/dashboard/recent-activities` | Recent article activity |
| GET | `/admin/dashboard/todo` | Drafts / unpublished / open items |

Success envelope: `{ code, message, data }` with `code === 0`.

## Example

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/dashboard/metrics
```

Typical `data`:

```json
{
  "userCount": 12,
  "articleCount": 40,
  "metaTableCount": 3,
  "taskCount": 8
}
```

`trends` accepts `days` (default 7). The Welcome page charts that series.

## UI

Welcome lives at `/welcome` (`src/views/welcome/index.vue`). Cards map 1:1 to `metrics`; the line chart uses `trends`; the activity list uses `recent-activities`.

There is no hosted screenshot set in this repo. Run Admin locally on `:8848` with `archforge-server-admin` on `:8080`.

## Related

- Permission: typically `dashboard:view` (see Flyway `V17`).
- Contract: `ArchForgeSpec/api/openapi.yaml` (`/admin/dashboard/*`).
