# Authentication (Sa-Token)

ArchForge authenticates with **Sa-Token 1.45.0**, not JWT and not Spring Security.

Two independent login types share Redis-backed sessions:

| App | Util | Sa-Token type | Port |
|-----|------|---------------|------|
| Admin | `StpAdminUtil` | `"admin"` | `:8080` |
| C-end web | `StpWebUtil` | `"web"` | `:8081` |

## Login Flow (admin)

```
┌──────────┐                  ┌──────────────┐                ┌──────────┐
│ Frontend  │                  │ LoginController│               │ TokenService│
└────┬─────┘                  └──────┬───────┘                └────┬─────┘
     │  POST /auth/login             │                              │
     │  {username, password, code}   │                              │
     ├──────────────────────────────►│                              │
     │                               │  Verify captcha              │
     │                               │  Decrypt RSA password        │
     │                               │  BCrypt verify               │
     │                               │  StpAdminUtil.login(userId)  │
     │                               │                              │
     │  {accessToken, refreshToken,  │                              │
     │   expires, roles, perms}      │                              │
     │◄──────────────────────────────┤                              │
     │                               │                              │
     │  Subsequent requests:         │                              │
     │  Authorization: Bearer <token>│                              │
     └──────────────────────────────►│                              │
```

Login is rate-limited: `@RateLimit(key = "login", time = 60, maxCount = 5, limitType = IP)` — **5 requests per minute per IP**.

## Token Management

Sa-Token issues a **UUID** access token (`token-style: uuid`). It is **not** a signed JWT.

### Access Token

- Created by `StpAdminUtil.login(userId)` / `StpWebUtil.login(userId)`
- Stored in Sa-Token session (Redis)
- Sent as `Authorization: Bearer <token>`
- Default TTL: 7 days (`sa-token.timeout: 604800`)

### Refresh Token (admin)

- Endpoint: `POST /auth/refresh-token`
- Random UUID stored in Redis, mapped to user id
- Returns a new Sa-Token access token plus a new refresh token

### Configuration

```yaml
sa-token:
  token-name: Authorization
  token-prefix: Bearer
  timeout: 604800
  active-timeout: -1
  is-concurrent: true
  is-share: false
  is-read-cookie: false
  token-style: uuid
  is-log: false
  is-print: false
```

Production secrets have **no defaults**. Set Redis, datasource passwords, RSA keys, and related env vars yourself. Do not ship empty prod credentials.

## Authorization

Controllers use Sa-Token annotations with an explicit type:

```java
@SaCheckLogin(type = StpAdminUtil.TYPE)
@SaCheckPermission(value = "system:user:add", type = StpAdminUtil.TYPE)
@PostMapping
public void addUser(...) { }
```

Permission strings come from `sys_menu.permission`, for example `system:user:add`, `system:role:query`, `monitor:job:list`.

Current admin user:

```java
SystemLoginUser loginUser = LoginContext.getAdminUser();
```

## Password Encryption

Two layers still apply:

1. **RSA** — frontend encrypts the password with the server public key; backend decrypts with `arch-forge.rsa-private-key`
2. **BCrypt** — stored hash in the database

## Public Endpoints (admin)

Typically unauthenticated:

- `POST /auth/login`
- `GET /auth/captchaImage`
- `GET /auth/getConfig`
- `GET /actuator/**` (profile-dependent)
- `GET /swagger-ui/**` and `GET /v3/api-docs/**` (disabled in prod)

## Captcha

```yaml
arch-forge:
  captcha:
    enabled: true
  captcha-type: math     # "math" or "text"
```

Images are generated with **Kaptcha** and stored temporarily in Redis.

## Login Response (admin)

Admin JSON is wrapped as `{code, message, data}`. The `data` payload looks like:

```json
{
  "accessToken": "xxxxxxxx-uuid-style-token",
  "refreshToken": "hex-without-dashes",
  "expires": "2025/01/14 00:00:00",
  "username": "admin",
  "roles": ["admin"],
  "permissions": ["*:*:*"]
}
```

C-end (`archforge-server-web`) errors use RFC 9457 `ProblemDetail` instead of that envelope.

## XSS Filter

`XssFilter` sanitizes **query parameters and headers**. It skips `multipart/*`, `application/octet-stream`, `application/pdf`, and `image/*`. JSON bodies still need controller-level validation.

## API Request Signing

For sensitive endpoints or third-party integrations, use `@ApiSign`. The interceptor validates:

| Header | Description |
|--------|-------------|
| `X-App-Key` | Application identifier |
| `X-Timestamp` | Request timestamp in milliseconds |
| `X-Nonce` | One-time random string (replay protection) |
| `X-Sign` | HMAC-SHA256 signature in lowercase hex |

```
HMAC-SHA256(appSecret, appKey + timestamp + nonce + body)
```

```yaml
arch-forge:
  security:
    sign:
      enabled: true
      timeoutSeconds: 300
      nonceTtlSeconds: 600
      apps:
        test-app: test-secret
```

## Idempotent Token

`@Idempotent` prevents duplicate submissions:

- **PARAM**: Redis SETNX lock keyed by method signature + parameter hash
- **TOKEN**: client fetches `GET /idempotent/token` and sends `X-Idempotent-Token`
- **HEADER**: lock based on a specified request header

## Related Pages

- [User Management](./user-management.md) — user account management
- [Role & Permission](./role-permission.md) — roles, permissions, and data scopes
- [Configuration](../guide/configuration.md) — Sa-Token, captcha, signing, and idempotent settings
- [Menu Management](./menu-management.md) — async route loading after login
- [C-end Web](../guide/c-end-web.md) — `StpWebUtil` on `:8081`
