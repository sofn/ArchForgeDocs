---
layout: home

hero:
  name: ArchForge
  text: 企业级管理平台
  tagline: 基于 Spring Boot 4 + Vue 3 的生产就绪管理系统，从零到全栈只需几分钟。
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/guide/quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: 🚀
    title: Spring Boot 4 + Java 25
    details: 基于最新 Spring Boot 4 构建，支持 Java 25 虚拟线程、Liberica NIK 原生镜像、Spring Security。
  - icon: 🎨
    title: Vue 3 管理界面
    details: 基于 vue-pure-admin 的精美后台界面，集成 Element Plus、Tailwind CSS、动态菜单路由。
  - icon: 🔐
    title: 完整 RBAC
    details: 基于角色的访问控制，支持 JWT 认证、动态菜单、按钮级权限、Token 刷新。
  - icon: 📊
    title: 服务监控
    details: 基于 Oshi 的实时 CPU、内存、JVM、磁盘监控，自动刷新仪表盘。
  - icon: 🗄️
    title: 多数据源 + Flyway
    details: 动态数据源路由，支持读写分离。Flyway 迁移管理生产环境数据库。
  - icon: 🐳
    title: Docker 原生 & JVM
    details: 双部署模式 — Liberica NIK 25 原生镜像（约 100ms 启动）或 JVM + Project Leyden CDS。一键部署。
---
