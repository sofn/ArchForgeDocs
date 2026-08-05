# 元表格

ArchForge 提供**低代码元表格**能力，管理员可在后台界面定义表、字段、索引与约束，系统自动创建物理 PostgreSQL 表、执行 Schema 演进、管理行数据，并生成前后端完整模块脚手架。

## 功能特性

### 可视化表设计

通过管理端界面定义表元数据：

| 属性 | 说明 |
|------|------|
| 表格编码 | 唯一机器可读标识，作为物理表名后缀 |
| 表格名称 | 人类可读展示名 |
| 表前缀 | 物理表前缀，默认 `meta_` |
| 状态 | 启用（1）/ 禁用（0） |
| 描述 | 可选备注 |

### 支持的字段类型

| 类型 | PostgreSQL 映射 | 说明 |
|------|-------------------|------|
| STRING | `VARCHAR(length)` | 默认长度 `255` |
| TEXT | `TEXT` | 长文本 |
| INTEGER | `BIGINT` | 整数 |
| DECIMAL | `NUMERIC(precision, scale)` | 默认 `NUMERIC(18,2)` |
| BOOLEAN | `BOOLEAN` | 布尔值 |
| DATE | `DATE` | 日期 |
| DATETIME | `TIMESTAMP` | 无时区时间戳 |
| TIMESTAMPTZ | `TIMESTAMPTZ` | 带时区时间戳 |
| ENUM | `VARCHAR(length)` | 选项以 JSON 列表存储 |
| JSON | `JSONB` | JSON 文档 |
| GEO | `JSONB` | 地理/JSON 数据 |
| FILE | `VARCHAR(512)` | 文件引用 |
| UUID | `UUID` | UUID 值 |
| ARRAY | `element_type[]` | STRING、INTEGER、DECIMAL、BOOLEAN 数组 |

### 字段属性

每个字段可配置：

- **长度 / 精度 / 小数位** — 用于字符串、小数与数组元素大小
- **可空 / 必填** — 控制 `NOT NULL`
- **默认值** — 存储为类型化默认值
- **唯一** — 强制唯一值
- **索引 / 索引类型 / 索引分组** — 单列或组合索引（`BTREE`、`GIN`、`GIST`、`FULLTEXT`）
- **可搜索** — 在数据列表搜索表单中显示
- **列表可见** — 默认在数据表格中显示
- **租户字段 / 所有者字段** — 用于多租户或行所有者语义
- **选项** — ENUM 类型的值列表
- **引用表 / 引用列** — 用于外键关系描述

### Schema 演进

当表定义更新时，`SchemaDiffEngine` 比较旧字段列表与新字段列表，生成有序的迁移计划：

1. `RENAME_COLUMN`（重命名列）
2. `DROP_COLUMN`（删除列）
3. `ADD_COLUMN`（新增列）
4. `ALTER_TYPE`（修改类型）
5. `ALTER_DEFAULT`（修改默认值）
6. `ALTER_NULL`（修改可空性）
7. `ALTER_INDEX`（修改索引）

`AlterTableDdlGenerator` 将每个变更转换为安全的 PostgreSQL `ALTER TABLE` DDL。迁移历史保存在 `sys_meta_table_migration`，可导出为 Flyway SQL 文件。

### 数据 CRUD

表定义完成且物理表创建后，可进行：

- 分页查询行数据并支持动态过滤
- 插入新行
- 更新已有行
- 软删除行
- 从 CSV/JSON 导入数据
- 导出为 EXCEL/CSV/JSON

### 代码生成

每个元表格可一键生成完整模块脚手架，使用 FreeMarker 模板：

**后端（默认 `example/<tableCode>`）**

- `build.gradle.kts`
- `domain/{Entity}.java`
- `dao/{Entity}Dao.java`
- `dto/{Entity}CreateRequest.java`
- `dto/{Entity}UpdateRequest.java`
- `dto/{Entity}ListRequest.java`
- `dto/{Entity}Response.java`
- `dto/{Entity}PageResult.java`
- `service/{Entity}Service.java`
- `rest/{Entity}Controller.java`
- 错误码 / 异常 / 项目模块类
- 集成测试骨架

**前端（默认 `src/views/<tableCode>`）**

- `src/api/<tableCode>.ts`
- `src/router/modules/<tableCode>.ts`
- `src/views/<tableCode>/utils/types.ts`
- `src/views/<tableCode>/utils/hook.tsx`
- `src/views/<tableCode>/index.vue`
- `src/views/<tableCode>/form/index.vue`

生成的 Controller 将列表、导出、导入委托给 `MetaTableCrudService`，复用动态表运行时。

## 数据模型

### `sys_meta_table`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| table_code | VARCHAR(64) | 表格编码，唯一 |
| table_name | VARCHAR(128) | 展示名称 |
| description | VARCHAR(512) | 备注 |
| table_prefix | VARCHAR(32) | 物理表前缀，默认 `meta_` |
| status | INT | 启用 1 / 禁用 0 |
| creator_id | BIGINT | 创建人 |
| create_time | TIMESTAMP | 创建时间 |
| updater_id | BIGINT | 更新人 |
| update_time | TIMESTAMP | 更新时间 |
| deleted | INT | 软删除标记 |

### `sys_meta_table_column`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| table_id | BIGINT | 关联 `sys_meta_table` |
| column_code | VARCHAR(64) | 字段编码 |
| column_name | VARCHAR(128) | 展示名称 |
| data_type | VARCHAR(32) | 支持的字段类型之一 |
| length | INT | 长度或最大尺寸 |
| precision | INT | 数值精度 |
| scale | INT | 数值小数位 |
| nullable | INT | 1 可空，0 必填 |
| default_value | VARCHAR(255) | 默认值 |
| is_unique | INT | 唯一标记 |
| is_required | INT | 必填标记 |
| is_searchable | INT | 可搜索标记 |
| is_list_visible | INT | 列表可见标记 |
| is_index | INT | 索引标记 |
| sort | INT | 显示顺序 |
| options | TEXT | JSON 选项列表 |
| reference_table | VARCHAR | 引用表 |
| reference_column | VARCHAR | 引用列 |
| tenant_column | BOOLEAN | 租户字段 |
| owner_column | BOOLEAN | 所有者字段 |
| index_type | VARCHAR | 索引类型 |
| index_group | VARCHAR | 索引分组 |
| array_element_type | VARCHAR | 数组元素类型 |

### `sys_meta_table_migration`

| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGINT | 主键 |
| table_id | BIGINT | 关联元表格 |
| version | INT | 版本号 |
| change_type | VARCHAR(32) | RENAME/DROP/ADD/ALTER_* |
| column_code | VARCHAR(64) | 受影响字段 |
| old_column_code | VARCHAR(64) | 重命名前列名 |
| old_type / new_type | VARCHAR(64) | 变更前后类型 |
| old_default / new_default | VARCHAR(255) | 变更前后默认值 |
| ddl_sql | TEXT | 生成的 DDL |
| status | VARCHAR(16) | PENDING / EXECUTED |
| executed_at | TIMESTAMP | 执行时间 |

## API 接口

所有接口均需要 `ADMIN` 角色。

| 方法 | 接口 | 说明 |
|------|------|------|
| POST | `/meta-table` | 元表格分页列表 |
| GET | `/meta-table/{id}` | 元表格详情（含字段） |
| POST | `/meta-table/create` | 创建元表格 |
| PUT | `/meta-table/{id}` | 更新表与字段 |
| POST | `/meta-table/{id}/copy` | 复制元表格 |
| POST | `/meta-table/{id}/generate` | 生成前后端代码 |
| GET | `/meta-table/{id}/delete-check` | 检查能否删除 |
| DELETE | `/meta-table/{id}?force={false\|true}` | 删除元表格 |
| GET | `/meta-table/{id}/migrations` | 查询 Schema 迁移历史 |
| GET | `/meta-table/{id}/export-migration` | 导出迁移为 Flyway SQL |
| POST | `/meta-table/{id}/data` | 查询动态表数据 |
| POST | `/meta-table/{id}/data/create` | 插入一行 |
| PUT | `/meta-table/{id}/data/{dataId}` | 更新一行 |
| POST | `/meta-table/{id}/data/{dataId}/delete` | 软删除一行 |
| GET | `/meta-table/{id}/export?format=EXCEL` | 导出表数据 |
| POST | `/meta-table/{id}/import?format=CSV` | 导入表数据 |

## 管理端界面

管理端元表格模块位于 `/src/views/meta-table/`：

- **元表格列表** — 按编码/名称搜索、分页展示、新增/修改/复制/删除/生成代码
- **表设计器** — 弹窗编辑表元数据与字段列表
- **数据管理** — 打开某张表的数据网格，执行增删改查、搜索、导入、导出
- 所有按钮受 `meta:table:*` 权限控制

## 权限点

| 权限 | 说明 |
|------|------|
| `meta:table:list` | 查看元表格 |
| `meta:table:query` | 查询元表格数据 |
| `meta:table:add` | 创建元表格 |
| `meta:table:edit` | 更新元表格 |
| `meta:table:remove` | 删除元表格 |
| `meta:table:export` | 导出元表格数据 |
| `meta:table:design` | 设计字段 |
| `meta:table:data` | 管理行数据 |
| `meta:table:generate` | 生成代码脚手架 |

## 典型使用流程

1. 创建元表格，填写唯一编码、名称与表前缀。
2. 添加字段：选择类型、长度、约束、索引等。
3. 保存设计；后端自动创建物理表 `{prefix}{table_code}`。
4. 切换到**数据**视图，进行增删改查、导入或导出。
5. （可选）点击**生成代码**生成前后端完整模块脚手架。
6. 需求变更时再次编辑表格；系统自动计算并应用 Schema 迁移 DDL。

## 相关页面

- [项目结构](/zh/guide/project-structure.md) — `domain/meta-table` 模块所在位置
- [数据库迁移](/zh/guide/database-migration.md) — Flyway 基础 Schema 管理
- [技术栈](/zh/guide/tech-stack.md) — 元表格使用的后端技术
- [文件管理](./file-management.md) — `FILE` 类型引用如何存储
