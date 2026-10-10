# API Documentation (Swagger)

ArchForge integrates SpringDoc OpenAPI to provide interactive API documentation, accessible both as a standalone page and embedded within the admin panel.

## Configuration

SpringDoc is configured in `application.yaml`:

```yaml
springdoc:
  api-docs:
    path: /v3/api-docs
    enabled: true
    version: openapi_3_0
  swagger-ui:
    path: /swagger-ui.html
    enabled: true
    url: /v3/api-docs
    tags-sorter: alpha
    operations-sorter: alpha
    doc-expansion: none
    display-request-duration: true
  default-produces-media-type: application/json
  default-consumes-media-type: application/json
  show-actuator: false
  pre-loading-enabled: true
  writer-with-default-pretty-printer: true
```

## Access Points

| Resource | URL | Description |
|----------|-----|-------------|
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` | Interactive explorer for server-admin |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` | Live OpenAPI document (no login needed) |
| server-web | `http://localhost:8081/swagger-ui/index.html` | The C-end API, outside prod |
| Admin panel | "Swagger" iframe menu | Swagger UI inside the admin console |

`application-prod.yaml` switches both springdoc endpoints off, so production serves neither page.

## Embedded in Admin Panel

Flyway seeds an iframe menu for Swagger UI:

- **Menu Type**: Iframe (3)
- **frameSrc**: `/swagger-ui/index.html`
- **isFrameSrcInternal**: `true` — the admin UI prefixes the frame URL with its own origin

In development the admin dev server proxies `/swagger-ui` and `/v3/api-docs` to `:8080` (`vite.config.ts`), so the
iframe works out of the box. The production frontend image proxies only `/api/`, and prod disables springdoc anyway —
treat the embedded page as a development aid.

## The Contract

The full, current list of endpoints is the generated contract `ArchForge/spec/openapi.yaml` (server-admin and
server-web merged, 147 operations as of 2026-10). It is regenerated from the running code with
`./gradlew generateOpenApi`; CI fails when it is stale, and the admin / C-end clients generate their TypeScript types
from it. The old `/admin-api/*` and `/system/*` paths no longer exist.

### Endpoint Map (server-admin)

| Area | Prefix | Operations | Page |
|------|--------|-----------:|------|
| Login, routes, captcha | `/admin/auth` | 8 | [Authentication](./authentication.md) |
| Users | `/admin/user` | 9 | [User Management](./user-management.md) |
| Roles, permission matrix | `/admin/role`, `/admin/permission-matrix` | 10 + 3 | [Role & Permission](./role-permission.md) |
| Menus | `/admin/menu` | 4 | [Menu Management](./menu-management.md) |
| Departments | `/admin/dept` | 4 | — |
| Dictionaries | `/admin/system/dict` | 8 | — |
| Parameters, notices | `/admin/config`, `/admin/notice` | 4 + 4 | [Config & Notice](./config-notice.md) |
| Operation / login logs | `/admin/operation-log`, `/admin/login-log` | 3 + 3 | [Log Management](./log-management.md) |
| Server, cache, online users | `/admin/server`, `/admin/monitor` | 1 + 2 | [Server Monitor](./server-monitor.md) |
| Files | `/admin/file` | 5 | [File Management](./file-management.md) |
| Scheduled jobs | `/admin/scheduler-job` | 9 | [Scheduler](./scheduler.md) |
| Meta-table | `/admin/meta-table` | 21 | [Meta-table](./meta-table.md) |
| CMS | `/admin/cms` | 11 | — |
| Tasks | `/admin/task` | 7 | — |
| ChatAI | `/admin/chat` | 6 | [ChatAI](./chatai.md) |
| Dashboard | `/admin/dashboard` | 4 | [Dashboard](./dashboard.md) |

server-web serves the C-end under `/web/*` (login and registration, articles, categories, notices, files, dashboard) —
see [C-end Web](../guide/c-end-web.md).

## Adding API Documentation to New Endpoints

Use SpringDoc annotations on your controllers. Admin endpoints live under `/admin/*` and declare a permission:

```java
@Tag(name = "Custom Module", description = "Custom module operations")
@RestController
@RequestMapping("/admin/custom")
public class CustomController {

    @Operation(summary = "Get item", description = "Retrieve an item by ID")
    @Parameter(name = "id", description = "Item ID", required = true)
    @SaCheckPermission(value = "custom:item:query", type = StpAdminUtil.TYPE)
    @GetMapping("/{id}")
    public CustomItem getItem(@PathVariable Long id) {
        // ...
    }
}
```

Then run `./gradlew generateOpenApi` and commit the regenerated `spec/openapi.yaml` with the change; seed the new
permission as a menu button so a role can be granted it.

## Related Pages

- [Menu Management](./menu-management.md) — iframe menu configuration
- [Authentication](./authentication.md) — login and token APIs
- [Configuration](../guide/configuration.md) — SpringDoc YAML settings
