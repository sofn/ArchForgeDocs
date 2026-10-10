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

监控默认开启，需要时手动关闭：

```yaml
arch-forge:
  monitor:
    enabled: false   # 默认 true；关闭后 GET /admin/server 返回 {"error": "服务器监控未启用"}
```

## API 接口

| 方法 | 接口路径 | 访问控制 | 描述 |
|------|----------|----------|------|
| GET | `/admin/server` | 角色 `ADMIN` + `monitor:server:list` | 当前服务器指标 |

### 响应结构

位于管理端信封的 `data` 中；容量为格式化字符串，使用率为百分比：

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

五个部分并行采集（`StructuredTaskScope`）。

## 前端仪表盘

监控页面以可视化仪表盘形式展示服务器指标：

- **进度条**展示 CPU、内存和 JVM 使用百分比
- **磁盘表格**显示所有分区及其使用情况
- **系统信息卡片**展示操作系统和 JVM 详情
- **自动刷新**按钮可定期重新加载指标数据

## 工作原理

1. 前端调用 `GET /admin/server`
2. 后端使用 Oshi 查询硬件和操作系统传感器数据
3. JVM 指标通过 `Runtime.getRuntime()` 和 `ManagementFactory` 采集
4. 所有数据格式化后以单个 JSON 响应返回

Oshi 是一个纯 Java 库，没有原生依赖，因此兼容 JVM 和 Native Image（Liberica NIK）两种部署方式。

## 性能说明

- Oshi 查询非常轻量（每次调用约 10ms）
- 该接口要求已登录、具备 `ADMIN` 角色且拥有 `monitor:server:list` 权限
- 建议在生产环境中调整前端自动刷新间隔，避免不必要的负载

## 相关页面

- [配置说明](/zh/guide/configuration.md) — 启用/禁用监控
- [Docker 部署](/zh/deploy/docker.md) — 容器化环境中的监控
- [日志管理](./log-management.md) — 应用级日志
