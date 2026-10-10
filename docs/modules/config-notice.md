# Config & Notice

Two small admin modules: key-value system parameters, and notices (announcements) that also appear on the C-end.

## System Configuration

### Features

- Key-value parameters stored in `sys_config`
- Paginated list, create, update, delete

### Data Model — SysConfig (`sys_config`)

| Field | Type | Description |
|-------|------|-------------|
| configId | Long | Primary key |
| configName | String | Display name |
| configKey | String | Parameter key |
| configValue | String | Parameter value |
| configType | Integer | Built-in or custom |
| remark | String | Notes |

Plus the common audit fields (`creatorId`, `createTime`, `updaterId`, `updateTime`, `deleted`).

### API Endpoints

`ConfigController` (server-admin):

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/config` | `system:config:list` | Paginated list |
| POST | `/admin/config/create` | `system:config:add` | Create a parameter |
| PUT | `/admin/config/update` | `system:config:edit` | Update a parameter |
| POST | `/admin/config/delete` | `system:config:remove` | Delete a parameter |

### Seeded Parameters

Flyway `V2` seeds `sys.index.skinName`, `sys.index.sideTheme` and `sys.user.initPassword`. They are data for the
admin UI and your own code — the backend does not read them on its own, and values are not cached.

### Service Layer

`SysConfigService` (admin-user `api`): `findByConfigKey(key)` plus the usual CRUD; reads go straight to the database.

## Notice Management

### Features

- Create and manage notices and announcements
- Open / closed status — open notices are what the C-end shows
- Paginated list

### Data Model — SysNotice (`sys_notice`)

| Field | Type | Description |
|-------|------|-------------|
| noticeId | Long | Primary key |
| noticeTitle | String | Title |
| noticeType | Integer | `1` notification, `2` announcement |
| noticeContent | String | Content |
| status | Integer | `1` open, `0` closed |
| remark | String | Notes |

### API Endpoints

`NoticeController` (server-admin):

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/notice` | `system:notice:list` | Paginated list |
| POST | `/admin/notice/create` | `system:notice:add` | Create a notice |
| PUT | `/admin/notice/update` | `system:notice:edit` | Update a notice |
| POST | `/admin/notice/delete` | `system:notice:remove` | Delete a notice |

On the C-end, `GET /web/notices` returns the 20 most recent open notices (newest first).

## Related Pages

- [Role & Permission](./role-permission.md) — permissions for these endpoints
- [C-end Web](../guide/c-end-web.md) — where notices are shown
