# 日志管理

ArchForge 在数据库里保存两类审计日志：带注解的管理端操作产生的**操作日志**，以及每次管理端登录尝试产生的**登录日志**。

## 操作日志

### 如何写入

带 `@Log` 注解的接口会被 `LogAspect` 包裹：记录调用人、模块、摘要、客户端 IP 及其归属地、操作系统与浏览器，以及调用是否成功。记录以事件形式发布，在事务提交后异步保存（`logTaskExecutor`），所以记日志既不会拖慢请求，也不会让请求失败。

### 数据模型——SysOperLog（`sys_oper_log`）

| 字段 | 类型 | 描述 |
|------|------|------|
| operId | Long | 主键 |
| username | String | 操作人 |
| module | String | 模块（取自 `@Log` 或类名） |
| summary | String | 操作摘要（取自 `@Log` 或方法名） |
| ip | String | 客户端 IP |
| address | String | IP 归属地 |
| systemName | String | 操作系统 |
| browser | String | 浏览器 |
| status | Integer | `1` 成功，`0` 失败 |
| operatingTime | DateTime | 操作时间 |

### API 接口

`OperationLogController`（server-admin）：

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/operation-log` | `monitor:operlog:list` | 分页查询 |
| POST | `/admin/operation-log/delete` | `monitor:operlog:remove` | 删除选中记录 |
| POST | `/admin/operation-log/clear` | `monitor:operlog:list` | 删除全部记录 |

## 登录日志

### 如何写入

`LoginService` 为每次管理端登录尝试写一条记录——成功与失败都写，原因放在 `behavior`。

### 数据模型——SysLoginLog（`sys_login_log`）

| 字段 | 类型 | 描述 |
|------|------|------|
| infoId | Long | 主键 |
| username | String | 登录名 |
| ip | String | 客户端 IP |
| address | String | IP 归属地 |
| systemName | String | 操作系统 |
| browser | String | 浏览器 |
| status | Integer | `1` 登录成功，`0` 登录失败（另定义了 `2` 退出、`3` 注册） |
| behavior | String | 说明，如"登录成功" / "登录失败" |
| loginTime | DateTime | 登录时间 |

### API 接口

`LoginLogController`（server-admin）：

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/login-log` | `monitor:logininfor:list` | 分页查询 |
| POST | `/admin/login-log/delete` | `monitor:logininfor:remove` | 删除选中记录 |
| POST | `/admin/login-log/clear` | `monitor:logininfor:list` | 删除全部记录 |

## 浏览器、系统与归属地

- User-Agent 解析使用 **Yauaa**（`UserAgentUtil`）。
- IP 归属地：内网地址显示"内网IP"；公网地址先查离线的 **ip2region** xdb 文件（首次使用时下载并缓存），查不到再走在线查询（`whois.pconline.com.cn`）。

## 日志保留

日志会一直保留，直到有人删除：逐条删除、*清空*全部，或者写一个定时任务删除旧数据。系统不会自动清理。

## 服务层

`SysOperLogService` 与 `SysLoginLogService`（admin-user 的 `api`）——增删改查与分页查询；C 端仪表盘也用它们统计当天数量、取最新操作。

## 相关页面

- [用户管理](./user-management.md) — 被记录操作的用户
- [认证鉴权](./authentication.md) — 产生登录日志的登录流程
- [服务监控](./server-monitor.md) — 系统级监控
