# 日志管理

ArchForge 内置了用户操作日志和登录日志功能，便于审计追踪和安全监控。

## 操作日志

### 功能特性

- 自动记录增删改查操作
- 记录操作者、操作类型、请求参数和响应
- 分页列表，支持搜索筛选
- 批量删除和清空全部

### 数据模型 — SysOperLog（`sys_oper_log`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| operId | Long | 主键 |
| title | String | 操作模块名称 |
| businessType | Integer | 操作类型（创建/更新/删除等） |
| method | String | 控制器方法名 |
| requestMethod | String | HTTP 方法（GET/POST/PUT/DELETE） |
| operUrl | String | 请求 URL |
| operIp | String | 操作者 IP 地址 |
| operLocation | String | IP 地理位置（通过 ip2region） |
| operParam | String | 请求参数（JSON） |
| jsonResult | String | 响应内容（JSON） |
| status | Integer | 结果状态（0：失败，1：成功） |
| errorMsg | String | 错误信息（失败时） |
| operName | String | 操作者用户名 |
| operTime | DateTime | 操作时间 |

### API 接口

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/admin-api/operation-logs` | 查询操作日志列表（分页） |
| POST | `/admin-api/operation-logs/delete` | 删除选中的日志 |
| POST | `/admin-api/operation-logs/clear` | 清空所有操作日志 |

## 登录日志

### 功能特性

- 记录每次登录尝试（成功和失败）
- 捕获浏览器、操作系统、IP 和地理位置
- 适用于安全审计和异常检测
- 分页列表，支持搜索筛选

### 数据模型 — SysLoginLog（`sys_login_log`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| loginId | Long | 主键 |
| username | String | 登录用户名 |
| ipaddr | String | 登录 IP 地址 |
| loginLocation | String | IP 地理位置 |
| browser | String | 浏览器名称和版本 |
| os | String | 操作系统 |
| status | Integer | 结果（0：失败，1：成功） |
| msg | String | 消息（成功或错误原因） |
| loginTime | DateTime | 登录时间 |

浏览器和操作系统检测使用 **UserAgentUtils** 库，IP 地理位置使用离线的 **ip2region** 数据库。

### API 接口

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/admin-api/login-logs` | 查询登录日志列表（分页） |
| POST | `/admin-api/login-logs/delete` | 删除选中的日志 |
| POST | `/admin-api/login-logs/clear` | 清空所有登录日志 |

## 日志保留策略

默认情况下，日志将永久保存。管理员可以：

- 通过管理后台**手动删除**特定日志条目
- 使用清空接口**清空所有**日志
- 通过添加定时任务来**实现自动清理**，删除超过可配置时间段的日志

## 服务层

- `SysOperLogService` — 操作日志的增删改查
- `SysLoginLogService` — 登录日志的增删改查
- 两个服务都使用 Spring Data JPA 仓库配合 QueryDSL 进行动态筛选

## 相关页面

- [用户管理](./user-management.md) — 被记录操作的用户
- [认证鉴权](./authentication.md) — 生成登录日志的登录流程
- [服务监控](./server-monitor.md) — 系统级监控
