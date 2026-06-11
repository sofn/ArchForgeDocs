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
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` | Interactive API explorer |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` | Raw OpenAPI 3.0 spec |
| Admin Panel | Embedded iframe in admin menu | Swagger UI inside the admin panel |

## Embedded in Admin Panel

The Swagger UI is embedded in the admin panel as an iframe menu item. This is configured as a menu entry with:

- **Menu Type**: Iframe (3)
- **frameSrc**: `/swagger-ui/index.html`
- **isFrameSrcInternal**: `true`

The Nginx configuration proxies Swagger requests to the backend:

```nginx
# Swagger UI proxy (for iframe embedding)
location /swagger-ui/ {
    proxy_pass http://archforge:8080/swagger-ui/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# OpenAPI docs proxy
location /v3/api-docs {
    proxy_pass http://archforge:8080/v3/api-docs;
    proxy_set_header Host $host;
}
```

## API Endpoint Summary

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/login` | User login |
| POST | `/refresh-token` | Refresh JWT token |
| GET | `/getLoginUserInfo` | Get current user info |
| GET | `/getRouters` | Get menu routes (legacy) |
| GET | `/get-async-routes` | Get async routes for frontend |
| GET | `/captchaImage` | Generate captcha image |
| GET | `/getConfig` | Get app config |

### Admin CRUD API (`/admin-api/`)

| Category | Endpoints | Count |
|----------|-----------|-------|
| User Management | `/admin-api/user/*` | 7 endpoints |
| Role Management | `/admin-api/role/*` | 6 endpoints |
| Menu Management | `/admin-api/menu/*` | 4 endpoints |
| Department | `/admin-api/dept/*` | 3 endpoints |
| Config | `/admin-api/config/*` | 4 endpoints |
| Notice | `/admin-api/notice/*` | 4 endpoints |
| Operation Logs | `/admin-api/operation-logs/*` | 3 endpoints |
| Login Logs | `/admin-api/login-logs/*` | 3 endpoints |
| Server Monitor | `/admin-api/server-info` | 1 endpoint |
| File Management | `/admin-api/file/*` | 2 endpoints |

### File Upload/Download

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin-api/file/upload` | Upload a file (local or S3/RustFS backend) |
| GET | `/admin-api/file/download/{id}` | Download a file by ID |

### RESTful System API (`/system/`)

| Controller | Base Path | Endpoints |
|-----------|-----------|-----------|
| SysUserController | `/system/user` | 10 endpoints |
| SysRoleController | `/system/role` | 12 endpoints |
| SysMenuController | `/system/menu` | 11 endpoints |

## Adding API Documentation to New Endpoints

Use SpringDoc annotations on your controllers:

```java
@Tag(name = "Custom Module", description = "Custom module operations")
@RestController
@RequestMapping("/custom")
public class CustomController {

    @Operation(summary = "Get item", description = "Retrieve an item by ID")
    @Parameter(name = "id", description = "Item ID", required = true)
    @GetMapping("/{id}")
    public CustomItem getItem(@PathVariable Long id) {
        // ...
    }
}
```

## Related Pages

- [Menu Management](./menu-management.md) — iframe menu configuration
- [Authentication](./authentication.md) — login and token APIs
- [Configuration](../guide/configuration.md) — SpringDoc YAML settings
