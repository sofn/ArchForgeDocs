# 菜单管理

菜单系统为管理后台提供动态的、层级化的导航功能。菜单存储在数据库中并异步加载，支持多种菜单类型和丰富的元数据。

## 菜单类型

| 类型 | 值 | 描述 |
|------|-------|-------------|
| 页面 | `1`（MENU） | 包含 Vue 组件的常规页面 |
| 目录 | `2`（CATALOG） | 用于分组子菜单的文件夹 |
| 内嵌页 | `3`（IFRAME） | 嵌入的 iframe 页面 |
| 外链 | `4`（OUTSIDE_LINK_REDIRECT） | 跳转到外部 URL |

按钮级权限以 `isButton = true` 的菜单条目表示，但不会显示在侧边栏导航中。

## 数据模型

### SysMenu（`sys_menu`）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| menuId | Long | 主键 |
| menuName | String | 显示名称 |
| menuType | Integer | 菜单类型（1-4，见上表） |
| routerName | String | Vue Router 路由名称 |
| parentId | Long | 父菜单 ID（0 = 根节点） |
| path | String | 路由路径 |
| isButton | Boolean | 是否为按钮权限 |
| permission | String | 权限字符串（如 `system:user:create`） |
| metaInfo | JSON | 序列化的 MetaDTO（见下表） |
| status | Integer | 状态（0：禁用，1：启用） |
| remark | String | 备注 |

### MetaDTO（以 JSON 格式存储在 `metaInfo` 中）

| 字段 | 类型 | 描述 |
|-------|------|-------------|
| title | String | 菜单标题（支持 i18n 键） |
| icon | String | 菜单图标名称 |
| showLink | Boolean | 是否在侧边栏显示 |
| showParent | Boolean | 是否显示父菜单 |
| roles | List\<String\> | 该菜单允许的角色 |
| auths | List\<String\> | 按钮级权限 |
| frameSrc | String | iframe URL（用于 IFRAME 类型） |
| isFrameSrcInternal | Boolean | iframe URL 是否相对于后端 |
| rank | Integer | 排序序号（越大越靠后） |
| keepAlive | Boolean | 缓存页面状态 |
| frameLoading | Boolean | iframe 显示加载动画 |
| hiddenTag | Boolean | 从标签栏隐藏 |
| dynamicLevel | Integer | 动态路由的最大标签数 |

## API 接口

### 管理端 API

| 方法 | 接口路径 | 描述 |
|--------|----------|-------------|
| POST | `/admin-api/menu` | 查询所有菜单（树形结构） |
| POST | `/admin-api/menu/create` | 创建菜单 |
| PUT | `/admin-api/menu/update` | 更新菜单 |
| POST | `/admin-api/menu/delete` | 删除菜单 |

### 当前管理端 API

`/system/menu/*` 已删除，使用 `/admin/menu/*` 与 `system:menu:*` 权限。

## 异步路由加载

前端在登录后动态加载路由：

1. 用户登录并获得 sa-token `token`
2. 前端携带令牌调用 `GET /get-async-routes`
3. 后端根据用户的角色权限过滤后返回菜单树
4. 前端将菜单树转换为 Vue Router 路由对象
5. 通过 `router.addRoute()` 动态添加路由

这确保了用户只能看到其有权限访问的导航项。

## 创建新菜单

### 页面菜单示例

在"系统管理"下创建新页面：

1. 设置**菜单类型**为"页面"（1）
2. 设置**父菜单**为"系统管理"目录
3. 设置**路由名称**为 `SystemNewPage`
4. 设置**路径**为 `/system/new-page`
5. 在**元数据**中设置 `title`、`icon`，可选设置 `rank` 排序

### 内嵌页示例

嵌入 Swagger UI：

1. 设置**菜单类型**为"内嵌页"（3）
2. 在元数据中设置 **frameSrc** 为 `/swagger-ui/index.html`
3. 设置 **isFrameSrcInternal** 为 `true`（前端会自动拼接后端 URL）

## 相关页面

- [角色与权限](./role-permission.md) — 将菜单分配给角色
- [API 文档](./api-docs.md) — 嵌入的 Swagger UI 菜单
- [认证鉴权](./authentication.md) — 路由加载流程
