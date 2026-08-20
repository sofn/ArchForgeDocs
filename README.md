# ArchForgeDocs

[![Deploy](https://github.com/sofn/ArchForgeDocs/actions/workflows/deploy.yml/badge.svg)](https://github.com/sofn/ArchForgeDocs/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

VitePress documentation for the **ArchForge five-repo platform**. Site: [https://archforge.lesofn.com](https://archforge.lesofn.com). [中文](./README.zh-CN.md)

Sibling repositories (clone side by side, no submodules):

| Repo | Role |
|------|------|
| [ArchForge](https://github.com/sofn/ArchForge) | Backend — `archforge-server-admin` `:8080`, `archforge-server-web` `:8081` |
| [ArchForgeAdmin](https://github.com/sofn/ArchForgeAdmin) | Admin UI (vue-pure-admin) `:8848` → `:8080` |
| [ArchForgeWeb](https://github.com/sofn/ArchForgeWeb) | C-end (Next.js) `:3000` → `:8081` |
| **ArchForgeDocs** | This site |
| [ArchForgeSpec](https://github.com/sofn/ArchForgeSpec) | Contracts / architecture / AI context |

Backend developer CLI: `./archforge` from the ArchForge repo root.

Auth is **sa-token** (not JWT). Admin success envelope is `{code,message,data}`; C-end errors are RFC 9457 ProblemDetail. Contracts live in ArchForgeSpec.

## Site map

```
docs/
├── index.md                 # homepage
├── guide/                   # intro, contract-first, AI workflow, CLI, …
├── reference/adr/           # architecture decisions
├── modules/                 # feature pages
├── deploy/
└── zh/                      # Chinese mirrors
```

Config: `docs/.vitepress/config.mts`.

## Commands

```bash
npm install

npm run docs:dev      # VitePress dev server
npm run docs:build    # Production static site
npm run docs:preview  # Preview the production build
```

## Deployment

The site is automatically deployed to GitHub Pages when `main` is updated via GitHub Actions.

There is no hosted public product demo yet. Run Admin and Web locally (see the homepage).

## License

[MIT](./LICENSE)
