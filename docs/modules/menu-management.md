# Menu Management

The menu system provides dynamic, hierarchical navigation for the admin panel. Menus are stored in the database and loaded asynchronously, supporting multiple menu types and rich metadata.

## Menu Types

| Type | Value | Description |
|------|-------|-------------|
| Page | `1` (MENU) | A regular page with a Vue component |
| Directory | `2` (CATALOG) | A folder that groups child menus |
| Iframe | `3` (IFRAME) | An embedded iframe page |
| External Link | `4` (OUTSIDE_LINK_REDIRECT) | Redirects to an external URL |

Button-level permissions are represented as menu entries with `isButton = true`, but they don't appear in the sidebar navigation.

## Data Model

### SysMenu (`sys_menu`)

| Field | Type | Description |
|-------|------|-------------|
| menuId | Long | Primary key |
| menuName | String | Display name |
| menuType | Integer | Menu type (1-4, see above) |
| routerName | String | Vue Router route name |
| parentId | Long | Parent menu ID (0 = root) |
| path | String | Route path |
| isButton | Boolean | Whether this is a button permission |
| permission | String | Permission string (e.g., `system:user:create`) |
| metaInfo | JSON | Serialized MetaDTO (see below) |
| status | Integer | Status (0: disabled, 1: enabled) |
| remark | String | Notes |

### MetaDTO (stored as JSON in `metaInfo`)

| Field | Type | Description |
|-------|------|-------------|
| title | String | Menu title (supports i18n keys) |
| icon | String | Menu icon name |
| showLink | Boolean | Whether to show in sidebar |
| showParent | Boolean | Whether to show parent menu |
| roles | List\<String\> | Allowed roles for this menu |
| auths | List\<String\> | Button-level permissions |
| frameSrc | String | Iframe URL (for IFRAME type) |
| isFrameSrcInternal | Boolean | Whether iframe URL is relative to backend |
| rank | Integer | Sort order (higher = later) |
| keepAlive | Boolean | Cache the page state |
| frameLoading | Boolean | Show loading animation for iframe |
| hiddenTag | Boolean | Hide from tab bar |
| dynamicLevel | Integer | Max tabs for dynamic routes |

## API Endpoints

### Admin API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin-api/menu` | List all menus (tree structure) |
| POST | `/admin-api/menu/create` | Create menu |
| PUT | `/admin-api/menu/update` | Update menu |
| POST | `/admin-api/menu/delete` | Delete menu |

### Current admin API

`/system/menu/*` was deleted. Use `/admin/menu/*` with `system:menu:*` permissions.

## Async Route Loading

The frontend loads routes dynamically after login:

1. User logs in and receives a sa-token `token`
2. Frontend calls `GET /get-async-routes` with the token
3. Backend returns the menu tree filtered by the user's role permissions
4. Frontend converts the menu tree into Vue Router route objects
5. Routes are dynamically added to the router via `router.addRoute()`

This ensures users only see navigation items they have permission to access.

## Creating a New Menu

### Page Menu Example

Create a new page under "System Management":

1. Set **Menu Type** to "Page" (1)
2. Set **Parent** to the "System Management" directory
3. Set **Route Name** to `SystemNewPage`
4. Set **Path** to `/system/new-page`
5. In **Meta**, set `title`, `icon`, and optionally `rank` for ordering

### Iframe Example

To embed Swagger UI:

1. Set **Menu Type** to "Iframe" (3)
2. Set **frameSrc** in meta to `/swagger-ui/index.html`
3. Set **isFrameSrcInternal** to `true` (the frontend prepends the backend URL)

## Related Pages

- [Role & Permission](./role-permission.md) — assigning menus to roles
- [API Documentation](./api-docs.md) — embedded Swagger UI menu
- [Authentication](./authentication.md) — route loading flow
