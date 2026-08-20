# 仪表盘

管理端 Welcome（`src/views/welcome/index.vue`）读真实接口，不再用静态演示数字。认证：sa-token 管理端域，类级 `@SaCheckLogin`。

## 接口

| 方法 | 路径 | 含义 |
|------|------|------|
| GET | `/admin/dashboard/metrics` | 用户 / 文章 / 元表 / 任务数量 |
| GET | `/admin/dashboard/trends?days=7` | 近 N 天趋势 |
| GET | `/admin/dashboard/recent-activities` | 最近文章活动 |
| GET | `/admin/dashboard/todo` | 草稿 / 待办聚合 |

成功信封：`{ code, message, data }`，`code === 0`。

## 示例

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/dashboard/metrics
```

Welcome 卡片对应 `metrics`，折线对应 `trends`，列表对应 `recent-activities`。

仓库里没有托管截图。本地 Admin `:8848` + `archforge-server-admin` `:8080`。

权限一般为 `dashboard:view`（Flyway `V17`）。契约见 `ArchForgeSpec/api/openapi.yaml`。
