# 可观测性

ArchForge 提供了一套预配置的可观测性栈，基于 **Prometheus**、**Grafana**、**Jaeger** 和 **Alertmanager**。它通过 `/actuator/prometheus` 采集指标，并通过 OpenTelemetry OTLP 接收分布式追踪。

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

或使用开发脚本：

```bash
scripts/dev/init-observability.sh
```

Grafana 默认账号：`admin / admin`。

### 2. 连接后端

#### Docker Compose 部署

prod/staging/fulljre/jlink 等 compose 文件已挂载 `archforge-observability` 网络，并注入环境变量：

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`
- `SAMPLING_PROBABILITY=0.1`

先启动可观测性栈，使网络存在后再启动应用栈：

```bash
cd docker
docker compose up -d
```

#### 本地 `bootRun`

本地开发使用 `./gradlew server-admin:bootRun` 时，将 OTLP 指向 Jaeger 暴露的宿主机端口：

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export SAMPLING_PROBABILITY=1.0
./gradlew server-admin:bootRun
```

Prometheus 已配置 `host.docker.internal:8080` 目标，可自动抓取本地启动的后端指标。

## 预置仪表盘

Grafana 会自动加载两个 Dashboard：

- **ArchForge Spring Boot Overview**：请求速率、P99 延迟、JVM 堆内存、CPU、运行时长
- **ArchForge JVM Details**：堆内存、非堆内存、线程数、已加载类、GC 停顿

将新的 Dashboard JSON 放入 `docker/observability/grafana/dashboards/` 即可自动加载。

## 预置告警规则

Prometheus 告警规则位于 `docker/observability/prometheus/rules/archforge.yml`：

| 告警 | 触发条件 |
|-------|---------|
| `HighErrorRate` | 5xx 比例在 2 分钟内超过 1% |
| `HighLatency` | P99 延迟在 5 分钟内超过 2 秒 |
| `JvmHeapHigh` | JVM 堆内存使用超过 85% |
| `CpuHigh` | CPU 使用超过 80% |
| `DiskSpaceLow` | 磁盘剩余空间低于 15% |
| `ApplicationDown` | Actuator 抓取目标不可用 |

Alertmanager 默认配置了一个占位 webhook 接收器，请修改 `docker/observability/alertmanager/alertmanager.yml` 指向真实通知渠道。

## 分布式 Trace

1. 发起一次后端请求。
2. 打开 Grafana → Explore → `Jaeger` 数据源。
3. 按服务名 `ArchForge` 或 `traceId` 搜索。

也可直接使用 Jaeger UI：http://localhost:16686。

## 关闭

```bash
cd docker/observability
docker compose down
```

一键停止包括开发环境在内的所有容器：

```bash
scripts/dev/down.sh
```
