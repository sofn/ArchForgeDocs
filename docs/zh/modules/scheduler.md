# 定时任务（db-scheduler）

ArchForge 集成 [db-scheduler](https://github.com/kagkarlsson/db-scheduler)，提供基于反射、可在管理后台配置的任务调度系统。任务通过 `beanName.methodName(params)` 的方式定义，无需为每个任务新建 Job 类。运行时状态只存一张 `scheduled_tasks` 表——Quartz 及其十一张 `QRTZ_*` 表已全部移除。

## 功能特性

- **反射式调用** — 使用 `beanName.methodName(params)` 即可定义一个任务。
- **完整 CRUD** — 创建、更新、删除、暂停、恢复、立即执行。
- **动态调度** — 修改 Cron 即一次 `reschedule`；调度计划与任务数据一起持久化在 `task_data` 中。
- **执行日志** — 每次执行记录状态、耗时、起止时间和错误信息。
- **Cron 校验** — 保存前可通过接口校验 Cron 表达式。
- **天然集群安全** — 乐观锁 + `picked` 轮询取代 Quartz 的数据库锁管理器，多实例共享调度无需额外表。

## 与原 Quartz 集成的语义差异

| 关注点 | 行为 |
|--------|------|
| Cron 格式 | 6 字段含秒（`0/30 * * * * *`）；Quartz 风格的 `?` 会被归一化为 `*` |
| 错过的执行 | 跳过——在下一个 Cron 周期触发，不补跑 |
| 并发 | 同一任务实例恒为串行；`concurrent` 字段仅为 UI 兼容保留 |
| 暂停 | 移除运行时实例；`sys_scheduled_job` 行仍是恢复依据，`resume` 时重建 |
| Misfire 策略 | 字段保留为元数据；运行时按"跳过"处理 |

## 数据模型 — SysScheduledJob（`sys_scheduled_job`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | Long | 主键 |
| jobName | String | 任务名称（与 jobGroup 联合唯一） |
| jobGroup | String | 任务分组 |
| description | String | 任务描述 |
| beanName | String | 目标 Spring Bean 名称 |
| methodName | String | 要调用的方法名 |
| methodParams | String | JSON 数组格式的原始类型参数 |
| cron | String | 6 字段 Cron 表达式 |
| misfirePolicy | Short | 兼容保留，见上表语义说明 |
| concurrent | Boolean | 兼容保留，见上表语义说明 |
| status | Short | `0` 运行，`1` 暂停 |

## 数据模型 — SysJobLog（`sys_job_log`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| id | Long | 主键 |
| jobId | Long | 关联任务 |
| jobName / jobGroup | String | 任务身份快照 |
| beanName / methodName | String | 调用目标快照 |
| methodParams | String | 使用的参数 |
| status | Short | `0` 成功，`1` 失败 |
| errorMessage | String | 失败时的错误信息 |
| durationMs | Long | 执行耗时（毫秒） |
| startedAt / finishedAt | DateTime | 执行起止时间 |

## 运行时表 — `scheduled_tasks`

db-scheduler 自身的单表（由迁移 V23 创建）：每个任务实例一行，`task_data` 存 Java 序列化的 `JobInvocationData`（任务载荷**连同调度计划**）。集群竞争由 `version` 乐观锁列解决。

## API 接口

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/quartz` | 分页查询任务列表 |
| POST | `/quartz/add` | 新增任务 |
| PUT | `/quartz/update/{id}` | 更新任务 |
| DELETE | `/quartz/{id}` | 删除任务 |
| POST | `/quartz/pause/{id}` | 暂停任务 |
| POST | `/quartz/resume/{id}` | 恢复任务 |
| POST | `/quartz/run/{id}` | 立即执行一次（一次性实例） |
| GET | `/quartz/log` | 查询执行日志 |
| POST | `/quartz/validate-cron` | 校验 Cron 表达式 |

端点路径保留 `/quartz` 前缀以兼容前端。

### 任务定义示例

```json
{
  "jobName": "cleanTempFiles",
  "jobGroup": "system",
  "description": "每天清理临时文件",
  "beanName": "fileCleanupService",
  "methodName": "clean",
  "methodParams": "[30]",
  "cron": "0 0 2 * * *",
  "concurrent": false,
  "status": 0
}
```

## 工作原理

1. 管理后台把任务定义发给 `SchedulerJobController`（`/quartz`）。
2. `ScheduledJobService` 校验（Cron 格式、`arch-forge.scheduler.allowed-job-beans` 名单、公有声明方法）后落库 `SysScheduledJob`。
3. 服务层对 db-scheduler 实例做幂等 upsert：运行中的任务走 `scheduleIfNotExists` / `reschedule`，暂停的走 `cancel`。启动时 `SchedulerStartupSync` 逐行对账并清理孤儿实例，保证重启后状态一致。
4. `ReflectionJobHandler` 在 db-scheduler 工作线程上执行载荷，并把结果写入 `SysJobLog`。

## 安全说明

- 所有管理接口要求 `ADMIN` 角色及 `monitor:job:*` 权限。
- 反射调用仅限名单内 Bean 的公有声明方法——通过 `arch-forge.scheduler.allowed-job-beans` 配置。

## 相关页面

- [项目结构](../guide/project-structure.md) — `SysScheduledJob` 与 `ReflectionJobHandler` 所在位置
- [文件管理](./file-management.md) — 定时清理是常见用法
