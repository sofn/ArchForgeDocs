# Server Monitor (Oshi)

ArchForge includes a built-in server monitoring dashboard powered by [Oshi](https://github.com/oshi/oshi), providing real-time visibility into system resources directly from the admin panel.

## Features

- **CPU**: Usage percentage, core count, model info
- **Memory**: Total, used, free, usage percentage
- **JVM**: Heap usage, non-heap usage, max memory, JVM version
- **Operating System**: Name, version, architecture
- **Disk**: Partition info, total space, used space, usage percentage
- Auto-refresh dashboard with configurable interval

## Configuration

The monitor is on unless you turn it off:

```yaml
arch-forge:
  monitor:
    enabled: false   # default true; when off, GET /admin/server returns {"error": "服务器监控未启用"}
```

## API Endpoint

| Method | Endpoint | Guard | Description |
|--------|----------|-------|-------------|
| GET | `/admin/server` | role `ADMIN` + `monitor:server:list` | Current server metrics |

### Response Structure

`data` of the admin envelope; sizes are formatted strings, usages are percentages:

```json
{
  "cpu": { "name": "…", "physicalCount": 8, "logicalCount": 16, "userUsage": 12.5, "sysUsage": 3.1, "idle": 84.4 },
  "memory": { "total": "16.00 GB", "used": "10.24 GB", "available": "5.76 GB", "usage": 64.0 },
  "jvm": {
    "heapMax": "2.00 GB", "heapUsed": "512.00 MB", "nonHeapUsed": "180.00 MB",
    "javaVersion": "25", "javaVendor": "…", "javaHome": "/usr/lib/jvm/…", "vmName": "OpenJDK 64-Bit Server VM",
    "startTime": "2026-10-08T09:00:00Z"
  },
  "os": { "name": "…", "arch": "amd64", "hostName": "archforge", "hostAddress": "172.18.0.5",
          "processCount": 312, "threadCount": 1420 },
  "disks": [
    { "name": "/dev/sda1", "mount": "/", "type": "ext4", "total": "100.00 GB", "used": "55.00 GB",
      "available": "45.00 GB", "usage": 55.0 }
  ],
  "error": null
}
```

The five sections are collected in parallel (`StructuredTaskScope`).

## Frontend Dashboard

The monitoring page displays the server metrics in a visual dashboard with:

- **Progress bars** for CPU, memory, and JVM usage percentages
- **Disk table** showing all partitions with usage bars
- **System info cards** for OS and JVM details
- **Auto-refresh** button to periodically reload metrics

## How It Works

1. The frontend calls `GET /admin/server`
2. The backend uses Oshi to query hardware and OS sensors
3. JVM metrics are collected from `Runtime.getRuntime()` and `ManagementFactory`
4. All data is formatted and returned as a single JSON response

Oshi is a pure Java library with no native dependencies, making it compatible with both JVM and Native Image (Liberica NIK) deployments.

## Performance Notes

- Oshi queries are lightweight (~10ms per call)
- The endpoint needs a logged-in admin with role `ADMIN` and `monitor:server:list`
- Consider adjusting the frontend auto-refresh interval in production to avoid unnecessary load

## Related Pages

- [Configuration](../guide/configuration.md) — enable/disable monitoring
- [Docker Deployment](../deploy/docker.md) — monitoring in containerized environments
- [Log Management](./log-management.md) — application-level logging
