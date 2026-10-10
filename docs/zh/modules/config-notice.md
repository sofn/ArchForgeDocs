# 参数配置与通知公告

两个小的管理端模块：键值型的系统参数，以及同时会在 C 端展示的通知公告。

## 参数配置

### 功能特性

- 键值参数存放在 `sys_config`
- 分页查询、创建、更新、删除

### 数据模型——SysConfig（`sys_config`）

| 字段 | 类型 | 描述 |
|------|------|------|
| configId | Long | 主键 |
| configName | String | 显示名称 |
| configKey | String | 参数键 |
| configValue | String | 参数值 |
| configType | Integer | 内置或自定义 |
| remark | String | 备注 |

另有通用审计字段（`creatorId`、`createTime`、`updaterId`、`updateTime`、`deleted`）。

### API 接口

`ConfigController`（server-admin）：

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/config` | `system:config:list` | 分页查询 |
| POST | `/admin/config/create` | `system:config:add` | 创建参数 |
| PUT | `/admin/config/update` | `system:config:edit` | 更新参数 |
| POST | `/admin/config/delete` | `system:config:remove` | 删除参数 |

### 种子参数

Flyway `V2` 种入 `sys.index.skinName`、`sys.index.sideTheme`、`sys.user.initPassword`。它们是给管理端界面和你自己的代码用的数据——后端不会主动读取，也没有缓存。

### 服务层

`SysConfigService`（admin-user 的 `api`）：`findByConfigKey(key)` 加常规增删改查；读取直接查数据库。

## 通知公告

### 功能特性

- 创建、管理通知与公告
- 开启 / 关闭状态——C 端只展示开启的公告
- 分页查询

### 数据模型——SysNotice（`sys_notice`）

| 字段 | 类型 | 描述 |
|------|------|------|
| noticeId | Long | 主键 |
| noticeTitle | String | 标题 |
| noticeType | Integer | `1` 通知，`2` 公告 |
| noticeContent | String | 内容 |
| status | Integer | `1` 开启，`0` 关闭 |
| remark | String | 备注 |

### API 接口

`NoticeController`（server-admin）：

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/notice` | `system:notice:list` | 分页查询 |
| POST | `/admin/notice/create` | `system:notice:add` | 创建公告 |
| PUT | `/admin/notice/update` | `system:notice:edit` | 更新公告 |
| POST | `/admin/notice/delete` | `system:notice:remove` | 删除公告 |

C 端的 `GET /web/notices` 返回最近 20 条开启状态的公告（新的在前）。

## 相关页面

- [角色与权限](./role-permission.md) — 这些接口的权限
- [C 端 Web](../guide/c-end-web.md) — 公告的展示位置
