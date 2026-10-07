# Observability

ArchForge ships with a pre-configured observability stack based on **Prometheus**, **Grafana**, **Jaeger**, and **Alertmanager**. It consumes metrics from `/actuator/prometheus` — on the business port in `dev`, on the management ports (admin `8089`, web `8091`) in `staging` / `prod` — and traces via OpenTelemetry OTLP.

## Components

| Component | Purpose | Default URL |
|-----------|---------|-------------|
| Prometheus | Metrics collection & alerting | http://localhost:9090 |
| Grafana | Dashboards & trace exploration | http://localhost:3000 |
| Jaeger | Distributed trace backend | http://localhost:16686 |
| Alertmanager | Alert routing (example webhook) | http://localhost:9093 |

## Quick Start

### 1. Start the observability stack

```bash
cd docker/observability
docker compose up -d
```

Grafana credentials: `admin` / the value of `GRAFANA_ADMIN_PASSWORD` (default `changeme` — set your own).

### 2. Connect the backend

#### Docker Compose deployment

The production/staging/fulljre/jlink compose files already attach to the `archforge-observability` network (admin **and** web in production/staging) and export:

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`
- `SAMPLING_PROBABILITY=0.1`

Prometheus finds the backends by DNS service discovery — `archforge` / `backend` on port `8089` (admin) and `backend-web` on port `8091` (web) — so service names that do not exist in your stack never show up as permanently-down targets. Jaeger's own metrics are scraped on its admin port `14269`.

Start the app stack **after** the observability stack is up so the network exists:

```bash
cd docker
docker compose up -d
```

#### Local `bootRun`

For local development with `./gradlew :archforge-server-admin:bootRun`, point the OTLP exporter to the Jaeger container on the host:

```bash
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
export SAMPLING_PROBABILITY=1.0
./gradlew :archforge-server-admin:bootRun
```

Prometheus is configured with a `host.docker.internal:8080` target so it can scrape the local backend from the container.

## Pre-configured Dashboards

Grafana loads two dashboards automatically:

- **ArchForge Spring Boot Overview** — request rate, P99 latency, JVM heap, CPU, uptime
- **ArchForge JVM Details** — heap, non-heap, threads, loaded classes, GC pause

You can add more dashboards by dropping JSON files into `docker/observability/grafana/dashboards/`.

## Pre-configured Alerts

Prometheus alert rules are in `docker/observability/prometheus/rules/archforge.yml`:

| Alert | Trigger |
|-------|---------|
| `HighErrorRate` | 5xx rate > 1% over 2 minutes |
| `HighLatency` | P99 latency > 2s over 5 minutes |
| `JvmHeapHigh` | JVM heap usage > 85% |
| `CpuHigh` | CPU usage > 80% |
| `DiskSpaceLow` | Free disk space < 15% |
| `ApplicationDown` | Actuator scrape target is down |

Alertmanager is configured with a placeholder webhook receiver. Edit `docker/observability/alertmanager/alertmanager.yml` to point at your real notification channel.

## Distributed Traces

1. Trigger a request against the backend.
2. Open Grafana → Explore → `Jaeger` datasource.
3. Search by service name `ArchForge` or paste a `traceId`.

You can also use the standalone Jaeger UI at http://localhost:16686.

Every application log line carries `[traceId,requestId]`, so a log line leads straight to its trace.

## Shut down

```bash
cd docker/observability
docker compose down
```

Dev dependencies (PostgreSQL / Redis) are stopped separately:

```bash
./archforge infra down
```
