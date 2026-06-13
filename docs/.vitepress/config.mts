import { defineConfig } from 'vitepress'

const guideSidebarEN = [
  {
    text: 'Introduction',
    items: [
      { text: 'What is ArchForge?', link: '/guide/introduction' },
      { text: 'Quick Start', link: '/guide/quick-start' },
      { text: 'Tech Stack', link: '/guide/tech-stack' },
      { text: 'Project Structure', link: '/guide/project-structure' },
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
    ]
  },
  {
    text: 'Core Features',
    items: [
      { text: 'Authentication (JWT)', link: '/modules/authentication' },
      { text: 'API Documentation', link: '/modules/api-docs' },
    ]
  }
]

const deploySidebarEN = [
  {
    text: 'Deployment',
    items: [
      { text: 'Docker Compose', link: '/deploy/docker' },
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
    ]
  },
  {
    text: '开发指南',
    items: [
      { text: '本地开发', link: '/zh/guide/local-setup' },
      { text: '配置管理', link: '/zh/guide/configuration' },
      { text: '数据库迁移', link: '/zh/guide/database-migration' },
      { text: '依赖管理', link: '/zh/guide/dependency-management' },
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
    ]
  },
  {
    text: '核心功能',
    items: [
      { text: '认证 (JWT)', link: '/zh/modules/authentication' },
      { text: 'API 文档', link: '/zh/modules/api-docs' },
    ]
  }
]

const deploySidebarZH = [
  {
    text: '部署',
    items: [
      { text: 'Docker Compose', link: '/zh/deploy/docker' },
      { text: '测试环境', link: '/zh/deploy/test-environment' },
      { text: '生产环境', link: '/zh/deploy/production' },
    ]
  }
]

export default defineConfig({
  title: 'ArchForge',
  description: 'Modern enterprise admin platform built with Spring Boot 4 + Vue 3',
  base: '/',
  lastUpdated: true,
  cleanUrls: true,

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
          { text: 'Modules', link: '/modules/user-management' },
          { text: 'Deploy', link: '/deploy/docker' },
          {
            text: 'Links',
            items: [
              { text: 'Backend (ArchForge)', link: 'https://github.com/sofn/ArchForge' },
              { text: 'Frontend (ArchForgeAdmin)', link: 'https://github.com/sofn/ArchForgeAdmin' },
            ]
          }
        ],
        sidebar: {
          '/guide/': guideSidebarEN,
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
          { text: '模块', link: '/zh/modules/user-management' },
          { text: '部署', link: '/zh/deploy/docker' },
          {
            text: '链接',
            items: [
              { text: '后端 (ArchForge)', link: 'https://github.com/sofn/ArchForge' },
              { text: '前端 (ArchForgeAdmin)', link: 'https://github.com/sofn/ArchForgeAdmin' },
            ]
          }
        ],
        sidebar: {
          '/zh/guide/': guideSidebarZH,
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
      copyright: 'Copyright © 2024-present ArchForge'
    },

    search: {
      provider: 'local'
    }
  }
})
