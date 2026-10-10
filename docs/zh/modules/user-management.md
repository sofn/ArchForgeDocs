# 用户管理

用户管理模块负责管理端的用户：带部门树的分页查询、创建 / 编辑 / 软删除、启用 / 停用、重置密码、分配角色与导出。

## 功能特性

- 用户列表：分页、筛选、部门树；查询按调用者的[数据范围](./role-permission.md#数据权限)执行
- 创建、编辑、删除用户（删除为软删除）
- 启用 / 停用账号
- 重置密码
- 分配角色（每个用户一个角色）
- 导出为 xlsx

## 数据模型

`SysUser`（`sys_user`），另有所有实体共有的审计字段（`creatorId`、`createTime`、`updaterId`、`updateTime`、`deleted`）：

| 字段 | 类型 | 描述 |
|------|------|------|
| userId | Long | 主键 |
| roleId | Long | 用户的角色（`0` 表示无角色） |
| deptId | Long | 所属部门 |
| username | String | 登录名——2~64 位字母、数字、`_`、`.` 或 `-` |
| nickname | String | 昵称 |
| userType | Integer | 用户类型 |
| email | String | 邮箱（填写时校验格式） |
| phoneNumber | String | 手机号（填写时须为 `1[3-9]` 开头的 11 位号码） |
| sex | Integer | `0` 男，`1` 女，`2` 未知 |
| avatar | String | 头像地址 |
| password | String | BCrypt 哈希 |
| status | Integer | `1` 正常；其他值都不能登录（后端定义了 `2` 停用、`3` 冻结；管理端的开关写入 `0`） |
| loginIp / loginDate | String / DateTime | 最近一次成功登录 |
| isAdmin | Boolean | 超级管理员 |
| remark | String | 备注 |

## API 接口

`UserController` 与 `UserExportController`（server-admin）。权威清单是 `ArchForge/spec/openapi.yaml`。

| 方法 | 接口路径 | 权限 | 描述 |
|------|----------|------|------|
| POST | `/admin/user` | `system:user:list` | 分页查询（按数据范围过滤） |
| POST | `/admin/user/create` | `system:user:add` | 创建用户 |
| PUT | `/admin/user/update` | `system:user:edit` | 更新资料（传了状态则一并更新） |
| POST | `/admin/user/delete` | `system:user:remove` | 软删除用户 |
| POST | `/admin/user/status` | `system:user:edit` | 修改状态 |
| POST | `/admin/user/reset-password` | `system:user:resetPwd` | 设置新密码 |
| POST | `/admin/user/assign-role` | `system:user:edit` | 分配角色（取 `ids` 中的第一个） |
| POST | `/admin/user/list-role-ids` | `system:user:query` | 用户的角色 id（列表形式） |
| GET | `/admin/user/export` | `system:user:export` | 导出用户为 xlsx |

旧的 RESTful `/system/user/*` 接口已不存在。

## 部门树筛选

用户页左侧是部门树（`POST /admin/dept`，拥有 `system:dept:list`、`system:user:list`、`system:role:list` 任一权限即可）。点击节点即按该部门筛选列表。

## 登录规则与密码安全

- 登录管理端需要 `status = 1`、未删除，并且有角色——超级管理员（`isAdmin`）除外。否则拒绝登录。
- 服务端要求登录密码用 `arch-forge.rsa-private-key` 对应的公钥做 RSA 加密（PKCS#1 v1.5）。prod profile 解不开就拒绝（错误码 `10106`，"密码解密失败"）；其他 profile 回退为按原文处理。**目前自带的管理端界面发送的是明文密码**，所以 prod 部署需要一个会加密密码的登录客户端。解密后的密码与 BCrypt 哈希比对。
- 创建用户与重置密码时，新密码放在请求体里（请使用 HTTPS），服务端只保存 BCrypt 哈希。

## 服务层

`UserController` → `AdminUserService`（server-admin，负责 DTO 转换与数据范围）→ `SysUserService`（admin-user 的 `api`）。`SysUserService` 校验登录名、邮箱、手机号格式并补默认值（`status = 1`、`roleId = 0`）。查询使用 JPA Specification（`QueryHelp`）；Repository 属于 admin-user 模块内部（[ADR-0010](https://github.com/sofn/ArchForge/blob/main/docs/adr/0010-repositories-are-internal.md)）。

## 相关页面

- [角色与权限](./role-permission.md) — 角色、菜单权限、数据范围
- [认证鉴权](./authentication.md) — 登录与 Sa-Token 流程
- [日志管理](./log-management.md) — 登录日志与操作日志
