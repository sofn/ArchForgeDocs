# ADR 0003 — 五仓并列，不是 monorepo

**状态：** 已接受

## 背景

Monorepo 会把 Java、Vue、Next.js、VitePress、OpenAPI 塞进一棵树。发布节奏、CI 镜像、`can_modify` 范围绑在一起。Agent 还会一次加载整树。

## 决策

五个 Git 仓库并列克隆。无 submodule。ArchForgeSpec 是宪法。每仓 `AGENTS.md` 写明 `can_modify`。

## 后果

跨仓变更必须走 Spec 优先顺序。克隆脚本和文档必须列出五仓。CI 按仓独立（Spec 已有 Actions）。
