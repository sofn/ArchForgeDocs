# User Management

The user management module provides complete CRUD operations for system users, including department-based filtering, status control, password management, and role assignment.

## Features

- User list with pagination, search, and department tree filter
- Create / edit / delete users
- Enable / disable user accounts
- Reset user passwords
- Assign roles to users
- Department-based organization

## Data Model

The `SysUser` entity (`sys_user` table) contains:

| Field | Type | Description |
|-------|------|-------------|
| userId | Long | Primary key (auto-increment) |
| username | String | Login username (unique) |
| nickname | String | Display name |
| email | String | Email address |
| phone | String | Phone number |
| sex | Integer | Gender (0: female, 1: male) |
| avatar | String | Avatar URL |
| password | String | BCrypt-hashed password |
| status | Integer | Account status (0: disabled, 1: enabled) |
| deptId | Long | Department ID (foreign key) |
| remark | String | Notes |
| createTime | DateTime | Creation timestamp |
| updateTime | DateTime | Last update timestamp |

## API Endpoints

### Admin API (`AdminApiController`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin-api/user` | List users (paginated, with filters) |
| POST | `/admin-api/user/create` | Create a new user |
| PUT | `/admin-api/user/update` | Update user info |
| POST | `/admin-api/user/delete` | Delete user(s) |
| POST | `/admin-api/user/status` | Toggle user status |
| POST | `/admin-api/user/reset-password` | Reset user password |
| POST | `/admin-api/user/assign-role` | Assign roles to user |

### RESTful API (`SysUserController`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/system/user` | List all users |
| GET | `/system/user/{id}` | Get user by ID |
| GET | `/system/user/username/{username}` | Get user by username |
| POST | `/system/user` | Create user |
| PUT | `/system/user/{id}` | Update user |
| DELETE | `/system/user/{id}` | Delete user |
| POST | `/system/user/{id}/reset-password` | Reset password |
| GET | `/system/user/active` | List active users |
| GET | `/system/user/dept/{deptId}` | List users by department |

## Department Tree Filter

The user list page includes a department tree on the left side. Clicking a department node filters users belonging to that department and its children. The tree data comes from the `SysDept` entity.

## Password Security

- Passwords are encrypted with **BCrypt** before storage
- The frontend encrypts the password with **RSA** (using the server's public key) before transmitting
- The server decrypts with the RSA private key, then hashes with BCrypt
- The RSA private key is configured in `arch-forge.rsa-private-key`

## Service Layer

The `SysUserService` and `UserService` classes handle business logic:

- Username uniqueness validation
- Department existence check
- Default role assignment on creation
- QueryDSL-based dynamic filtering (`SysUserPredicates`)

## Related Pages

- [Role & Permission](./role-permission.md) — role assignment details
- [Authentication](./authentication.md) — login and JWT flow
- [Log Management](./log-management.md) — user operation logging
