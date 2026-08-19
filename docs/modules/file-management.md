# File Management

ArchForge provides a complete file lifecycle management interface, supporting both local filesystem and S3-compatible storage (tested with RustFS in dev).

## Features

- **Upload and image upload** — Multipart upload with extension/size/MIME allow-lists.
- **List** — Paginated file list with filters by original name and storage type.
- **Download** — Direct download by file ID with original filename in `Content-Disposition`.
- **Delete** — Remove file record and storage object.

## Data Model — SysFile (`sys_file`)

| Field | Type | Description |
|-------|------|-------------|
| fileId | Long | Primary key |
| originalName | String | Original filename |
| storageName | String | UUID-based stored filename |
| storagePath | String | Path used by the storage backend |
| fileSize | Long | File size in bytes |
| contentType | String | MIME type |
| extension | String | File extension |
| storageType | String | `local` or `s3` |
| createTime | DateTime | Upload time |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/file/upload` | Upload a file |
| POST | `/file/upload-image` | Upload an image (same restrictions as upload) |
| POST | `/file/list` | Query file list with pagination |
| GET | `/file/download/{fileId}` | Download file by ID |
| POST | `/file/delete` | Delete a file record and its storage object |

### List Request Example

```json
{
  "currentPage": 1,
  "pageSize": 10,
  "originalName": "report",
  "storageType": "local"
}
```

### Upload Response Example

```json
{
  "fileId": 42,
  "originalName": "report.pdf",
  "downloadUrl": "/file/download/42",
  "fileSize": 102400
}
```

## Storage Configuration

File storage is configured under `arch-forge.file-storage`:

```yaml
arch-forge:
  file-storage:
    type: local           # local or s3
    local-dir: uploads    # local storage base directory
    max-file-size: 10485760   # 10 MB default
    allowed-extensions:       # whitelist (without dot)
      - jpg
      - png
      - pdf
      - zip
    blocked-mime-types:       # blocked MIME types
      - application/x-msdownload
      - application/x-sh
    s3:
      endpoint: http://localhost:9000
      access-key: minioadmin
      secret-key: minioadmin
      bucket: archforge
      region: us-east-1
```

## Storage Backend

The `FileStorageService` interface is implemented by two adapters:

- **LocalFileStorageService** — stores files under `arch-forge.file-storage.local-dir`.
- **S3FileStorageService** — uploads to the configured S3-compatible endpoint.

The `AdaptiveFileStorageServiceFactory` picks the right implementation based on `fileStorage.type`.

## Security Notes

- Uploads are checked against extension and MIME type lists.
- Maximum file size is enforced.
- Download and delete endpoints require `@SaCheckLogin` / `@SaCheckPermission`.

## Related Pages

- [Project Structure](../guide/project-structure.md) — where `SysFile` and the storage layer live
- [Tech Stack](../guide/tech-stack.md) — S3/RustFS technology choices
- [Quartz Scheduling](./quartz.md) — use scheduled jobs to clean up expired files
