# Log Management

ArchForge provides built-in logging for both user operations and login attempts, enabling audit trails and security monitoring.

## Operation Logs

### Features

- Automatic logging of CRUD operations
- Records operator, action, request parameters, and response
- Paginated list with search filters
- Batch delete and clear all

### Data Model — SysOperLog (`sys_oper_log`)

| Field | Type | Description |
|-------|------|-------------|
| operId | Long | Primary key |
| title | String | Operation module name |
| businessType | Integer | Operation type (create/update/delete/etc.) |
| method | String | Controller method name |
| requestMethod | String | HTTP method (GET/POST/PUT/DELETE) |
| operUrl | String | Request URL |
| operIp | String | Operator IP address |
| operLocation | String | IP geolocation (via ip2region) |
| operParam | String | Request parameters (JSON) |
| jsonResult | String | Response body (JSON) |
| status | Integer | Result status (0: fail, 1: success) |
| errorMsg | String | Error message (if failed) |
| operName | String | Operator username |
| operTime | DateTime | Operation timestamp |

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin-api/operation-logs` | List operation logs (paginated) |
| POST | `/admin-api/operation-logs/delete` | Delete selected logs |
| POST | `/admin-api/operation-logs/clear` | Clear all operation logs |

## Login Logs

### Features

- Records every login attempt (success and failure)
- Captures browser, OS, IP, and geolocation
- Useful for security auditing and anomaly detection
- Paginated list with search filters

### Data Model — SysLoginLog (`sys_login_log`)

| Field | Type | Description |
|-------|------|-------------|
| loginId | Long | Primary key |
| username | String | Login username |
| ipaddr | String | Login IP address |
| loginLocation | String | IP geolocation |
| browser | String | Browser name and version |
| os | String | Operating system |
| status | Integer | Result (0: fail, 1: success) |
| msg | String | Message (success or error reason) |
| loginTime | DateTime | Login timestamp |

Browser and OS detection is powered by the **UserAgentUtils** library, and IP geolocation uses the offline **ip2region** database.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin-api/login-logs` | List login logs (paginated) |
| POST | `/admin-api/login-logs/delete` | Delete selected logs |
| POST | `/admin-api/login-logs/clear` | Clear all login logs |

## Log Retention

By default, logs are stored indefinitely. Administrators can:

- **Manually delete** specific log entries via the admin panel
- **Clear all** logs using the clear endpoint
- **Implement automated cleanup** by adding a scheduled task that deletes logs older than a configurable period

## Service Layer

- `SysOperLogService` — operation log CRUD and query
- `SysLoginLogService` — login log CRUD and query
- Both services use Spring Data JPA repositories with QueryDSL for dynamic filtering

## Related Pages

- [User Management](./user-management.md) — users whose actions are logged
- [Authentication](./authentication.md) — login flow that generates login logs
- [Server Monitor](./server-monitor.md) — system-level monitoring
