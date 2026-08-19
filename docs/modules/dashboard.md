# Dashboard

`GET /admin/dashboard/metrics` returns live counts: users, articles, meta tables, tasks.

Related:

- `GET /admin/dashboard/trends?days=7`
- `GET /admin/dashboard/recent-activities`
- `GET /admin/dashboard/todo`

Admin Welcome (`src/views/welcome/index.vue`) reads these APIs instead of static demo numbers.
