# 角色与权限

角色与权限系统提供细粒度的访问控制，支持基于菜单的权限和按钮级别的授权。

## 功能特性

- 角色增删改查及状态管理
- 每个角色对应的菜单权限树
- 通过 `permissions` 数组实现按钮级别的权限控制
- 角色标识/名称重复检测
- 角色-菜单关系管理
- 角色数据范围（数据权限）

## 数据模型

### SysRole（`sys_role`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| roleId | Long | 主键 |
| roleName | String | 显示名称（如"管理员"） |
| roleKey | String | 唯一标识符（如"admin"） |
| roleSort | Integer | 排序序号 |
| status | Integer | 状态（0：禁用，1：启用） |
| dataScope | Integer | 数据范围（1 全部，2 自定义，3 本部门，4 本部门及以下，5 仅本人） |
| remark | String | 备注 |

### SysRoleMenu（`sys_role_menu`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| roleId | Long | 角色 ID |
| menuId | Long | 菜单 ID |

这是一个多对多关联表，将角色与其允许访问的菜单关联起来。

## API 接口

### 管理端 API

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| GET | `/admin-api/list-all-role` | 查询所有角色 |
| POST | `/admin-api/list-role-ids` | 获取用户的角色 ID 列表 |
| POST | `/admin-api/role` | 查询角色列表（分页） |
| POST | `/admin-api/role/create` | 创建角色 |
| PUT | `/admin-api/role/update` | 更新角色 |
| POST | `/admin-api/role/delete` | 删除角色 |
| POST | `/admin-api/role/status` | 切换角色状态 |
| POST | `/admin-api/role/save-menu` | 保存角色的菜单权限 |
| POST | `/admin-api/role-menu` | 查询角色-菜单数据 |
| POST | `/admin-api/role-menu-ids` | 获取角色的菜单 ID 列表 |

### 当前管理端 API

`/system/role/*` 已删除，使用 `/admin/role/*`（`system:role:query|add|edit|remove`）。

## 权限模型

### 菜单级权限

每个角色被分配一组菜单。当用户登录时，系统会加载与其角色关联的所有菜单来构建侧边栏导航。不在用户角色集中的菜单将被隐藏。

### 按钮级权限

菜单项可以设置 `isButton = true` 并带有一个 `permission` 字符串（如 `system:user:create`）。这些权限会在路由数据的 `meta.auths` 数组中返回。

在前端，使用 `hasPerms()` 工具函数来条件渲染按钮：

```vue
<template>
  <el-button v-if="hasPerms(['system:user:create'])">
    Create User
  </el-button>
</template>
```

### 权限格式

权限遵循以下模式：`module:entity:action`

| 权限 | 描述 |
|-----------|-------------|
| `system:user:create` | 创建用户 |
| `system:user:update` | 更新用户 |
| `system:user:delete` | 删除用户 |
| `system:role:create` | 创建角色 |
| `system:menu:create` | 创建菜单 |

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

管理员在角色管理页面设置数据范围。选择**自定义数据权限**时，可通过部门树选择允许的部门。后端通过 `POST /system/role/data-scope` 接口保存配置。

### 代码用法

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

## 角色分配流程

1. 管理员创建角色并通过权限树分配菜单权限
2. 管理员设置角色的数据范围（可选）
3. 管理员在用户管理页面为用户分配角色
4. 登录时，后端获取用户的角色、菜单权限和数据范围
5. 前端根据这些权限构建侧边栏和按钮可见性

## 相关页面

- [用户管理](./user-management.md) — 用户-角色分配
- [菜单管理](./menu-management.md) — 菜单类型与结构
- [认证鉴权](./authentication.md) — 登录和权限加载
