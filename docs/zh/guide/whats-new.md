# 更新说明

文档站手工变更记录。数据截止 **2026-10**。

## 2026-10 — 安全与运维加固

- **元表格**：所有会进入 DDL 的值都既校验、又严格渲染——默认值按类型处理，REFERENCE 显示表达式改为白名单文法（`ref.<列名>`、`'字符串'`、`||`），`前缀 + 编码` 整体校验；同名物理表已存在时拒绝创建（请用导入）。每个接口都有自己的 `meta-table:*` 权限。`meta check` 会报告登记了但物理表不存在的表。
- **运维**：`staging` / `prod` 把 actuator 放到独立管理端口（admin `8089`、web `8091`），探针是业务端口上的 `/livez` 与 `/readyz`。日志行带 `[traceId,requestId]`。Prometheus 通过 DNS 发现后端。
- **密钥**：prod 的 Redis 必须设置 `REDIS_PASSWORD`；Redis 值按类型白名单反序列化；`AESEncrypter` 不再有内置密钥（改用 AES-GCM）；请求日志能盖住各种凭据键名变体（`accessToken`、`refresh_token` 等），staging/prod 不再记录请求/响应体。
- **CLI**：`db init` / `db update` / `init` / `up` 改用按模块迁移的 `flywayMigrateAll`，传入数据库凭据，迁移失败即报错；`doctor` 输出 ASCII 的 `[ OK ]` / `[FAIL]`。
- **C 端 API**：客户端错误返回 `404` / `405` / `400` 问题详情，不再是 `500`。
- **权限**：每个管理端处理器都有自己的权限，并且每个被校验的权限码都能通过菜单或按钮授予（定时任务、文件上传/删除、CMS 图片上传以前校验的权限码谁都拿不到）。元表格生成代码需要 `meta-table:generate`；`copy` 返回新的 `tableCode`。
- **加固**：dev/test 之外 `500` 不再泄露异常细节；staging 必须配置明确的 CORS 来源；API 签名覆盖请求体；移除 `JWT_SECRET`（sa-token，不用 JWT）。
- **告警**：按应用并带流量门槛的错误率、整堆内存、两级磁盘、数据库连接池耗尽；Alertmanager 投递到 `ALERT_WEBHOOK_URL`；prod/staging 链路采样 10%。
- **CLI**：`init` 不加 `--write` 时是纯演练，也不再生成没人读取的 `AES_KEY`。
- **复审修复**：prod/staging 部署脚本从正确的目录导入种子数据；`docker-compose.prod.yml` 补齐管理端必需的变量；REFERENCE 字段只能关联本表或已登记的元表格；数据范围失败关闭；生成的控制器校验权限；告警新增 `ApplicationMissing`；带点的页面路径也有 CSP；元表格编辑页显示加载到的定义。
- **请求日志**：脱敏改为线性扫描——在记录载荷的 profile（dev/test）里，超长值（base64 验证码图片、大量转义字符的请求体）会撑爆栈，让 `GET /admin/auth/captchaImage` 返回 500；每个请求只记录一次。
- **元表格取值**：JSON/GEO 列接受对象和数组；不在字典里的 ENUM 值——或字典根本不存在——都会被拒绝；唯一字段上的重复值返回 `10408` 而不是 500。
- **CLI**：`meta check/export/import` 不再启动任务调度器（`arch-forge.scheduler.enabled=false`）。
- **结构**：Repository 属于模块内部，其他模块通过 api 服务读取（[ADR-0010](https://github.com/sofn/ArchForge/blob/main/docs/adr/0010-repositories-are-internal.md)）。删除未使用的 `common.constant.Constants`。module-task、admin-user 补了测试并提高覆盖率地板。
- **运维**：staging 的 Redis 与 prod 一样必须设置 `REDIS_PASSWORD`；server-web 的链路按比例采样、服务名为 `server-web`；请求日志 IP 只信任可信代理；CI 额外按 prod 拓扑启动（管理端口、探针）。
- **元表格**：字段长度 / 精度 / 小数位与 ARRAY 元素类型在执行 DDL 前校验。
- **管理端**：删除 xlsx / mqtt 演示页及两个依赖（已知漏洞且无修复版本）。
- **流程**：只保留一套 ADR（[ArchForge/docs/adr](https://github.com/sofn/ArchForge/tree/main/docs/adr)），每个仓库都有 `CONTRIBUTING.md`，CI 统一为 trunk-based。
- **请求日志**：`mask-fields` 现在按键名片段匹配（`token` 也会遮住 `accessToken`），见[配置](./configuration.md)。

## 2026-04

- 新增契约先行、AI 协作指南，以及首批 4 篇 ADR。
- 首页改成五仓 + AI Agent 叙事，不再堆 14 个无分组 feature。
- 对比表谈架构，不再用过时的「RuoYi = Spring Boot 2.x」。芋道 / RuoYi-Vue-Pro 已在 `master-jdk25` 提供 Spring Boot 4.1 + JDK 25（见 [2026-06 changelog](https://doc.iocoder.cn/changelog/2026-06/)）。
- ArchForgeSpec 增加 GitHub Actions（OpenAPI lint + 路径/枚举检查）。
- C 端上传拒绝 SVG/HTML；菜单类型与后端 1/2/3/4 对齐。

仍 **没有** 托管公开 Demo，请本地运行。
