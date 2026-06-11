# 认证鉴权（JWT）

ArchForge 使用 JWT（JSON Web Token）实现无状态认证，并集成 Spring Security 进行请求过滤和授权。

## 登录流程

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

## 令牌管理

### 访问令牌（Access Token）

- 登录成功后生成
- 使用配置的密钥通过 HMAC-SHA512 签名
- 包含：用户 ID、用户名、角色、签发时间、过期时间
- 默认有效期：7 天（604800 秒），可通过 `arch-forge.jwt.expire-seconds` 配置

### 令牌刷新

- 接口：`POST /refresh-token`
- 接受当前的访问令牌
- 返回带有新过期时间的新访问令牌
- `auto-refresh-time` 配置（默认：20 分钟）决定前端何时主动刷新

### 配置

```yaml
arch-forge:
  jwt:
    secret: "your-base64-encoded-hmac-sha512-key"
    expire-seconds: 604800          # 7 days
  token:
    header: Authorization           # HTTP header name
    auto-refresh-time: 20           # Auto-refresh threshold (minutes)
```

## 密码加密

ArchForge 采用双层加密方案：

### 第一层：RSA 传输加密

前端使用服务器的 **RSA 公钥**加密明文密码后再通过网络传输。后端使用在 `arch-forge.rsa-private-key` 中配置的私钥进行解密。

### 第二层：BCrypt 存储哈希

RSA 解密后，明文密码使用 **BCrypt** 进行哈希后存入数据库。BCrypt 包含随机盐值，因此相同的密码会产生不同的哈希值。

```
Frontend                          Backend
   │                                │
   │  RSA_encrypt(password) ───────►│  RSA_decrypt(encrypted)
   │                                │  BCrypt.hash(plaintext)
   │                                │  Store hash in DB
```

## Spring Security 集成

### 过滤器链

`AuthResourceFilter` 继承 `RequestMappingHandlerAdapter` 并拦截请求：

1. 从 `Authorization` 请求头中提取 JWT
2. 验证令牌签名和过期时间
3. 从令牌声明中加载 `SystemLoginUser`（继承 `UserDetails`）
4. 通过 `SecurityContextHolder` 设置安全上下文
5. 检查 `@BaseInfo` 注解以判断是否需要登录

### 公开接口

以下接口无需认证即可访问：

- `POST /login` — 用户登录
- `GET /captchaImage` — 验证码生成
- `GET /actuator/**` — 健康检查和指标
- `GET /swagger-ui/**` — API 文档
- `GET /v3/api-docs/**` — OpenAPI 规范

### 获取当前用户

在任意控制器或服务中获取已认证的用户：

```java
// In a controller
SystemLoginUser loginUser = AuthenticationUtils.getLoginUser();
String username = loginUser.getUsername();
List<String> roles = loginUser.getRoles();
```

## 验证码

登录验证码是可选的，可通过配置启用：

```yaml
arch-forge:
  captcha:
    enabled: true        # Enable captcha on login
  captcha-type: math     # "math" (arithmetic) or "text" (random characters)
```

- **数学验证码**：显示算术表达式（如 `3 + 7 = ?`）
- **文字验证码**：显示需要输入的随机字符
- 验证码图片由服务端使用 **Kaptcha** 生成，并临时存储在 Redis 中

## 登录响应

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

## 相关页面

- [用户管理](./user-management.md) — 用户账户管理
- [角色与权限](./role-permission.md) — 角色和权限
- [配置说明](/zh/guide/configuration.md) — JWT 和验证码设置
- [菜单管理](./menu-management.md) — 登录后的异步路由加载
```

---
