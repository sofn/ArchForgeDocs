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

Enable or disable the monitor in your application YAML:

```yaml
arch-forge:
  monitor:
    enabled: true    # Set to false to disable the /server-info endpoint
```

The monitor is enabled by default in the dev profile.

## API Endpoint

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin-api/server-info` | Returns current server metrics |

### Response Structure

```json
{
  "cpu": {
    "cpuNum": 8,
    "total": 100.0,
    "sys": 12.5,
    "used": 35.2,
    "wait": 0.8,
    "free": 51.5
  },
  "memory": {
    "total": "16.00 GB",
    "used": "10.24 GB",
    "free": "5.76 GB",
    "usage": 64.0
  },
  "jvm": {
    "total": "512.00 MB",
    "max": "2048.00 MB",
    "free": "256.00 MB",
    "usage": 50.0,
    "version": "21.0.7",
    "home": "/usr/lib/jvm/java-21"
  },
  "sys": {
    "computerName": "archforge-server",
    "osName": "Linux",
    "osArch": "amd64",
    "userDir": "/app"
  },
  "sysFiles": [
    {
      "dirName": "/",
      "sysTypeName": "ext4",
      "typeName": "Local Disk",
      "total": "100.00 GB",
      "free": "45.00 GB",
      "used": "55.00 GB",
      "usage": 55.0
    }
  ]
}
```

## Frontend Dashboard

The monitoring page displays the server metrics in a visual dashboard with:

- **Progress bars** for CPU, memory, and JVM usage percentages
- **Disk table** showing all partitions with usage bars
- **System info cards** for OS and JVM details
- **Auto-refresh** button to periodically reload metrics

## How It Works

1. The frontend calls `GET /admin-api/server-info`
2. The backend uses Oshi to query hardware and OS sensors
3. JVM metrics are collected from `Runtime.getRuntime()` and `ManagementFactory`
4. All data is formatted and returned as a single JSON response

Oshi is a pure Java library with no native dependencies, making it compatible with both JVM and Native Image (Liberica NIK) deployments.

## Performance Notes

- Oshi queries are lightweight (~10ms per call)
- The endpoint is protected by authentication — only logged-in admins can access it
- Consider adjusting the frontend auto-refresh interval in production to avoid unnecessary load

## Related Pages

- [Configuration](../guide/configuration.md) — enable/disable monitoring
- [Docker Deployment](../deploy/docker.md) — monitoring in containerized environments
- [Log Management](./log-management.md) — application-level logging
