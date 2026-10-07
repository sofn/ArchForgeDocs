# 可观测性

ArchForge 提供了一套预配置的可观测性栈，基于 **Prometheus**、**Grafana**、**Jaeger** 和 **Alertmanager**。它通过 `/actuator/prometheus` 采集指标（`dev` 在业务端口上，`staging` / `prod` 在管理端口上：admin `8089`、web `8091`），并通过 OpenTelemetry OTLP 接收分布式追踪。

## 组件

| 组件 | 作用 | 默认地址 |
|-----------|---------|-------------|
| Prometheus | 指标采集与告警 | http://localhost:9090 |
| Grafana | 仪表盘与 Trace 探索 | http://localhost:3000 |
| Jaeger | 分布式 Trace 后端 | http://localhost:16686 |
| Alertmanager | 告警路由（示例 webhook） | http://localhost:9093 |

## 快速开始

### 1. 启动可观测性栈

```bash
cd docker/observability
docker compose up -d
```

Grafana 账号：`admin` / `GRAFANA_ADMIN_PASSWORD` 的值（默认 `changeme`，请自行设置）。

### 2. 连接后端

#### Docker Compose 部署

prod/staging/fulljre/jlink 等 compose 文件已挂载 `archforge-observability` 网络（prod/staging 中 admin **和** web 都加入），并注入环境变量：

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`
- `SAMPLING_PROBABILITY=0.1`

Prometheus 通过 DNS 服务发现找到后端——`archforge` / `backend` 的 `8089` 端口（admin）与 `backend-web` 的 `8091` 端口（web）——所以你的部署里不存在的服务名不会变成永远 down 的目标。Jaeger 自身的指标从它的管理端口 `14269` 采集。

先启动可观测性栈，使网络存在后再启动应用栈：

```bash
cd docker
docker compose up -d
```

#### 本地 `bootRun`

本地开发使用 `./gradlew :archforge-server-admin:bootRun` 时，将 OTLP 指向 Jaeger 暴露的宿主机端口：

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export SAMPLING_PROBABILITY=1.0
./gradlew :archforge-server-admin:bootRun
```

Prometheus 已配置 `host.docker.internal:8080` 目标，可自动抓取本地启动的后端指标。

## 预置仪表盘

Grafana 会自动加载两个 Dashboard：

- **ArchForge Spring Boot Overview**：请求速率、P99 延迟、JVM 堆内存、CPU、运行时长
- **ArchForge JVM Details**：堆内存、非堆内存、线程数、已加载类、GC 停顿

将新的 Dashboard JSON 放入 `docker/observability/grafana/dashboards/` 即可自动加载。

## 预置告警规则

Prometheus 告警规则位于 `docker/observability/prometheus/rules/archforge.yml`：

| 告警 | 级别 | 触发条件 |
|-------|------|---------|
| `HighErrorRate` | critical | 按应用统计，5xx 比例持续 2 分钟超过 1%，且有真实流量（> 0.1 req/s） |
| `HighLatency` | warning | 按应用统计，P99 延迟持续 5 分钟超过 2 秒 |
| `JvmHeapHigh` | warning | 单实例整堆使用率超过 85% |
| `CpuHigh` | warning | 进程 CPU（按整机归一化）超过 80% |
| `DiskSpaceLow` | warning / critical | 磁盘剩余低于 15% / 5%（critical 会抑制 warning） |
| `DbPoolExhausted` | critical | 有线程在等 JDBC 连接（`hikaricp_connections_pending > 0`）持续 2 分钟 |
| `DbPoolSaturated` | warning | 连接池忙碌超过 90% 持续 5 分钟 |
| `ApplicationDown` | critical | Actuator 抓取目标不可用 |

业务错误按响应契约返回 HTTP 200，按状态码的规则看不到它们；改为按业务码计数：`archforge_business_errors_total{code=...}`。

告警发往 `ALERT_WEBHOOK_URL`（在执行 `docker compose` 的环境里设置；Alertmanager 配置是容器启动时渲染的模板）。载荷是 Alertmanager 标准 webhook JSON——企业微信 / 钉钉 / 飞书机器人需要在前面加适配器（如 `prometheus-webhook-dingtalk`），把 `ALERT_WEBHOOK_URL` 指向适配器。不设置时告警照常计算，但不会送达。

## 分布式 Trace

1. 发起一次后端请求。
2. 打开 Grafana → Explore → `Jaeger` 数据源。
3. 按服务名 `ArchForge` 或 `traceId` 搜索。

也可直接使用 Jaeger UI：http://localhost:16686。

应用的每行日志都带 `[traceId,requestId]`，从日志可以直接跳到对应的链路。

## 关闭

```bash
cd docker/observability
docker compose down
```

开发依赖（PostgreSQL / Redis）单独停止：

```bash
./archforge infra down
```
