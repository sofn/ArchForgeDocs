# 用户管理

用户管理模块提供完整的系统用户增删改查操作，包括基于部门的筛选、状态控制、密码管理和角色分配。

## 功能特性

- 用户列表，支持分页、搜索和部门树筛选
- 创建 / 编辑 / 删除用户
- 启用 / 禁用用户账户
- 重置用户密码
- 为用户分配角色
- 基于部门的组织架构

## 数据模型

`SysUser` 实体（`sys_user` 表）包含以下字段：

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| userId | Long | 主键（自增） |
| username | String | 登录用户名（唯一） |
| nickname | String | 显示昵称 |
| email | String | 邮箱地址 |
| phone | String | 手机号码 |
| sex | Integer | 性别（0：女，1：男） |
| avatar | String | 头像 URL |
| password | String | BCrypt 加密后的密码 |
| status | Integer | 账户状态（0：禁用，1：启用） |
| deptId | Long | 部门 ID（外键） |
| remark | String | 备注 |
| createTime | DateTime | 创建时间 |
| updateTime | DateTime | 最后更新时间 |

## API 接口

### 管理端 API（`AdminApiController`）

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/admin-api/user` | 查询用户列表（分页，支持筛选） |
| POST | `/admin-api/user/create` | 创建新用户 |
| PUT | `/admin-api/user/update` | 更新用户信息 |
| POST | `/admin-api/user/delete` | 删除用户 |
| POST | `/admin-api/user/status` | 切换用户状态 |
| POST | `/admin-api/user/reset-password` | 重置用户密码 |
| POST | `/admin-api/user/assign-role` | 为用户分配角色 |

### RESTful API（`SysUserController`）

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| GET | `/system/user` | 查询所有用户 |
| GET | `/system/user/{id}` | 根据 ID 查询用户 |
| GET | `/system/user/username/{username}` | 根据用户名查询用户 |
| POST | `/system/user` | 创建用户 |
| PUT | `/system/user/{id}` | 更新用户 |
| DELETE | `/system/user/{id}` | 删除用户 |
| POST | `/system/user/{id}/reset-password` | 重置密码 |
| GET | `/system/user/active` | 查询活跃用户 |
| GET | `/system/user/dept/{deptId}` | 按部门查询用户 |

## 部门树筛选

用户列表页面左侧包含部门树。点击某个部门节点后，会筛选出该部门及其子部门下的用户。树形数据来源于 `SysDept` 实体。

## 密码安全

- 密码在存储前使用 **BCrypt** 加密
- 前端使用服务器的公钥通过 **RSA** 加密密码后再传输
- 服务器使用 RSA 私钥解密，然后使用 BCrypt 进行哈希
- RSA 私钥在 `arch-forge.rsa-private-key` 中配置

## 服务层

`SysUserService` 和 `UserService` 类处理业务逻辑：

- 用户名唯一性验证
- 部门存在性检查
- 创建时分配默认角色
- 基于 QueryDSL 的动态筛选（`SysUserPredicates`）

## 相关页面

- [角色与权限](./role-permission.md) — 角色分配详情
- [认证鉴权](./authentication.md) — 登录和 JWT 流程
- [日志管理](./log-management.md) — 用户操作日志
