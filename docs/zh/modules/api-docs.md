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

| 资源 | 地址 | 描述 |
|------|------|------|
| Swagger UI | `http://localhost:8080/swagger-ui/index.html` | server-admin 的交互式接口浏览 |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` | 实时 OpenAPI 文档（无需登录） |
| server-web | `http://localhost:8081/swagger-ui/index.html` | C 端接口（prod 之外） |
| 管理后台 | "Swagger" iframe 菜单 | 在管理控制台内打开 Swagger UI |

`application-prod.yaml` 关闭了两个 springdoc 端点，生产环境两个页面都不提供。

## 嵌入管理后台

Flyway 为 Swagger UI 种入了一个 iframe 菜单：

- **菜单类型**：Iframe（3）
- **frameSrc**：`/swagger-ui/index.html`
- **isFrameSrcInternal**：`true`——管理端会在框架地址前加上自己的源

开发时管理端的 dev server 把 `/swagger-ui`、`/v3/api-docs` 代理到 `:8080`（`vite.config.ts`），iframe 开箱即用。生产前端镜像只代理 `/api/`，prod 也关闭了 springdoc——把内嵌页面当作开发辅助即可。

## 契约

完整、最新的接口清单是生成的契约 `ArchForge/spec/openapi.yaml`（合并了 server-admin 与 server-web，2026-10 时为 147 个操作）。它由运行中的代码通过 `./gradlew generateOpenApi` 生成；过期时 CI 失败，管理端与 C 端也从它生成 TypeScript 类型。旧的 `/admin-api/*` 与 `/system/*` 路径都已不存在。

### 接口地图（server-admin）

| 领域 | 前缀 | 操作数 | 页面 |
|------|------|------:|------|
| 登录、路由、验证码 | `/admin/auth` | 8 | [认证鉴权](./authentication.md) |
| 用户 | `/admin/user` | 9 | [用户管理](./user-management.md) |
| 角色、权限矩阵 | `/admin/role`、`/admin/permission-matrix` | 10 + 3 | [角色与权限](./role-permission.md) |
| 菜单 | `/admin/menu` | 4 | [菜单管理](./menu-management.md) |
| 部门 | `/admin/dept` | 4 | — |
| 字典 | `/admin/system/dict` | 8 | — |
| 参数、公告 | `/admin/config`、`/admin/notice` | 4 + 4 | [参数配置与通知公告](./config-notice.md) |
| 操作 / 登录日志 | `/admin/operation-log`、`/admin/login-log` | 3 + 3 | [日志管理](./log-management.md) |
| 服务器、缓存、在线用户 | `/admin/server`、`/admin/monitor` | 1 + 2 | [服务监控](./server-monitor.md) |
| 文件 | `/admin/file` | 5 | [文件管理](./file-management.md) |
| 定时任务 | `/admin/scheduler-job` | 9 | [定时任务](./scheduler.md) |
| 元表格 | `/admin/meta-table` | 21 | [元表格](./meta-table.md) |
| CMS | `/admin/cms` | 11 | — |
| 任务 | `/admin/task` | 7 | — |
| ChatAI | `/admin/chat` | 6 | [ChatAI](./chatai.md) |
| 仪表盘 | `/admin/dashboard` | 4 | [仪表盘](./dashboard.md) |

server-web 在 `/web/*` 下提供 C 端接口（登录注册、文章、分类、公告、文件、仪表盘）——见 [C 端 Web](../guide/c-end-web.md)。

## 为新接口添加 API 文档

在控制器上使用 SpringDoc 注解。管理端接口放在 `/admin/*` 下，并声明权限：

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

然后执行 `./gradlew generateOpenApi`，把重新生成的 `spec/openapi.yaml` 和改动一起提交；再把新权限作为菜单按钮种入，角色才能被授予它。

## 相关页面

- [菜单管理](./menu-management.md) — iframe 菜单配置
- [认证鉴权](./authentication.md) — 登录和令牌 API
- [配置说明](/zh/guide/configuration.md) — SpringDoc YAML 设置
