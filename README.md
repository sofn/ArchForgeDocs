# ArchForgeDocs

VitePress documentation for the **ArchForge five-repo platform**.

Sibling repositories (clone side by side, no submodules):

| Repo | Role |
|------|------|
| [ArchForge](https://github.com/sofn/ArchForge) | Backend — `archforge-server-admin` `:8080`, `archforge-server-web` `:8081` |
| [ArchForgeAdmin](https://github.com/sofn/ArchForgeAdmin) | Admin UI (vue-pure-admin) `:8848` → `:8080` |
| ArchForgeWeb | C-end (Next.js) `:3000` → `:8081` |
| **ArchForgeDocs** | This site |
| ArchForgeSpec | Contracts / architecture / AI context |

Backend developer CLI: `./archforge` from the ArchForge repo root.

Auth is **sa-token** (not JWT). Admin success envelope is `{code,message,data}`; C-end errors are RFC 9457 ProblemDetail. Contracts live in ArchForgeSpec.

## Commands

```bash
npm install

npm run docs:dev      # VitePress dev server
npm run docs:build    # Production static site
npm run docs:preview  # Preview the production build
```

Content lives under `docs/` (English) and `docs/zh/` (Chinese). Site config is `docs/.vitepress/config.mts`.

## Deployment

The site is automatically deployed to GitHub Pages when the `master` branch is updated via GitHub Actions.

## License

[MIT](./LICENSE)
