# Role & Permission

Roles carry three things: the menus (and buttons) their members can use, the permission strings the backend checks,
and a data scope that limits which rows they see.

## Features

- Role CRUD with status management
- Menu permission tree per role (menus, pages and buttons)
- Button-level permissions — the same strings the backend checks with `@SaCheckPermission`
- Role-level data scope

## Data Model

### SysRole (`sys_role`)

| Field | Type | Description |
|-------|------|-------------|
| roleId | Long | Primary key |
| roleName | String | Display name (e.g. "Administrator") |
| roleKey | String | Role key (e.g. `admin`) |
| roleSort | Integer | Sort order |
| status | Short | `1` enabled, `0` disabled |
| dataScope | Short | `1` all, `2` custom, `3` own department, `4` department tree, `5` self only |
| deptIdSet | String | Departments for the custom scope |
| remark | String | Notes |

### SysRoleMenu (`sys_role_menu`)

| Field | Type | Description |
|-------|------|-------------|
| roleId | Long | Role ID |
| menuId | Long | Menu ID |

The many-to-many join between roles and the menus / buttons they may use.

## API Endpoints

`RoleController` and `PermissionMatrixController` (server-admin). The authoritative list is
`ArchForge/spec/openapi.yaml`; the old `/system/role/*` endpoints no longer exist.

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/role` | `system:role:list` | Paginated role list |
| GET | `/admin/role/all` | `system:role:query` | All roles (for pickers) |
| POST | `/admin/role/create` | `system:role:add` | Create a role |
| PUT | `/admin/role/update` | `system:role:edit` | Update a role |
| POST | `/admin/role/delete` | `system:role:remove` | Delete a role |
| POST | `/admin/role/status` | `system:role:edit` | Enable / disable |
| POST | `/admin/role/data-scope` | `system:role:edit` | Set the data scope (and departments for custom) |
| POST | `/admin/role/menu` | `system:role:query` | Menu tree for the permission dialog |
| POST | `/admin/role/menu-ids` | `system:role:query` | Menu ids granted to a role |
| POST | `/admin/role/save-menu` | `system:role:edit` | Save the role's menus |
| GET | `/admin/permission-matrix/menus/tree` | `system:role:query` | Menu permission tree |
| GET | `/admin/permission-matrix/roles/{roleId}/permissions` | `system:role:query` | A role's granted menus |
| PUT | `/admin/permission-matrix/roles/{roleId}/permissions` | `system:role:edit` | Save a role's grants |

## Permission Model

### Menu-Level Permissions

Each role is granted a set of menus. At login the backend loads the role's menus; the sidebar is built from them
(`GET /admin/auth/get-async-routes`), and menus outside the set are not returned.

### Button-Level Permissions

A menu entry with `isButton = true` carries a permission string such as `system:user:add`. Controllers check the same
string — `@SaCheckPermission(value = "system:user:add", type = StpAdminUtil.TYPE)` — and the strings also reach the
frontend in each route's `meta.auths`. Every admin handler declares a permission, and every checked permission must be
grantable through a seeded menu or button (both enforced by tests).

On the frontend, `hasPerms()` / `v-perms` hide what the user cannot do:

```vue
<template>
  <el-button v-if="hasPerms(['system:user:add'])">Create user</el-button>
</template>
```

### Permission Format

`module:entity:action`, with the actions used throughout the seed data:

| Permission | Description |
|-----------|-------------|
| `system:user:list` / `query` | List / read users |
| `system:user:add` | Create user |
| `system:user:edit` | Update user |
| `system:user:remove` | Delete user |
| `system:role:add` | Create role |
| `system:menu:add` | Create menu |

## Data Permission

In addition to menu and button permissions, each role can define a **data scope** that controls which records the role's members can see. The scope is stored on `sys_role.data_scope` and applied via the `@DataPermission` annotation combined with JPA Specifications.

### Data Scopes

| Scope | Value | Description |
|-------|-------|-------------|
| All | 1 | Access all data |
| Custom | 2 | Access data only from selected departments |
| Single Department | 3 | Access data from the user's own department |
| Department Tree | 4 | Access data from the user's department and all descendants |
| Self Only | 5 | Access only records created by the user |

### Configuration

Admins set the data scope in the role management UI. When **Custom** is selected, a department tree lets the admin pick the allowed departments. The backend exposes `POST /admin/role/data-scope` to persist the configuration.

### Usage in Code

```java
// AdminUserServiceImpl — behind POST /admin/user (system:user:list)
@DataPermission(deptAlias = "deptId", userAlias = "id")
public AdminPageResponse<AdminUserDTO> getUserList(AdminUserListRequest request) {
    Specification<SysUser> spec = (root, q, cb) -> QueryHelp.getPredicate(root, criteria, cb);
    spec = dataScopeSpecification.apply(spec, DataScopeContextHolder.get());
    Page<SysUser> users = sysUserService.findAll(spec, pageable);
    // ...map to DTOs
}
```

The scope only exists inside a `@DataPermission` call, and it fails closed: when the current user cannot be resolved the call sees no rows at all. Every meta-table row-data endpoint carries the annotation (a contract test fails on one that does not), and generated module controllers check their `<tableCode>:*` permissions and run export/import under the caller's data scope.

## Role Assignment Flow

1. An admin creates a role and grants menus and buttons in the permission tree
2. Optionally sets the role's data scope
3. Assigns the role to users on the user page (one role per user)
4. At login the backend loads the user's role, permissions and data scope
5. The frontend builds the sidebar and button visibility from them

## Related Pages

- [User Management](./user-management.md) — assigning roles to users
- [Menu Management](./menu-management.md) — menu types and structure
- [Authentication](./authentication.md) — login and permission loading
