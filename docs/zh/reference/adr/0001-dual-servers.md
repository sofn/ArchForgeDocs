# ADR 0001 — 双服务、双信封

**状态：** 已接受

## 背景

管理台和 C 端的登录域、错误形态、客户端不同。塞进同一个 Spring Boot 应用会共享 Cookie、泄漏权限。

## 决策

- `archforge-server-admin` **8080**，只给 ArchForgeAdmin。
- `archforge-server-web` **8081**，只给 ArchForgeWeb。
- 管理端成功：`{code, message, data}`。
- C 端错误：RFC 9457 ProblemDetail。

一个域的 token 不得发到另一个域（`StpAdminUtil` vs `StpWebUtil`）。

## 后果

两套启动、两套 CORS、两套限流键。Spec 文档化两套表面。客户端禁止交叉指端口。
