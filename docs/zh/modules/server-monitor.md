# 服务监控（Oshi）

ArchForge 内置了基于 [Oshi](https://github.com/oshi/oshi) 的服务器监控仪表盘，可直接在管理后台中实时查看系统资源使用情况。

## 功能特性

- **CPU**：使用率、核心数、型号信息
- **内存**：总量、已用、空闲、使用百分比
- **JVM**：堆内存使用、非堆内存使用、最大内存、JVM 版本
- **操作系统**：名称、版本、架构
- **磁盘**：分区信息、总空间、已用空间、使用百分比
- 自动刷新仪表盘，可配置刷新间隔

## 配置

在应用 YAML 中启用或禁用监控：

```yaml
arch-forge:
  monitor:
    enabled: true    # Set to false to disable the /server-info endpoint
```

监控在 dev 配置文件中默认启用。

## API 接口

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| GET | `/admin-api/server-info` | 返回当前服务器指标 |

### 响应结构

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

## 前端仪表盘

监控页面以可视化仪表盘形式展示服务器指标：

- **进度条**展示 CPU、内存和 JVM 使用百分比
- **磁盘表格**显示所有分区及其使用情况
- **系统信息卡片**展示操作系统和 JVM 详情
- **自动刷新**按钮可定期重新加载指标数据

## 工作原理

1. 前端调用 `GET /admin-api/server-info`
2. 后端使用 Oshi 查询硬件和操作系统传感器数据
3. JVM 指标通过 `Runtime.getRuntime()` 和 `ManagementFactory` 采集
4. 所有数据格式化后以单个 JSON 响应返回

Oshi 是一个纯 Java 库，没有原生依赖，因此兼容 JVM 和 Native Image（Liberica NIK）两种部署方式。

## 性能说明

- Oshi 查询非常轻量（每次调用约 10ms）
- 该接口受认证保护——仅已登录的管理员可以访问
- 建议在生产环境中调整前端自动刷新间隔，避免不必要的负载

## 相关页面

- [配置说明](/zh/guide/configuration.md) — 启用/禁用监控
- [Docker 部署](/zh/deploy/docker.md) — 容器化环境中的监控
- [日志管理](./log-management.md) — 应用级日志
