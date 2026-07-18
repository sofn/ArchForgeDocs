# Authentication (JWT)

ArchForge uses JWT (JSON Web Token) for stateless authentication, integrated with Spring Security for request filtering and authorization.

## Login Flow

```
┌──────────┐                  ┌──────────────┐                ┌──────────┐
│ Frontend  │                  │ LoginController│               │ AuthService│
└────┬─────┘                  └──────┬───────┘                └────┬─────┘
     │  POST /login                  │                              │
     │  {username, password, code}   │                              │
     ├──────────────────────────────►│                              │
     │                               │  Verify captcha              │
     │                               │  Decrypt RSA password        │
     │                               │  authenticate()              │
     │                               ├─────────────────────────────►│
     │                               │                              │ BCrypt verify
     │                               │                              │ Load user + roles
     │                               │  Return tokens               │
     │                               │◄─────────────────────────────┤
     │  {accessToken, refreshToken,  │                              │
     │   expires}                    │                              │
     │◄──────────────────────────────┤                              │
     │                               │                              │
     │  Subsequent requests:         │                              │
     │  Authorization: Bearer <token>│                              │
     └──────────────────────────────►│                              │
```

## Token Management

### Access Token

- Generated on successful login
- Signed with HMAC-SHA512 using the configured secret
- Contains: user ID, username, roles, issue time, expiration
- Default TTL: 7 days (604800 seconds), configurable via `arch-forge.jwt.expire-seconds`

### Token Refresh

- Endpoint: `POST /refresh-token`
- Accepts the current access token
- Returns a new access token with a fresh expiration
- The `auto-refresh-time` config (default: 20 minutes) determines when the frontend should proactively refresh

### Configuration

```yaml
arch-forge:
  jwt:
    secret: "your-base64-encoded-hmac-sha512-key"
    expire-seconds: 604800          # 7 days
  token:
    header: Authorization           # HTTP header name
    auto-refresh-time: 20           # Auto-refresh threshold (minutes)
```

## Password Encryption

ArchForge uses a two-layer encryption approach:

### Layer 1: RSA Transport Encryption

The frontend encrypts the plaintext password with the server's **RSA public key** before sending it over the network. The backend decrypts it using the private key configured in `arch-forge.rsa-private-key`.

### Layer 2: BCrypt Storage Hashing

After RSA decryption, the plaintext password is hashed with **BCrypt** before being stored in the database. BCrypt includes a random salt, so the same password produces different hashes.

```
Frontend                          Backend
   │                                │
   │  RSA_encrypt(password) ───────►│  RSA_decrypt(encrypted)
   │                                │  BCrypt.hash(plaintext)
   │                                │  Store hash in DB
```

## Spring Security Integration

### Filter Chain

The `AuthResourceFilter` extends `RequestMappingHandlerAdapter` and intercepts requests:

1. Extract JWT from the `Authorization` header
2. Validate the token signature and expiration
3. Load the `SystemLoginUser` (extends `UserDetails`) from the token claims
4. Set the security context via `SecurityContextHolder`
5. Check `@BaseInfo` annotation for login requirements

### Public Endpoints

The following endpoints skip authentication:

- `POST /login` — user login
- `GET /captchaImage` — captcha generation
- `GET /actuator/**` — health and metrics
- `GET /swagger-ui/**` — API documentation
- `GET /v3/api-docs/**` — OpenAPI spec

### Getting the Current User

In any controller or service, retrieve the authenticated user:

```java
// In a controller
SystemLoginUser loginUser = AuthenticationUtils.getLoginUser();
String username = loginUser.getUsername();
List<String> roles = loginUser.getRoles();
```

## Captcha

Login captcha is optional and configurable:

```yaml
arch-forge:
  captcha:
    enabled: true        # Enable captcha on login
  captcha-type: math     # "math" (arithmetic) or "text" (random characters)
```

- **Math captcha**: Shows an arithmetic expression (e.g., `3 + 7 = ?`)
- **Text captcha**: Shows random characters to type
- Captcha images are generated server-side using **Kaptcha** and stored temporarily in Redis

## Login Response

```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9...",
  "expires": "2025/01/14 00:00:00",
  "username": "admin",
  "roles": ["admin"],
  "permissions": ["*:*:*"]
}
```

## API Request Signing

For sensitive endpoints or third-party integrations, use the `@ApiSign` annotation. The interceptor validates four headers:

| Header | Description |
|--------|-------------|
| `X-App-Key` | Application identifier |
| `X-Timestamp` | Request timestamp in milliseconds |
| `X-Nonce` | One-time random string (replay protection) |
| `X-Sign` | HMAC-SHA256 signature in lowercase hex |

The signature is computed as:

```
HMAC-SHA256(appSecret, appKey + timestamp + nonce + body)
```

Configure allowed apps in `application.yaml`:

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

Usage:

```java
@PostMapping("/external/order")
@ApiSign
public ResponseResult<Void> createOrder(@RequestBody OrderRequest request) {
    // ...
}
```

## Idempotent Token

The `@Idempotent` annotation prevents duplicate submissions:

- **PARAM**: Redis SETNX lock keyed by method signature + parameter hash (supports SpEL via `key`).
- **TOKEN**: Client requests a one-time token from `GET /idempotent/token` and submits it in the `X-Idempotent-Token` header.
- **HEADER**: Lock based on a specified request header value.

Configuration:

```yaml
arch-forge:
  idempotent:
    enabled: true
    tokenExpireSeconds: 600
    headerName: X-Idempotent-Token
```

Usage:

```java
@PostMapping("/order")
@Idempotent(type = IdempotentType.PARAM, expireSeconds = 10)
public ResponseResult<Long> createOrder(@RequestBody OrderRequest request) {
    // ...
}
```

## Related Pages

- [User Management](./user-management.md) — user account management
- [Role & Permission](./role-permission.md) — roles, permissions, and data scopes
- [Configuration](../guide/configuration.md) — JWT, captcha, API signing, and idempotent settings
- [Menu Management](./menu-management.md) — async route loading after login
