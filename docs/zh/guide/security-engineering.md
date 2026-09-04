# 安全工程规范

> 适用：所有 Web 前后端项目（含 Next.js/Vue SPA、BFF、API 网关、CI/CD、容器化部署）。
> 来源：ArchForgeWeb 连续五轮外部审计（SSR/SEO/性能/安全）的真实缺陷沉淀，每条规则对应一次已发生的事故。
> 本文只收录**通用规范**；项目特定的实现细节留在各仓 `AGENTS.md`。

## S1 凭据存储：HttpOnly 是唯一合法形态

**规则**：认证令牌（access / refresh / token 名）只能存在于服务端 `Set-Cookie` 的 `HttpOnly; Secure; SameSite=Lax` cookie 中。禁止写入 localStorage、sessionStorage、非 HttpOnly cookie、JS 模块级变量等任何 JS 可读位置。

**为什么**：XSS 是 Web 最常见的漏洞形态。令牌存放在 JS 可读位置，等于把"一次性脚本注入"升级为"永久账户接管"——攻击者拿到 refresh token 即可长期控制账户。HttpOnly 让 JS 根本读不到 cookie，XSS 的收益上限骤降。**双份存储（localStorage + cookie 并存）不是冗余，是双倍攻击面。**

**BFF 模式**（后端在响应体返回令牌时的标准解法）：

1. 服务端路由（如 `/api/auth/login`）用响应体中的令牌换 HttpOnly cookie；**响应体只回脱敏用户资料**（userId / username / nickname / avatar），零凭证出 JS。
2. SPA 的 API 调用全部走**同源代理**（如 `/api/proxy/[...path]`）：代理注入 Authorization 头、执行单飞（single-flight）token 刷新与轮转、按 IP 限流、拒绝直接转发认证端点。浏览器不接触后端 origin。
3. 唯一允许的 JS 可读认证 cookie 是**不含秘密材料的会话指示**（如 `hasSession=1`）。
4. 服务端组件直接读 cookie（`cookies()`），与浏览器链路无关。

**评审信号**：出现 `localStorage.setItem` 存 token 类值 → P0 拒绝；`credentials` 配置与 API 跨域组合自相矛盾 → 连同架构一起改（同源代理是根治，`credentials: "include"` 只是补丁）。

## S2 CSP：出现 unsafe-* 即视为未配置

**规则**：`script-src` 含 `'unsafe-inline'` 或 `'unsafe-eval'` 时，CSP 对 XSS 没有实际防御力，一律视为未配置。

**正确形态**：nonce + `'strict-dynamic'`。nonce 必须全链路贯通：中间件生成 → 请求头传递 → 框架给内联（flight/bootstrap）脚本自动加 nonce → 主题切换等库通过 prop 接收 nonce。

**要求与权衡（必须写注释）**：

- `connect-src 'self'` 可执行的前提是 S1 的同源代理——两者是配套架构。
- `style-src 'unsafe-inline'` 因 React 内联 style 普遍而常见，可接受但须注明权衡。
- nonce 化通常使页面转为动态渲染（放弃 SSG）——接受时在代码注释与 commit 中写明理由。
- 框架升级可能改变 CSP 链路（如 Next 16 移除 `x-nextjs-cache` 头），验证方式不能依赖单一信号。

## S3 会话校验分层

**规则**：边缘层（middleware）只做廉价的存在性检查；**真实校验**在受保护路由组/布局层向后端确认。死会话的用户体验必须是"清 cookie + 跳登录"，而不是"进页面后每个请求都 401"。

**为什么**：middleware 做真实校验会把每个请求变成后端往返；只做存在性检查则过期/伪造/已注销的 token 一路放行。分层让成本与安全各归其位。

**配套**：

- 死会话经登出端点弹跳（顺带清 cookie），redirect 目标**只收站内相对路径**（拒绝 `//`、`/\`、外域——防开放重定向）。
- 网络层故障（后端不可达）不应误判为死会话：只有明确的 401 才终止会话。

## S4 失败即关闭（fail-closed）

**规则**：

- secret 未配置 → 依赖它的端点**禁用**（401/404），绝不以无 secret 模式静默放行。
- 安全门禁（依赖审计 / lint / 漏洞扫描）**不允许 `continue-on-error`**。分级处理：high/critical 阻断合并，moderate 告警跟进。

**为什么**：`continue-on-error` 的门禁是装饰品——给评审者"有检查"的错觉，却不阻断任何东西。secret 缺省放行则把一次部署失误变成一次安全事件。

## S5 容器与限流

**规则**：

- 运行时容器必须 `USER` 非 root（基础镜像自带 `node` 用户即可），`COPY --chown` 资产——容器逃逸/RCE 落在非特权账户上。
- 登录、注册、发码等认证端点与公开代理**必须有速率限制**。单实例用内存滑窗起步，代码注释注明多副本部署时换 Redis 的替换点。
- 限流取 IP 依赖 `x-forwarded-for` 时，注明无反代场景的退化行为（全部请求合并计数）。

## S6 爬虫治理

**规则**：robots.txt 是**声明不是防线**。

- 训练类 AI 爬虫（GPTBot、ClaudeBot、CCBot、Bytespider 等）在边缘（middleware）**403 硬拦截**。
- 检索/引用类（OAI-SearchBot、PerplexityBot 等）**放行**——它们带来流量而非只取数据。
- 名单**单一来源**：一份共享常量同时供 robots 与 middleware 使用，两处各写一份必然漂移。

## M 元规则：配置存在 ≠ 生效

五轮审计的共同根因：**配置声明没有可观察行为验证**。真实案例——`revalidate = 60` 写了但缓存从未命中（fetch 带 AbortSignal 被排除出 Data Cache）；CSP 头存在但全是 unsafe；audit 步骤存在但 `continue-on-error`。三者同病。

**规则**：每条"我配置了 X"的声明必须附可观察证据：

| 声明 | 验证方法 |
|---|---|
| 缓存/ISR 生效 | mock 后端请求计数器：N 次页面访问 → 后端调用 < N |
| CSP nonce 生效 | 响应头 nonce 与 HTML 内联脚本 nonce 逐一匹配 |
| 门禁阻断有效 | 故意制造违规，确认 CI 真的变红 |
| 预算阈值 | 实测基线 + 余量（防回归），不是理想值 |
| 认证流 | cookie 旗标（HttpOnly 标记）+ 脱敏响应体 + 代理注入行为 |

**修复交付自证矩阵**：lint（零告警）/ typecheck / 单测 / production build / 端到端冒烟（mock 后端 + curl 可观察行为）。交付说明只写验证过的事，未验证项明确标注。

## 合并前自查清单

| 级别 | 检查项 |
|---|---|
| P0 | 无 localStorage/sessionStorage/JS 可读 cookie 存令牌 |
| P0 | 登录/注册响应体零凭证（BFF 只回脱敏资料） |
| P0 | `script-src` 无 unsafe-inline/unsafe-eval |
| P0 | redirect 参数只收站内相对路径 |
| P0 | CI 安全步骤无 continue-on-error |
| P1 | auth cookie 三件套（HttpOnly/Secure/SameSite）+ 代理注入 + refresh 单飞 |
| P1 | 受保护页面真实校验会话；死会话经登出端点弹跳 |
| P1 | secret 缺省端点禁用（fail-closed） |
| P1 | 容器 USER 非 root；认证/代理端点限流 |
| P1 | 训练类 AI 爬虫边缘拦截；名单单一来源 |
| P2 | 预算阈值基于实测基线；限流注明 Redis 替换点；style-src 权衡有注释 |
