# User Management

The user management module covers the admin console's users: paginated search with a department tree, create / edit
/ soft-delete, enable / disable, password reset, role assignment and export.

## Features

- User list with pagination, filters and a department tree; the list runs under the caller's
  [data scope](./role-permission.md#data-permission)
- Create, edit and delete users (delete is a soft delete)
- Enable / disable accounts
- Reset passwords
- Assign a role (one role per user)
- Export the list as xlsx

## Data Model

`SysUser` (`sys_user`), plus the audit fields every entity has (`creatorId`, `createTime`, `updaterId`, `updateTime`,
`deleted`):

| Field | Type | Description |
|-------|------|-------------|
| userId | Long | Primary key |
| roleId | Long | The user's role (`0` = none) |
| deptId | Long | Department |
| username | String | Login name — 2–64 letters, digits, `_`, `.` or `-` |
| nickname | String | Display name |
| userType | Integer | User type |
| email | String | Email (format-checked when present) |
| phoneNumber | String | Mobile number (`1[3-9]` + 9 digits when present) |
| sex | Integer | `0` male, `1` female, `2` unknown |
| avatar | String | Avatar URL |
| password | String | BCrypt hash |
| status | Integer | `1` normal; any other value blocks login (the backend defines `2` disabled, `3` frozen; the admin UI's switch writes `0`) |
| loginIp / loginDate | String / DateTime | Last successful login |
| isAdmin | Boolean | Super administrator |
| remark | String | Notes |

## API Endpoints

`UserController` and `UserExportController` (server-admin). The authoritative list is `ArchForge/spec/openapi.yaml`.

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/user` | `system:user:list` | Paginated list with filters (data scope applied) |
| POST | `/admin/user/create` | `system:user:add` | Create a user |
| PUT | `/admin/user/update` | `system:user:edit` | Update profile fields (and status, if sent) |
| POST | `/admin/user/delete` | `system:user:remove` | Soft-delete a user |
| POST | `/admin/user/status` | `system:user:edit` | Change the status |
| POST | `/admin/user/reset-password` | `system:user:resetPwd` | Set a new password |
| POST | `/admin/user/assign-role` | `system:user:edit` | Assign a role (the first id in `ids` is used) |
| POST | `/admin/user/list-role-ids` | `system:user:query` | The user's role id (as a list) |
| GET | `/admin/user/export` | `system:user:export` | Export users as xlsx |

The old RESTful `/system/user/*` endpoints no longer exist.

## Department Tree Filter

The user page shows the department tree on the left (`POST /admin/dept`, which accepts `system:dept:list`,
`system:user:list` or `system:role:list`). Clicking a node filters the list to that department.

## Login Rules and Password Security

- An admin login needs `status = 1`, a user that is not deleted, and a role — unless the user is a super administrator
  (`isAdmin`). Otherwise the login is refused.
- The server expects the login password RSA-encrypted (PKCS#1 v1.5) with the public key of `arch-forge.rsa-private-key`. The prod profile rejects a password it cannot decrypt (code `10106`, "密码解密失败"); other profiles fall back to the password as sent. **The stock admin UI sends the password unencrypted today**, so a prod deployment needs a login client that encrypts it. The decrypted password is checked against the BCrypt hash.
- Create and reset-password send the new password in the request body (use HTTPS); the server stores only the BCrypt
  hash.

## Service Layer

`UserController` → `AdminUserService` (server-admin, DTO mapping and data scope) → `SysUserService` (admin-user `api`).
`SysUserService` validates username, email and phone formats and fills defaults (`status = 1`, `roleId = 0`). Queries
use JPA Specifications (`QueryHelp`); the repository is internal to the admin-user module
([ADR-0010](https://github.com/sofn/ArchForge/blob/main/docs/adr/0010-repositories-are-internal.md)).

## Related Pages

- [Role & Permission](./role-permission.md) — roles, menu permissions, data scope
- [Authentication](./authentication.md) — login and Sa-Token flow
- [Log Management](./log-management.md) — login and operation logs
