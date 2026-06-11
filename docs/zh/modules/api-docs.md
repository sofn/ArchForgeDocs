# API 文档（Swagger）

ArchForge 集成了 SpringDoc OpenAPI，提供交互式 API 文档，既可作为独立页面访问，也可嵌入管理后台中。

## 配置

SpringDoc 在 `application.yaml` 中配置：

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

## 访问地址

| 资源 | URL | 描述 |
|----------|-----|-------------|
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` | 交互式 API 浏览器 |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` | 原始 OpenAPI 3.0 规范 |
| 管理后台 | 管理菜单中的嵌入 iframe | 管理后台内的 Swagger UI |

## 嵌入管理后台

Swagger UI 作为 iframe 菜单项嵌入管理后台。配置为如下菜单条目：

- **菜单类型**：内嵌页（3）
- **frameSrc**：`/swagger-ui/index.html`
- **isFrameSrcInternal**：`true`

Nginx 配置将 Swagger 请求代理到后端：

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

## API 接口汇总

### 认证相关

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/login` | 用户登录 |
| POST | `/refresh-token` | 刷新 JWT 令牌 |
| GET | `/getLoginUserInfo` | 获取当前用户信息 |
| GET | `/getRouters` | 获取菜单路由（旧版） |
| GET | `/get-async-routes` | 获取前端异步路由 |
| GET | `/captchaImage` | 生成验证码图片 |
| GET | `/getConfig` | 获取应用配置 |

### 管理端增删改查 API（`/admin-api/`）

| 分类 | 接口路径 | 数量 |
|----------|-----------|-------|
| 用户管理 | `/admin-api/user/*` | 7 个接口 |
| 角色管理 | `/admin-api/role/*` | 6 个接口 |
| 菜单管理 | `/admin-api/menu/*` | 4 个接口 |
| 部门管理 | `/admin-api/dept/*` | 3 个接口 |
| 参数配置 | `/admin-api/config/*` | 4 个接口 |
| 通知公告 | `/admin-api/notice/*` | 4 个接口 |
| 操作日志 | `/admin-api/operation-logs/*` | 3 个接口 |
| 登录日志 | `/admin-api/login-logs/*` | 3 个接口 |
| 服务监控 | `/admin-api/server-info` | 1 个接口 |
| 文件管理 | `/admin-api/file/*` | 2 个接口 |

### 文件上传/下载

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/admin-api/file/upload` | 上传文件（本地或 S3/RustFS 后端） |
| GET | `/admin-api/file/download/{id}` | 根据 ID 下载文件 |

### RESTful 系统 API（`/system/`）

| 控制器 | 基础路径 | 接口数 |
|-----------|-----------|-----------|
| SysUserController | `/system/user` | 10 个接口 |
| SysRoleController | `/system/role` | 12 个接口 |
| SysMenuController | `/system/menu` | 11 个接口 |

## 为新接口添加 API 文档

在控制器上使用 SpringDoc 注解：

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

## 相关页面

- [菜单管理](./menu-management.md) — iframe 菜单配置
- [认证鉴权](./authentication.md) — 登录和令牌 API
- [配置说明](/zh/guide/configuration.md) — SpringDoc YAML 设置
