# Meta Table

ArchForge provides a **low-code meta table** capability that lets administrators define tables, columns, indexes, and constraints from the admin UI, and then automatically create the physical PostgreSQL table, perform schema evolution, manage row data, and generate full-stack boilerplate code.

## Features

### Visual Table Design

Define a table through the admin UI with the following metadata:

| Property | Description |
|----------|-------------|
| Table code | Unique machine-readable identifier, used as the physical table name suffix |
| Table name | Human-readable display name |
| Table prefix | Physical table prefix, defaults to `meta_`. Lowercase letters, digits and `_`, at most 32 characters; `prefix + code` may not start with `sys_`, `qrtz_`, `pg_`, `sql_`, `information_schema_` or `flyway_` |
| Status | Enabled (1) or disabled (0) |
| Description | Optional notes |

### Column Types

Meta tables support the following column types:

| Type | PostgreSQL mapping | Notes |
|------|--------------------|-------|
| STRING | `VARCHAR(length)` | Default length `255` |
| TEXT | `TEXT` | Long text |
| INTEGER | `BIGINT` | Whole numbers |
| DECIMAL | `NUMERIC(precision, scale)` | Defaults to `NUMERIC(18,2)` |
| BOOLEAN | `BOOLEAN` | True/false |
| DATE | `DATE` | Calendar date |
| DATETIME | `TIMESTAMP` | Without timezone |
| TIMESTAMPTZ | `TIMESTAMPTZ` | With timezone |
| ENUM | `VARCHAR(length)` | Options stored as JSON list |
| JSON | `JSONB` | JSON documents |
| GEO | `JSONB` | Geographic/JSON data |
| FILE | `VARCHAR(512)` | File reference |
| UUID | `UUID` | UUID values |
| ARRAY | `element_type[]` | Arrays of STRING, INTEGER, DECIMAL, or BOOLEAN |

### Column Properties

Each column can be configured with:

- **Length / precision / scale** — for string, decimal, and array element sizing
- **Nullable / required** — controls `NOT NULL`
- **Default value** — checked against the column type before any DDL runs: numbers are parsed and re-printed, text is quoted; a value that does not fit the type is rejected
- **Unique** — enforces unique values
- **Index / index type / index group** — single or composite indexes (`BTREE`, `GIN`, `GIST`, `FULLTEXT`)
- **Searchable** — exposed in the data list search form
- **List visible** — shown in the data grid by default
- **Tenant / owner column** — flags for multi-tenant or row-owner semantics
- **Options** — for ENUM type value lists
- **Reference table / column / display expression** — for `REFERENCE` columns. The display expression may only use `ref.<column>` (optionally `::text`), `'string literals'` and `||`, e.g. `ref.username || ' (' || ref.email || ')'`; functions, operators and sub-queries are rejected

### Schema Evolution

When a table definition is updated, the `SchemaDiffEngine` compares the old and new column lists and produces an ordered migration plan:

1. `RENAME_COLUMN`
2. `DROP_COLUMN`
3. `ADD_COLUMN`
4. `ALTER_TYPE`
5. `ALTER_DEFAULT`
6. `ALTER_NULL`
7. `ALTER_INDEX`

The `AlterTableDdlGenerator` converts each change into safe PostgreSQL `ALTER TABLE` DDL. The migration history is persisted in `sys_meta_table_migration` and can be exported as a Flyway SQL file.

### Data CRUD

Once a table is defined and the physical table exists, you can:

- List paginated rows with dynamic filters
- Insert new rows
- Update existing rows
- Soft-delete rows
- Import data from CSV or JSON
- Export data to EXCEL, CSV, or JSON

### Code Generation

Each meta table can generate a full module scaffold using FreeMarker templates:

**Backend (`example/<tableCode>` by default)**

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
- Error code / exception / project module classes
- Integration test skeleton

**Frontend (`src/views/<tableCode>` by default)**

- `src/api/<tableCode>.ts`
- `src/router/modules/<tableCode>.ts`
- `src/views/<tableCode>/utils/types.ts`
- `src/views/<tableCode>/utils/hook.tsx`
- `src/views/<tableCode>/index.vue`
- `src/views/<tableCode>/form/index.vue`

The generated controller delegates list/export/import to `MetaTableCrudService` and reuses the dynamic table runtime.

## Data Model

### `sys_meta_table`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary key |
| table_code | VARCHAR(64) | Unique table code |
| table_name | VARCHAR(128) | Display name |
| description | VARCHAR(512) | Notes |
| table_prefix | VARCHAR(32) | Physical prefix, default `meta_` |
| status | INT | Enabled 1 / disabled 0 |
| creator_id | BIGINT | Created by |
| create_time | TIMESTAMP | Creation time |
| updater_id | BIGINT | Updated by |
| update_time | TIMESTAMP | Update time |
| deleted | INT | Soft-delete flag |

### `sys_meta_table_column`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary key |
| table_id | BIGINT | Foreign key to `sys_meta_table` |
| column_code | VARCHAR(64) | Column code |
| column_name | VARCHAR(128) | Display name |
| data_type | VARCHAR(32) | One of the supported column types |
| length | INT | Length or max size |
| precision | INT | Numeric precision |
| scale | INT | Numeric scale |
| nullable | INT | 1 = nullable, 0 = not null |
| default_value | VARCHAR(255) | Default value |
| is_unique | INT | Unique flag |
| is_required | INT | Required flag |
| is_searchable | INT | Searchable flag |
| is_list_visible | INT | Visible in list flag |
| is_index | INT | Indexed flag |
| sort | INT | Display order |
| options | TEXT | JSON option list |
| reference_table | VARCHAR | Reference table |
| reference_column | VARCHAR | Reference column |
| tenant_column | BOOLEAN | Tenant flag |
| owner_column | BOOLEAN | Owner flag |
| index_type | VARCHAR | Index type |
| index_group | VARCHAR | Index group name |
| array_element_type | VARCHAR | Array element type |

### `sys_meta_table_migration`

| Field | Type | Description |
|-------|------|-------------|
| id | BIGINT | Primary key |
| table_id | BIGINT | Related meta table |
| version | INT | Schema version |
| change_type | VARCHAR(32) | RENAME/DROP/ADD/ALTER_* |
| column_code | VARCHAR(64) | Affected column |
| old_column_code | VARCHAR(64) | Old column name on rename |
| old_type / new_type | VARCHAR(64) | Type before/after |
| old_default / new_default | VARCHAR(255) | Default before/after |
| ddl_sql | TEXT | Generated DDL |
| status | VARCHAR(16) | PENDING / EXECUTED |
| executed_at | TIMESTAMP | Execution time |

## API Endpoints

Tables are addressed by `tableCode`, never by database id (ids differ per environment). Every endpoint declares its own permission — the class-level `ADMIN` role alone is not enough.

| Method | Endpoint | Permission | Description |
|--------|----------|------------|-------------|
| POST | `/admin/meta-table` | `meta-table:list` | Paginated list of meta tables |
| GET | `/admin/meta-table/{tableCode}` | `meta-table:list` | Detail with columns |
| POST | `/admin/meta-table/create` | `meta-table:add` | Create a meta table |
| PUT | `/admin/meta-table/{tableCode}` | `meta-table:edit` | Update table and columns |
| PATCH | `/admin/meta-table/{tableCode}` | `meta-table:edit` | Update name / description / status only |
| POST | `/admin/meta-table/{tableCode}/schema-preview` | `meta-table:edit` | Preview the schema diff before saving |
| GET | `/admin/meta-table/importable-tables` | `meta-table:list` | Physical tables that can be adopted |
| GET | `/admin/meta-table/import-preview?tableName=` | `meta-table:list` | Preview the column mapping of an import |
| POST | `/admin/meta-table/import` | `meta-table:add` | Adopt an existing physical table |
| POST | `/admin/meta-table/{tableCode}/copy` | `meta-table:add` | Duplicate a meta table; answers with the copy's `tableCode` |
| POST | `/admin/meta-table/{tableCode}/generate` | `meta-table:generate` | Generate frontend/backend code |
| GET | `/admin/meta-table/{tableCode}/delete-check` | `meta-table:remove` | Row count before deleting |
| DELETE | `/admin/meta-table/{tableCode}?force={false\|true}` | `meta-table:remove` | Delete meta table |
| GET | `/admin/meta-table/{tableCode}/migrations` | `meta-table:list` | Schema migration history |
| GET | `/admin/meta-table/{tableCode}/export-migration` | `meta-table:edit` | Export migrations as Flyway SQL |
| POST | `/admin/meta-table/{tableCode}/data` | `meta-table:list` | List rows of the dynamic table |
| POST | `/admin/meta-table/{tableCode}/data/create` | `meta-table:add` | Insert a row |
| PUT | `/admin/meta-table/{tableCode}/data/{dataId}` | `meta-table:edit` | Update a row |
| POST | `/admin/meta-table/{tableCode}/data/{dataId}/delete` | `meta-table:remove` | Soft-delete a row |
| GET | `/admin/meta-table/{tableCode}/export?format=EXCEL` | `meta-table:export` | Export table data |
| POST | `/admin/meta-table/{tableCode}/import?format=CSV` | `meta-table:add` | Import table data |

## Admin UI

The admin UI for meta tables is located at `/src/views/meta-table/`:

- **Meta table list** — search by code/name, paginated table, create/edit/copy/delete/generate actions
- **Table designer** — dialog form for editing table metadata and columns
- **Data management** — open a meta table’s data grid to perform CRUD, search, import, and export
- All buttons are controlled by `meta-table:*` permissions

## Permissions

| Permission | Description |
|------------|-------------|
| `meta-table:list` | View meta tables, their detail and migration history; list rows |
| `meta-table:query` | Query meta table data |
| `meta-table:add` | Create, copy or import a meta table; insert / import rows |
| `meta-table:edit` | Update a meta table, export migrations; update rows |
| `meta-table:remove` | Delete a meta table (incl. delete-check); delete rows |
| `meta-table:export` | Export meta table data |
| `meta-table:design` | Design columns |
| `meta-table:data` | Manage row data |
| `meta-table:generate` | Generate code scaffold |

## Typical Workflow

1. Create a meta table with a unique code, name, and prefix.
2. Add columns with types, constraints, and index settings.
3. Save the design; the backend creates the physical table (`{prefix}{table_code}`). If a table with that name already exists, saving is refused — adopt existing tables with **Import** instead.
4. Switch to the **Data** view to insert, edit, delete, import, or export rows.
5. (Optional) Click **Generate** to produce a full-stack module scaffold.
6. When requirements change, edit the table; the system computes and applies schema migration DDL.

## Definition Files

Table definitions can also live in version control as `project-definition/meta/<tableCode>.yaml`: `./archforge meta export` writes them from the DB, `./archforge meta import` syncs files into the DB (dry-run unless `--apply`) and `./archforge meta check` exits 1 on drift. With `arch-forge.meta.source=file` the files are the source of truth — they are applied at startup and designer / import writes are rejected.

The sync never runs DDL: physical tables come from Flyway or the designer. So `meta check` also fails — and `meta import`, the file-mode startup and the shadow check warn — when a registered table has no physical table.

## Related Pages

- [Project Structure](../guide/project-structure.md) — where the `domain/meta-table` module lives
- [Database Migration](../guide/database-migration.md) — how Flyway handles base schema
- [Tech Stack](../guide/tech-stack.md) — backend technologies used by meta table
- [File Management](./file-management.md) — how `FILE` type references are stored
