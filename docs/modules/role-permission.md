# Role & Permission

The role and permission system provides fine-grained access control with menu-based permissions and button-level authorization.

## Features

- Role CRUD with status management
- Menu permission tree for each role
- Button-level permission control via `permissions` array
- Duplicate role key/name detection
- Role-menu relationship management
- Role-level data scope / data permission

## Data Model

### SysRole (`sys_role`)

| Field | Type | Description |
|-------|------|-------------|
| roleId | Long | Primary key |
| roleName | String | Display name (e.g., "Administrator") |
| roleKey | String | Unique identifier (e.g., "admin") |
| roleSort | Integer | Sort order |
| status | Integer | Status (0: disabled, 1: enabled) |
| dataScope | Integer | Data scope (1 all, 2 custom, 3 single dept, 4 dept tree, 5 self-only) |
| remark | String | Notes |

### SysRoleMenu (`sys_role_menu`)

| Field | Type | Description |
|-------|------|-------------|
| roleId | Long | Role ID |
| menuId | Long | Menu ID |

This is a many-to-many join table linking roles to their permitted menus.

## API Endpoints

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin-api/list-all-role` | List all roles |
| POST | `/admin-api/list-role-ids` | Get role IDs for a user |
| POST | `/admin-api/role` | List roles (paginated) |
| POST | `/admin-api/role/create` | Create role |
| PUT | `/admin-api/role/update` | Update role |
| POST | `/admin-api/role/delete` | Delete role(s) |
| POST | `/admin-api/role/status` | Toggle role status |
| POST | `/admin-api/role/save-menu` | Save menu permissions for role |
| POST | `/admin-api/role-menu` | List role-menu data |
| POST | `/admin-api/role-menu-ids` | Get menu IDs for a role |

### Current admin API (`RoleController`)

`/system/role/*` was deleted. Use:

| Method | Endpoint | Permission |
|--------|----------|------------|
| POST | `/admin/role` | `system:role:query` |
| POST | `/admin/role/create` | `system:role:add` |
| POST | `/admin/role/update` | `system:role:edit` |
| POST | `/admin/role/delete` | `system:role:remove` |
| POST | `/admin/role/menu-ids` | `system:role:query` |

## Permission Model

### Menu-Level Permissions

Each role is assigned a set of menus. When a user logs in, the system loads all menus associated with their roles to build the sidebar navigation. Menus not in the user's role set are hidden.

### Button-Level Permissions

Menu items can have `isButton = true` with a `permission` string (e.g., `system:user:create`). These permissions are returned in the `meta.auths` array of the route data.

On the frontend, use the `hasPerms()` utility to conditionally render buttons:

```vue
<template>
  <el-button v-if="hasPerms(['system:user:create'])">
    Create User
  </el-button>
</template>
```

### Permission Format

Permissions follow the pattern: `module:entity:action`

| Permission | Description |
|-----------|-------------|
| `system:user:create` | Create user |
| `system:user:update` | Update user |
| `system:user:delete` | Delete user |
| `system:role:create` | Create role |
| `system:menu:create` | Create menu |

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

Admins set the data scope in the role management UI. When **Custom** is selected, a department tree lets the admin pick the allowed departments. The backend exposes `POST /system/role/data-scope` to persist the configuration.

### Usage in Code

```java
@GetMapping("/system/user")
@DataPermission(deptAlias = "deptId", userAlias = "userId")
public ResponseResult<PageResult<UserVO>> list(SysUserRequest request) {
    Specification<SysUser> spec = dataScopeSpecification.apply(
        queryHelper.build(request), DataScopeContextHolder.get()
    );
    return ResponseResult.success(userRepository.findAll(spec, pageable));
}
```

## Role Assignment Flow

1. Admin creates a role and assigns menu permissions via the permission tree
2. Admin sets the role's data scope (optional)
3. Admin assigns roles to users in the user management page
4. On login, the backend fetches the user's roles, menu permissions, and data scope
5. The frontend builds the sidebar and button visibility based on these permissions

## Related Pages

- [User Management](./user-management.md) — user-role assignment
- [Menu Management](./menu-management.md) — menu types and structure
- [Authentication](./authentication.md) — login and permission loading
