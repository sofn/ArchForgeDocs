# Log Management

ArchForge keeps two audit logs in the database: **operation logs** for annotated admin actions and **login logs** for
every admin login attempt.

## Operation Logs

### How They Are Written

Handlers annotated with `@Log` are wrapped by `LogAspect`: it records who called, which module, a summary, the client
IP and its location, OS and browser, and whether the call succeeded. The record is published as an event and saved
asynchronously after the transaction commits (`logTaskExecutor`), so logging never slows down or fails the request.

### Data Model — SysOperLog (`sys_oper_log`)

| Field | Type | Description |
|-------|------|-------------|
| operId | Long | Primary key |
| username | String | Operator |
| module | String | Module (from `@Log` or the class) |
| summary | String | What was done (from `@Log` or the method) |
| ip | String | Client IP |
| address | String | IP location |
| systemName | String | Operating system |
| browser | String | Browser |
| status | Integer | `1` success, `0` failure |
| operatingTime | DateTime | When |

### API Endpoints

`OperationLogController` (server-admin):

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/operation-log` | `monitor:operlog:list` | Paginated list |
| POST | `/admin/operation-log/delete` | `monitor:operlog:remove` | Delete selected entries |
| POST | `/admin/operation-log/clear` | `monitor:operlog:list` | Delete all entries |

## Login Logs

### How They Are Written

`LoginService` writes one record per admin login attempt — success and failure, with the reason in `behavior`.

### Data Model — SysLoginLog (`sys_login_log`)

| Field | Type | Description |
|-------|------|-------------|
| infoId | Long | Primary key |
| username | String | Login name |
| ip | String | Client IP |
| address | String | IP location |
| systemName | String | Operating system |
| browser | String | Browser |
| status | Integer | `1` login succeeded, `0` login failed (`2` logout and `3` registration are defined values) |
| behavior | String | Message, e.g. "登录成功" / "登录失败" |
| loginTime | DateTime | When |

### API Endpoints

`LoginLogController` (server-admin):

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/login-log` | `monitor:logininfor:list` | Paginated list |
| POST | `/admin/login-log/delete` | `monitor:logininfor:remove` | Delete selected entries |
| POST | `/admin/login-log/clear` | `monitor:logininfor:list` | Delete all entries |

## Browser, OS and Location

- User-Agent parsing uses **Yauaa** (`UserAgentUtil`).
- IP location: private addresses show "内网IP"; public ones are looked up in the offline **ip2region** xdb files
  (downloaded and cached on first use), falling back to an online lookup (`whois.pconline.com.cn`).

## Log Retention

Logs are kept until someone deletes them: individual entries, everything via *clear*, or your own scheduled job that
removes old rows. Nothing is pruned automatically.

## Service Layer

`SysOperLogService` and `SysLoginLogService` (admin-user `api`) — CRUD and paginated queries; the C-end dashboard also
uses them for today's counts and the latest operations.

## Related Pages

- [User Management](./user-management.md) — users whose actions are logged
- [Authentication](./authentication.md) — the login flow that writes login logs
- [Server Monitor](./server-monitor.md) — system-level monitoring
