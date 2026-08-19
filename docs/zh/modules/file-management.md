# 文件管理

ArchForge 提供了完整的文件生命周期管理，支持本地文件系统以及 S3 兼容存储（开发环境使用 RustFS）。

## 功能特性

- **上传与图片上传** — 支持多文件上传，内置扩展名/大小/MIME 白名单校验。
- **列表** — 分页查看文件，可按照原始文件名与存储类型筛选。
- **下载** — 通过文件 ID 下载，响应头携带原始文件名。
- **删除** — 同时删除数据库记录与存储后端中的文件。

## 数据模型 — SysFile（`sys_file`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| fileId | Long | 主键 |
| originalName | String | 原始文件名 |
| storageName | String | 基于 UUID 的存储文件名 |
| storagePath | String | 存储后端使用的路径 |
| fileSize | Long | 文件大小（字节） |
| contentType | String | MIME 类型 |
| extension | String | 扩展名 |
| storageType | String | `local` 或 `s3` |
| createTime | DateTime | 上传时间 |

## API 接口

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/file/upload` | 上传文件 |
| POST | `/file/upload-image` | 上传图片（规则与 upload 相同） |
| POST | `/file/list` | 分页查询文件列表 |
| GET | `/file/download/{fileId}` | 根据文件 ID 下载 |
| POST | `/file/delete` | 删除文件记录与存储对象 |

### 列表请求示例

```json
{
  "currentPage": 1,
  "pageSize": 10,
  "originalName": "report",
  "storageType": "local"
}
```

### 上传响应示例

```json
{
  "fileId": 42,
  "originalName": "report.pdf",
  "downloadUrl": "/file/download/42",
  "fileSize": 102400
}
```

## 存储配置

文件存储在 `arch-forge.file-storage` 下配置：

```yaml
arch-forge:
  file-storage:
    type: local           # local 或 s3
    local-dir: uploads    # 本地存储基础目录
    max-file-size: 10485760   # 默认 10 MB
    allowed-extensions:       # 扩展名白名单（不带点号）
      - jpg
      - png
      - pdf
      - zip
    blocked-mime-types:       # 禁用的 MIME 类型
      - application/x-msdownload
      - application/x-sh
    s3:
      endpoint: http://localhost:9000
      access-key: minioadmin
      secret-key: minioadmin
      bucket: archforge
      region: us-east-1
```

## 存储后端

`FileStorageService` 接口由两个适配器实现：

- **LocalFileStorageService** — 文件存放在 `arch-forge.file-storage.local-dir` 下。
- **S3FileStorageService** — 上传到配置好的 S3 兼容端点。

`AdaptiveFileStorageServiceFactory` 根据 `fileStorage.type` 自动选择实现。

## 安全说明

- 上传会校验扩展名与 MIME 类型。
- 限制最大文件大小。
- 下载与删除接口需要 `@SaCheckLogin` / `@SaCheckPermission`。

## 相关页面

- [项目结构](/zh/guide/project-structure.md) — `SysFile` 与存储层所在位置
- [技术栈](/zh/guide/tech-stack.md) — S3/RustFS 选型说明
- [定时任务](./quartz.md) — 使用定时任务清理过期文件
