# ADR 0002 — sa-token 而不是 Spring Security JWT

**状态：** 已接受

## 背景

常见 Java 管理模板自带 JWT Filter 链。管理端 / C 端双登录会再复制一套。Spring Security 很好，但我们需要两套隔离会话、注解级权限，以及 Agent 能记住的小模型。

## 决策

使用 **sa-token 1.45**。管理端 `StpAdminUtil`。C 端 `StpWebUtil`。头 `Authorization: Bearer <token>`。权限 `@SaCheckPermission`，与 `sys_menu.permission` 对齐。

## 后果

不是 Spring Security JWT。不要再引入 `JwtAuthenticationFilter`。登录 / 刷新保持公开；其余默认要登录，除非 Spec 写明豁免。
