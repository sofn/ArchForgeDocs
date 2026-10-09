# 仪表盘

管理端 Welcome（`src/views/welcome/index.vue`）读取真实接口，不再用静态演示数字。认证：sa-token 管理端域，类级 `@SaCheckLogin`。

## 接口

| 方法 | 路径 | 含义 |
|------|------|------|
| GET | `/admin/dashboard/metrics` | 数量：用户、文章、元表格、任务 |
| GET | `/admin/dashboard/trends?days=7` | 近 N 天的时间序列 |
| GET | `/admin/dashboard/recent-activities` | 最近的文章动态 |
| GET | `/admin/dashboard/todo` | 草稿 / 未发布 / 待办 |

成功信封：`{ code, message, data }`，`code === 0`。

## 示例

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/admin/dashboard/metrics
```

典型的 `data`：

```json
{
  "userCount": 12,
  "articleCount": 40,
  "metaTableCount": 3,
  "taskCount": 0
}
```

`taskCount` 目前恒为 `0`——仪表盘还没有接入任务数据源。

`trends` 接受 `days`（默认 7），Welcome 页面用它画图。

## 界面

Welcome 在 `/welcome`（`src/views/welcome/index.vue`）。卡片与 `metrics` 一一对应；折线图用 `trends`；动态列表用 `recent-activities`。

仓库里没有托管截图。在本地运行 Admin（`:8848`）和 `archforge-server-admin`（`:8080`）即可看到。

## 相关

- 权限：每个接口都校验 `dashboard:view`（由 Flyway `V17` 种入）。
- 契约：`ArchForge/spec/openapi.yaml`（`/admin/dashboard/*`）。
