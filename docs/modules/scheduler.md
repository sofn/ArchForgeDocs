# Scheduled Jobs (db-scheduler)

ArchForge integrates [db-scheduler](https://github.com/kagkarlsson/db-scheduler) to provide a reflective, admin-configurable scheduling system. Jobs are defined by a bean name, method name, and optional method parameters, and can be managed directly from the admin panel. The runtime state lives in a single `scheduled_tasks` table — Quartz and its eleven `QRTZ_*` tables are gone.

## Features

- **Reflective invocation** — define a job as `beanName.methodName(params)`; no dedicated job classes.
- **Full CRUD** — create, update, delete, pause, resume, and trigger jobs immediately.
- **Dynamic schedules** — changing the cron expression is a single `reschedule`; the schedule is persisted in `task_data` next to the job payload.
- **Execution logs** — each run is recorded with status, duration, start/finish time, and error messages.
- **Cron validation** — built-in endpoint to validate cron expressions before saving.
- **Cluster-safe by default** — optimistic locking plus a `picked` polling loop replace Quartz's database lock manager; multiple app instances can share the schedule without extra tables.

## Semantics vs the former Quartz integration

| Concern | Behavior |
|---------|----------|
| Cron format | 6 fields with seconds (`0/30 * * * * *`). Quartz-style `?` is accepted and normalized to `*`. |
| Missed runs | Skipped — executions fire on the next cron tick, no catch-up. |
| Concurrency | A job instance is always serial; the `concurrent` flag is kept for UI compatibility. |
| Pause | The runtime instance is cancelled; `sys_scheduled_job` remains the source of truth and `resume` re-creates it. |
| Misfire policy | Kept as metadata; runtime treats it as "skip". |

## Data Model — SysScheduledJob (`sys_scheduled_job`)

| Field | Type | Description |
|-------|------|-------------|
| id | Long | Primary key |
| jobName | String | Job name (unique with jobGroup) |
| jobGroup | String | Job group |
| description | String | Human-readable description |
| beanName | String | Target Spring bean name |
| methodName | String | Method to invoke on the bean |
| methodParams | String | JSON array of primitive arguments |
| cron | String | 6-field cron expression |
| misfirePolicy | Short | Kept for compatibility, see semantics above |
| concurrent | Boolean | Kept for compatibility, see semantics above |
| status | Short | `0` running, `1` paused |

## Data Model — SysJobLog (`sys_job_log`)

| Field | Type | Description |
|-------|------|-------------|
| id | Long | Primary key |
| jobId | Long | Reference to the job |
| jobName / jobGroup | String | Snapshot of the job identity |
| beanName / methodName | String | Snapshot of the invocation target |
| methodParams | String | Parameters used |
| status | Short | `0` success, `1` failure |
| errorMessage | String | Error message if failed |
| durationMs | Long | Execution duration in milliseconds |
| startedAt / finishedAt | DateTime | Execution window |

## Runtime Table — `scheduled_tasks`

db-scheduler's own single table (created by migration V23): one row per task instance, `task_data` holds the Java-serialized `JobInvocationData` (job payload **and** its schedule). Cluster contention is resolved by the `version` optimistic-lock column.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/quartz` | Query job list with pagination |
| POST | `/quartz/add` | Create a new job |
| PUT | `/quartz/update/{id}` | Update a job |
| DELETE | `/quartz/{id}` | Delete a job |
| POST | `/quartz/pause/{id}` | Pause a job |
| POST | `/quartz/resume/{id}` | Resume a job |
| POST | `/quartz/run/{id}` | Run a job immediately (one-shot instance) |
| GET | `/quartz/log` | Query execution logs for a job |
| POST | `/quartz/validate-cron` | Validate a cron expression |

Endpoint paths keep the `/quartz` prefix for frontend compatibility.

### Example Job Definition

```json
{
  "jobName": "cleanTempFiles",
  "jobGroup": "system",
  "description": "Clean temp files every day",
  "beanName": "fileCleanupService",
  "methodName": "clean",
  "methodParams": "[30]",
  "cron": "0 0 2 * * *",
  "concurrent": false,
  "status": 0
}
```

## How It Works

1. The admin UI sends the job definition to `SchedulerJobController` (`/quartz`).
2. `ScheduledJobService` validates it (cron format, bean allowlist via `arch-forge.scheduler.allowed-job-beans`, public declared method) and persists the `SysScheduledJob` row.
3. The service upserts the db-scheduler instance: `scheduleIfNotExists` / `reschedule` for running jobs, `cancel` for paused ones. A startup sync (`SchedulerStartupSync`) re-asserts every row after restarts and cancels orphaned instances.
4. `ReflectionJobHandler` executes the payload on a db-scheduler worker thread and writes a `SysJobLog` record with the result.

## Security Notes

- All management endpoints require the `ADMIN` role plus `monitor:job:*` permissions.
- Reflective dispatch is restricted to allowlisted beans with a public declared method — configure via `arch-forge.scheduler.allowed-job-beans`.

## Related Pages

- [Project Structure](../guide/project-structure.md) — where `SysScheduledJob` and `ReflectionJobHandler` live
- [File Management](./file-management.md) — a common use case for scheduled cleanup
