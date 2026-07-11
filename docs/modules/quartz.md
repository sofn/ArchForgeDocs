# Quartz Scheduling

ArchForge integrates Spring Quartz to provide a reflective, admin-configurable scheduling system. Jobs are defined by a bean name, method name, and optional method parameters, and can be managed directly from the admin panel.

## Features

- **Reflective invocation** — Define a job as `beanName.methodName(params)` without writing a new Quartz job class.
- **Full CRUD** — Create, update, delete, pause, resume, and trigger jobs immediately.
- **Execution logs** — Each run is recorded with status, duration, start/finish time, and error messages.
- **Cron validation** — Built-in endpoint to validate cron expressions before saving.
- **Concurrency control** — Jobs can be marked concurrent or non-concurrent.

## Data Model — SysQuartzJob (`sys_quartz_job`)

| Field | Type | Description |
|-------|------|-------------|
| id | Long | Primary key |
| jobName | String | Job name |
| jobGroup | String | Job group |
| description | String | Human-readable description |
| beanName | String | Target Spring bean name |
| methodName | String | Method to invoke on the bean |
| methodParams | String | Optional parameter string |
| cron | String | Cron expression |
| misfirePolicy | Short | Misfire policy code |
| concurrent | Boolean | Whether the job can run concurrently |
| status | Short | `1` paused, `2` running |

## Data Model — SysQuartzLog (`sys_quartz_log`)

| Field | Type | Description |
|-------|------|-------------|
| id | Long | Primary key |
| jobId | Long | Reference to the job |
| jobName | String | Job name |
| jobGroup | String | Job group |
| beanName | String | Target bean |
| methodName | String | Method invoked |
| methodParams | String | Parameters used |
| status | Short | `0` success, `1` failure |
| errorMessage | String | Error message if failed |
| durationMs | Long | Execution duration in milliseconds |
| startedAt | DateTime | Start time |
| finishedAt | DateTime | Finish time |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/quartz/list` | Query job list with pagination |
| POST | `/quartz/add` | Create a new job |
| PUT | `/quartz/update/{id}` | Update a job |
| DELETE | `/quartz/delete/{id}` | Delete a job |
| POST | `/quartz/pause/{id}` | Pause a job |
| POST | `/quartz/resume/{id}` | Resume a job |
| POST | `/quartz/run/{id}` | Run a job immediately |
| POST | `/quartz/log/list` | Query execution logs for a job |
| POST | `/quartz/validate-cron` | Validate a cron expression |

### Example Job Definition

```json
{
  "jobName": "cleanTempFiles",
  "jobGroup": "system",
  "description": "Clean temp files every day",
  "beanName": "fileCleanupService",
  "methodName": "clean",
  "methodParams": "30",
  "cron": "0 0 2 * * ?",
  "concurrent": false,
  "status": 2
}
```

## How It Works

1. The admin UI sends the job definition to `QuartzJobController`.
2. `QuartzJobService` persists the `SysQuartzJob` record.
3. The `QuartzReflectionJob` reads the bean name, method, and parameters and invokes the target Spring bean.
4. After each execution, a `SysQuartzLog` record is created with the result.

## Security Notes

- All management endpoints require the `ADMIN` role.
- The reflective invocation is restricted to Spring beans registered in the application context.

## Related Pages

- [Project Structure](../guide/project-structure.md) — where `SysQuartzJob` and `QuartzReflectionJob` live
- [File Management](./file-management.md) — a common use case for scheduled cleanup
