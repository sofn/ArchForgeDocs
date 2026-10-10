# 角色与权限

角色承载三样东西：成员能用的菜单（和按钮）、后端校验的权限字符串，以及限定可见数据行的数据范围。

## 功能特性

- 角色增删改查与状态管理
- 每个角色一棵菜单权限树（菜单、页面、按钮）
- 按钮级权限——与后端 `@SaCheckPermission` 校验的是同一批字符串
- 角色级数据范围

## 数据模型

### SysRole（`sys_role`）

| 字段 | 类型 | 描述 |
|------|------|------|
| roleId | Long | 主键 |
| roleName | String | 显示名称（如"管理员"） |
| roleKey | String | 角色标识（如 `admin`） |
| roleSort | Integer | 排序 |
| status | Short | `1` 启用，`0` 停用 |
| dataScope | Short | `1` 全部，`2` 自定义，`3` 本部门，`4` 本部门及以下，`5` 仅本人 |
| deptIdSet | String | 自定义数据范围的部门 |
| remark | String | 备注 |

### SysRoleMenu（`sys_role_menu`）

| 字段 | 类型 | 描述 |
|------|------|------|
| roleId | Long | 角色 ID |
| menuId | Long | 菜单 ID |

角色与其可用菜单 / 按钮之间的多对多关联表。

## API 接口

`RoleController` 与 `PermissionMatrixController`（server-admin）。权威清单是 `ArchForge/spec/openapi.yaml`；旧的 `/system/role/*` 接口已不存在。

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/role` | `system:role:list` | 分页角色列表 |
| GET | `/admin/role/all` | `system:role:query` | 全部角色（供选择器使用） |
| POST | `/admin/role/create` | `system:role:add` | 创建角色 |
| PUT | `/admin/role/update` | `system:role:edit` | 更新角色 |
| POST | `/admin/role/delete` | `system:role:remove` | 删除角色 |
| POST | `/admin/role/status` | `system:role:edit` | 启用 / 停用 |
| POST | `/admin/role/data-scope` | `system:role:edit` | 设置数据范围（自定义时含部门） |
| POST | `/admin/role/menu` | `system:role:query` | 权限对话框的菜单树 |
| POST | `/admin/role/menu-ids` | `system:role:query` | 角色已授权的菜单 id |
| POST | `/admin/role/save-menu` | `system:role:edit` | 保存角色菜单 |
| GET | `/admin/permission-matrix/menus/tree` | `system:role:query` | 菜单权限树 |
| GET | `/admin/permission-matrix/roles/{roleId}/permissions` | `system:role:query` | 角色已授权菜单 |
| PUT | `/admin/permission-matrix/roles/{roleId}/permissions` | `system:role:edit` | 保存角色授权 |

## 权限模型

### 菜单级权限

每个角色被授予一组菜单。登录时后端加载角色的菜单，侧边栏由它们生成（`GET /admin/auth/get-async-routes`），不在其中的菜单不会返回。

### 按钮级权限

`isButton = true` 的菜单项带一个权限字符串，如 `system:user:add`。控制器校验同一个字符串——`@SaCheckPermission(value = "system:user:add", type = StpAdminUtil.TYPE)`——这些字符串也会出现在每条路由的 `meta.auths` 里下发给前端。每个管理端接口都声明了权限，并且每个被校验的权限都必须能通过种子菜单或按钮授予（两点都有测试保证）。

前端用 `hasPerms()` / `v-perms` 隐藏用户无权执行的操作：

```vue
<template>
  <el-button v-if="hasPerms(['system:user:add'])">新增用户</el-button>
</template>
```

### 权限格式

`模块:实体:动作`，种子数据中统一使用这些动作：

| 权限 | 描述 |
|------|------|
| `system:user:list` / `query` | 查询 / 查看用户 |
| `system:user:add` | 新增用户 |
| `system:user:edit` | 修改用户 |
| `system:user:remove` | 删除用户 |
| `system:role:add` | 新增角色 |
| `system:menu:add` | 新增菜单 |

## 数据权限

除了菜单与按钮权限，每个角色还可以定义一个**数据范围**，控制该角色成员可查看的数据记录。数据范围存储在 `sys_role.data_scope` 中，通过 `@DataPermission` 注解与 JPA Specification 组合生效。

### 数据范围

| 范围 | 值 | 说明 |
|-------|-------|-------------|
| 全部数据权限 | 1 | 可访问所有数据 |
| 自定义数据权限 | 2 | 仅可访问指定部门的数据 |
| 本部门数据权限 | 3 | 仅可访问用户所在部门的数据 |
| 本部门及以下数据权限 | 4 | 可访问用户所在部门及其所有子部门的数据 |
| 仅本人数据权限 | 5 | 仅可访问本人创建的数据 |

### 配置方式

管理员在角色管理页面设置数据范围。选择**自定义数据权限**时，可通过部门树选择允许的部门。后端通过 `POST /admin/role/data-scope` 接口保存配置。

### 代码用法

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

数据范围只在 `@DataPermission` 调用内生效，并且失败关闭：解析不出当前用户时一行都不返回。元表格的每个数据接口都带这个注解（缺了会让契约测试失败）；生成的模块控制器会校验各自的 `<tableCode>:*` 权限，导入导出也按调用者的数据范围执行。

## 角色分配流程

1. 管理员创建角色，并在权限树中授予菜单与按钮
2. 可选：设置角色的数据范围
3. 在用户页为用户分配角色（每个用户一个角色）
4. 登录时后端加载用户的角色、权限与数据范围
5. 前端据此生成侧边栏并控制按钮可见性

## 相关页面

- [用户管理](./user-management.md) — 为用户分配角色
- [菜单管理](./menu-management.md) — 菜单类型与结构
- [认证鉴权](./authentication.md) — 登录与权限加载
