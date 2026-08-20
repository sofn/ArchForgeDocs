import { defineConfig } from 'vitepress'

const guideSidebarEN = [
  {
    text: 'Introduction',
    items: [
      { text: 'What is ArchForge?', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
      { text: 'Tech Stack', link: '/guide/tech-stack' },
      { text: 'Project Structure', link: '/guide/project-structure' },
      { text: 'CLI', link: '/guide/cli' },
      { text: 'Contract-first', link: '/guide/contract-first' },
      { text: 'AI workflow', link: '/guide/ai-workflow' },
      { text: "What's New", link: '/guide/whats-new' },
      { text: 'ADRs', link: '/reference/adr/' },
    ]
  },
  {
    text: 'Development',
    items: [
      { text: 'Local Setup', link: '/guide/local-setup' },
      { text: 'Configuration', link: '/guide/configuration' },
      { text: 'Database Migration', link: '/guide/database-migration' },
      { text: 'Dependency Management', link: '/guide/dependency-management' },
      { text: 'ORM Query Strategy', link: '/guide/orm-query' },
      { text: 'C-end Web', link: '/guide/c-end-web' },
      { text: 'Developer CLI', link: '/guide/cli' },
    ]
  }
]

const modulesSidebarEN = [
  {
    text: 'System Modules',
    items: [
      { text: 'User Management', link: '/modules/user-management' },
      { text: 'Role & Permission', link: '/modules/role-permission' },
      { text: 'Menu Management', link: '/modules/menu-management' },
      { text: 'Config & Notice', link: '/modules/config-notice' },
      { text: 'Log Management', link: '/modules/log-management' },
      { text: 'Server Monitor', link: '/modules/server-monitor' },
      { text: 'File Management', link: '/modules/file-management' },
      { text: 'Quartz Scheduling', link: '/modules/quartz' },
      { text: 'Meta Table', link: '/modules/meta-table' },
      { text: 'Dashboard', link: '/modules/dashboard' },
      { text: 'ChatAI', link: '/modules/chatai' },
    ]
  },
  {
    text: 'Core Features',
    items: [
      { text: 'Authentication (Sa-Token)', link: '/modules/authentication' },
      { text: 'API Documentation', link: '/modules/api-docs' },
    ]
  }
]

const deploySidebarEN = [
  {
    text: 'Deployment',
    items: [
      { text: 'Docker Compose', link: '/deploy/docker' },
      { text: 'Observability', link: '/deploy/observability' },
      { text: 'Test Environment', link: '/deploy/test-environment' },
      { text: 'Production Guide', link: '/deploy/production' },
    ]
  }
]

const guideSidebarZH = [
  {
    text: '介绍',
    items: [
      { text: '什么是 ArchForge？', link: '/zh/guide/introduction' },
      { text: '快速开始', link: '/zh/guide/quick-start' },
      { text: '技术选型', link: '/zh/guide/tech-stack' },
      { text: '项目结构', link: '/zh/guide/project-structure' },
      { text: '命令行工具', link: '/zh/guide/cli' },
      { text: '契约先行', link: '/zh/guide/contract-first' },
      { text: 'AI 协作', link: '/zh/guide/ai-workflow' },
      { text: '更新说明', link: '/zh/guide/whats-new' },
      { text: 'ADR', link: '/zh/reference/adr/' },
    ]
  },
  {
    text: '开发指南',
    items: [
      { text: '本地开发', link: '/zh/guide/local-setup' },
      { text: '配置管理', link: '/zh/guide/configuration' },
      { text: '数据库迁移', link: '/zh/guide/database-migration' },
      { text: '依赖管理', link: '/zh/guide/dependency-management' },
      { text: 'C 端 Web', link: '/zh/guide/c-end-web' },
      { text: '开发 CLI', link: '/zh/guide/cli' },
    ]
  }
]

const modulesSidebarZH = [
  {
    text: '系统模块',
    items: [
      { text: '用户管理', link: '/zh/modules/user-management' },
      { text: '角色与权限', link: '/zh/modules/role-permission' },
      { text: '菜单管理', link: '/zh/modules/menu-management' },
      { text: '参数与公告', link: '/zh/modules/config-notice' },
      { text: '日志管理', link: '/zh/modules/log-management' },
      { text: '服务监控', link: '/zh/modules/server-monitor' },
      { text: '文件管理', link: '/zh/modules/file-management' },
      { text: '定时任务', link: '/zh/modules/quartz' },
      { text: '元表格', link: '/zh/modules/meta-table' },
      { text: '仪表盘', link: '/zh/modules/dashboard' },
      { text: 'ChatAI', link: '/zh/modules/chatai' },
    ]
  },
  {
    text: '核心功能',
    items: [
      { text: '认证 (Sa-Token)', link: '/zh/modules/authentication' },
      { text: 'API 文档', link: '/zh/modules/api-docs' },
    ]
  }
]

const deploySidebarZH = [
  {
    text: '部署',
    items: [
      { text: 'Docker Compose', link: '/zh/deploy/docker' },
      { text: '可观测性', link: '/zh/deploy/observability' },
      { text: '测试环境', link: '/zh/deploy/test-environment' },
      { text: '生产环境', link: '/zh/deploy/production' },
    ]
  }
]

const repoLinks = [
  { text: 'Backend (ArchForge)', link: 'https://github.com/sofn/ArchForge' },
  { text: 'Admin (ArchForgeAdmin)', link: 'https://github.com/sofn/ArchForgeAdmin' },
  { text: 'Docs (ArchForgeDocs)', link: 'https://github.com/sofn/ArchForgeDocs' },
  { text: 'Web (ArchForgeWeb)', link: 'https://github.com/sofn/ArchForgeWeb' },
  { text: 'Spec (ArchForgeSpec)', link: 'https://github.com/sofn/ArchForgeSpec' },
]

export default defineConfig({
  title: 'ArchForge',
  description: 'Contract-first five-repo platform: Spring Boot 4.1 + sa-token + Vue 3 + Next.js',
  base: '/',
  lastUpdated: true,
  cleanUrls: true,
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^https:\/\/localhost/,
  ],

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
  ],

  locales: {
    root: {
      label: 'English',
      lang: 'en-US',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/guide/introduction' },
          { text: 'Contract-first', link: '/guide/contract-first' },
          { text: 'Modules', link: '/modules/user-management' },
          { text: 'Deploy', link: '/deploy/docker' },
          {
            text: 'Repos',
            items: repoLinks
          }
        ],
        sidebar: {
          '/guide/': guideSidebarEN,
          '/reference/': [{ text: 'ADRs', items: [{ text: 'Index', link: '/reference/adr/' }] }],
          '/modules/': modulesSidebarEN,
          '/deploy/': deploySidebarEN,
        },
        editLink: {
          pattern: 'https://github.com/sofn/ArchForgeDocs/edit/master/docs/:path',
          text: 'Edit this page on GitHub'
        }
      }
    },
    zh: {
      label: '中文',
      lang: 'zh-CN',
      themeConfig: {
        nav: [
          { text: '指南', link: '/zh/guide/introduction' },
          { text: '契约先行', link: '/zh/guide/contract-first' },
          { text: '模块', link: '/zh/modules/user-management' },
          { text: '部署', link: '/zh/deploy/docker' },
          {
            text: '仓库',
            items: repoLinks
          }
        ],
        sidebar: {
          '/zh/guide/': guideSidebarZH,
          '/zh/reference/': [{ text: 'ADR', items: [{ text: '目录', link: '/zh/reference/adr/' }] }],
          '/zh/modules/': modulesSidebarZH,
          '/zh/deploy/': deploySidebarZH,
        },
        editLink: {
          pattern: 'https://github.com/sofn/ArchForgeDocs/edit/master/docs/:path',
          text: '在 GitHub 上编辑此页'
        },
        lastUpdatedText: '最后更新',
        outlineTitle: '本页目录',
        docFooter: {
          prev: '上一页',
          next: '下一页'
        }
      }
    }
  },

  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'ArchForge',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/sofn/ArchForge' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present ArchForge'
    },

    search: {
      provider: 'local'
    }
  }
})
