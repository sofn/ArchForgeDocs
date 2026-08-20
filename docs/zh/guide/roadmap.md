# 路线图

日期 **2026-08**。顺序见 `codeplans/ArchPlans/2026-08-20-five-repo-todo-plan.md`。

## 本周（P0）

- OpenAPI YAML 可解析 + Spec CI 变绿
- RSA 默认值清空 + prod fail-fast
- Compose 必填 `DB_PASSWORD` / `JWT_SECRET`
- 生产文档如实写密钥注入

## 接下来 2–4 周（P1）

- 提高 OpenAPI 覆盖率（先 RBAC 写操作）
- 注册 UI 必须能命名的枚举
- Actuator 白名单写进 Spec

## 更后（需要产品决策）

- Admin Function Calling / RAG / Copilot / Chat2BI 依赖 **LLM 接入**（metatable 链路保持 Skill/CLI，后端零 LLM）。
- C 端评论 / 点赞 / 标签必须 **Spec → 后端 → Web**，客户端不得先发明 API。

## 本轮不做

托管公开 Demo、Page Agent / A2A、完整 OpenAPI 代码生成。
