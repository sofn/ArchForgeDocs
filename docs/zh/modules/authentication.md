# 认证鉴权（Sa-Token）

ArchForge 使用 **Sa-Token 1.45.0** 做认证，**不是 JWT，也不是 Spring Security**。

两套相互独立的登录类型，会话保存在 Redis：

| 应用 | 工具类 | Sa-Token type | 端口 |
|-----|------|---------------|------|
| 管理端 | `StpAdminUtil` | `"admin"` | `:8080` |
| C 端 | `StpWebUtil` | `"web"` | `:8081` |

## 登录流程（管理端）

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

登录有限流：`@RateLimit(key = "login", time = 60, maxCount = 5, limitType = IP)` —— **每个 IP 每分钟最多 5 次**。

## 令牌管理

Sa-Token 签发的是 **UUID** 访问令牌（`token-style: uuid`），**不是**签名后的 JWT。

### 访问令牌

- 由 `StpAdminUtil.login(userId)` / `StpWebUtil.login(userId)` 创建
- 存放在 Sa-Token 会话（Redis）
- 请求头：`Authorization: Bearer <token>`
- 默认有效期：7 天（`sa-token.timeout: 604800`）

### 刷新令牌（管理端）

- 接口：`POST /auth/refresh-token`
- 随机 UUID 存在 Redis，映射到用户 ID
- 返回新的 Sa-Token 访问令牌以及新的刷新令牌

### 配置

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

生产环境密钥 **没有默认值**。Redis、数据源密码、RSA 密钥等都需要自行配置，不要把空的生产凭据提交进仓库。

## 授权

控制器使用带 type 的 Sa-Token 注解：

```java
@SaCheckLogin(type = StpAdminUtil.TYPE)
@SaCheckPermission(value = "system:user:add", type = StpAdminUtil.TYPE)
@PostMapping
public void addUser(...) { }
```

权限字符串来自 `sys_menu.permission`，例如 `system:user:add`、`system:role:query`、`monitor:job:list`。

获取当前管理端用户：

```java
SystemLoginUser loginUser = LoginContext.getAdminUser();
```

## 密码加密

仍然是双层：

1. **RSA** —— 前端用公钥加密密码，后端用 `arch-forge.rsa-private-key` 解密
2. **BCrypt** —— 数据库中存储哈希

## 公开接口（管理端）

通常无需登录：

- `POST /auth/login`
- `GET /auth/captchaImage`
- `GET /auth/getConfig`
- `GET /actuator/**`（随 Profile 变化）
- `GET /swagger-ui/**` 与 `GET /v3/api-docs/**`（生产环境关闭）

## 验证码

```yaml
arch-forge:
  captcha:
    enabled: true
  captcha-type: math     # "math" 或 "text"
```

图片由 **Kaptcha** 生成，临时存放在 Redis。

## 登录响应（管理端）

管理端 JSON 包装为 `{code, message, data}`。`data` 大致如下：

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

C 端（`archforge-server-web`）错误使用 RFC 9457 `ProblemDetail`，而不是上述信封。

## XSS 过滤

`XssFilter` 会清理 **查询参数和请求头**。跳过 `multipart/*`、`application/octet-stream`、`application/pdf` 与 `image/*`。JSON 请求体仍需控制器级校验。

## API 请求签名

敏感接口或第三方接入可使用 `@ApiSign`。拦截器校验：

| Header | 说明 |
|--------|------|
| `X-App-Key` | 应用标识 |
| `X-Timestamp` | 请求时间戳（毫秒） |
| `X-Nonce` | 一次性随机串（防重放） |
| `X-Sign` | 小写十六进制 HMAC-SHA256 签名 |

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

## 幂等 Token

`@Idempotent` 防止重复提交：

- **PARAM**：方法签名 + 参数哈希生成 Redis SETNX 锁
- **TOKEN**：客户端调用 `GET /idempotent/token`，再通过 `X-Idempotent-Token` 提交
- **HEADER**：基于指定请求头值加锁

## 相关页面

- [用户管理](./user-management.md) — 用户账户管理
- [角色与权限](./role-permission.md) — 角色、权限与数据范围
- [配置说明](/zh/guide/configuration.md) — Sa-Token、验证码、签名与幂等配置
- [菜单管理](./menu-management.md) — 登录后的异步路由加载
- [C 端 Web](/zh/guide/c-end-web.md) — `:8081` 上的 `StpWebUtil`
