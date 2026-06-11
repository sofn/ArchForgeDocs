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

## Related Pages

- [User Management](./user-management.md) — user account management
- [Role & Permission](./role-permission.md) — roles and permissions
- [Configuration](../guide/configuration.md) — JWT and captcha settings
- [Menu Management](./menu-management.md) — async route loading after login
```

---
