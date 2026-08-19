# Observability

ArchForge ships with a pre-configured observability stack based on **Prometheus**, **Grafana**, **Jaeger**, and **Alertmanager**. It consumes metrics from `/actuator/prometheus` and traces via OpenTelemetry OTLP.

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

Or use the dev helper:

```bash
scripts/dev/init-observability.sh
```

Grafana default credentials: `admin / admin`.

### 2. Connect the backend

#### Docker Compose deployment

The production/staging/fulljre/jlink compose files already attach to the `archforge-observability` network and export:

- `OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:4318/v1/traces`
- `SAMPLING_PROBABILITY=0.1`

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

## Shut down

```bash
cd docker/observability
docker compose down
```

To stop everything including dev containers:

```bash
scripts/dev/down.sh
```
