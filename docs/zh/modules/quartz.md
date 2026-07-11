# 定时任务

ArchForge 集成 Spring Quartz，提供基于反射、可在管理后台配置的任务调度系统。任务通过 `beanName.methodName(params)` 的方式定义，无需为每个任务新建 Quartz Job 类。

## 功能特性

- **反射式调用** — 使用 `beanName.methodName(params)` 即可定义一个任务。
- **完整 CRUD** — 创建、更新、删除、暂停、恢复、立即执行。
- **执行日志** — 每次执行记录状态、耗时、起止时间和错误信息。
- **Cron 校验** — 保存前可通过接口校验 Cron 表达式。
- **并发控制** — 可设置任务是否允许并发执行。

## 数据模型 — SysQuartzJob（`sys_quartz_job`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | Long | 主键 |
| jobName | String | 任务名称 |
| jobGroup | String | 任务分组 |
| description | String | 任务描述 |
| beanName | String | 目标 Spring Bean 名称 |
| methodName | String | 要调用的方法名 |
| methodParams | String | 可选参数 |
| cron | String | Cron 表达式 |
| misfirePolicy | Short | 错失执行策略 |
| concurrent | Boolean | 是否允许并发 |
| status | Short | `1` 暂停，`2` 运行 |

## 数据模型 — SysQuartzLog（`sys_quartz_log`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | Long | 主键 |
| jobId | Long | 关联任务 |
| jobName | String | 任务名称 |
| jobGroup | String | 任务分组 |
| beanName | String | 目标 Bean |
| methodName | String | 调用方法 |
| methodParams | String | 调用参数 |
| status | Short | `0` 成功，`1` 失败 |
| errorMessage | String | 失败时的错误信息 |
| durationMs | Long | 执行耗时（毫秒） |
| startedAt | DateTime | 开始时间 |
| finishedAt | DateTime | 结束时间 |

## API 接口

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/quartz/list` | 分页查询任务列表 |
| POST | `/quartz/add` | 新建任务 |
| PUT | `/quartz/update/{id}` | 更新任务 |
| DELETE | `/quartz/delete/{id}` | 删除任务 |
| POST | `/quartz/pause/{id}` | 暂停任务 |
| POST | `/quartz/resume/{id}` | 恢复任务 |
| POST | `/quartz/run/{id}` | 立即执行一次 |
| POST | `/quartz/log/list` | 查询任务执行日志 |
| POST | `/quartz/validate-cron` | 校验 Cron 表达式 |

### 任务定义示例

```json
{
  "jobName": "cleanTempFiles",
  "jobGroup": "system",
  "description": "每日清理临时文件",
  "beanName": "fileCleanupService",
  "methodName": "clean",
  "methodParams": "30",
  "cron": "0 0 2 * * ?",
  "concurrent": false,
  "status": 2
}
```

## 工作原理

1. 管理后台将任务定义提交到 `QuartzJobController`。
2. `QuartzJobService` 持久化 `SysQuartzJob` 记录。
3. `QuartzReflectionJob` 在触发时读取 bean、方法、参数并反射调用目标 Spring Bean。
4. 执行完成后生成 `SysQuartzLog` 记录执行结果。

## 安全说明

- 管理接口需要 `ADMIN` 角色。
- 反射调用范围限制为 Spring 容器内已注册的 Bean。

## 相关页面

- [项目结构](/zh/guide/project-structure.md) — `SysQuartzJob` 与 `QuartzReflectionJob` 所在位置
- [文件管理](./file-management.md) — 常见使用场景：定时清理过期文件
