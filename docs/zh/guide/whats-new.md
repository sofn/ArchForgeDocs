# 更新说明

文档站手工变更记录。数据截止 **2026-10**。

## 2026-10 — 安全与运维加固

- **元表格**：所有会进入 DDL 的值都既校验、又严格渲染——默认值按类型处理，REFERENCE 显示表达式改为白名单文法（`ref.<列名>`、`'字符串'`、`||`），`前缀 + 编码` 整体校验；同名物理表已存在时拒绝创建（请用导入）。每个接口都有自己的 `meta-table:*` 权限。`meta check` 会报告登记了但物理表不存在的表。
- **运维**：`staging` / `prod` 把 actuator 放到独立管理端口（admin `8089`、web `8091`），探针是业务端口上的 `/livez` 与 `/readyz`。日志行带 `[traceId,requestId]`。Prometheus 通过 DNS 发现后端。
- **密钥**：prod 的 Redis 必须设置 `REDIS_PASSWORD`；Redis 值按类型白名单反序列化；`AESEncrypter` 不再有内置密钥（改用 AES-GCM）；请求日志能盖住各种凭据键名变体（`accessToken`、`refresh_token` 等），staging/prod 不再记录请求/响应体。
- **CLI**：`db init` / `db update` / `init` / `up` 改用按模块迁移的 `flywayMigrateAll`，传入数据库凭据，迁移失败即报错；`doctor` 输出 ASCII 的 `[ OK ]` / `[FAIL]`。
- **C 端 API**：客户端错误返回 `404` / `405` / `400` 问题详情，不再是 `500`。

## 2026-04

- 新增契约先行、AI 协作指南，以及首批 4 篇 ADR。
- 首页改成五仓 + AI Agent 叙事，不再堆 14 个无分组 feature。
- 对比表谈架构，不再用过时的「RuoYi = Spring Boot 2.x」。芋道 / RuoYi-Vue-Pro 已在 `master-jdk25` 提供 Spring Boot 4.1 + JDK 25（见 [2026-06 changelog](https://doc.iocoder.cn/changelog/2026-06/)）。
- ArchForgeSpec 增加 GitHub Actions（OpenAPI lint + 路径/枚举检查）。
- C 端上传拒绝 SVG/HTML；菜单类型与后端 1/2/3/4 对齐。

仍 **没有** 托管公开 Demo，请本地运行。
