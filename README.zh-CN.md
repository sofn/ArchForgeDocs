# ArchForgeDocs

[English](./README.md) | 中文

[![Deploy](https://github.com/sofn/ArchForgeDocs/actions/workflows/deploy.yml/badge.svg)](https://github.com/sofn/ArchForgeDocs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

ArchForge 五仓平台的 VitePress 文档。站点：[https://archforge.lesofn.com](https://archforge.lesofn.com)。

并列克隆、无 submodule。认证是 **sa-token**。管理端成功信封 `{code,message,data}`；C 端错误为 RFC 9457 ProblemDetail。契约在 ArchForgeSpec。

## 站点结构

```
docs/
├── index.md                 # 首页
├── guide/                   # 介绍、契约先行、AI 协作、CLI…
├── reference/adr/           # 架构决策
├── modules/
├── deploy/
└── zh/                      # 中文镜像
```

配置：`docs/.vitepress/config.mts`。

## 命令

```bash
npm install
npm run docs:dev
npm run docs:build
npm run docs:preview
```

`main` 推送后 GitHub Actions 部署到 GitHub Pages。目前没有托管产品 Demo，请本地运行。

## License

[MIT](./LICENSE)
