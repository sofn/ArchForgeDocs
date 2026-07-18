---
layout: home

hero:
  name: ArchForge
  text: Enterprise Admin Platform
  tagline: Production-ready admin system built with Spring Boot 4 + Vue 3. From zero to full-stack in minutes.
  image:
    src: /logo.svg
    alt: ArchForge
  actions:
    - theme: brand
      text: Get Started
      link: /guide/quick-start
    - theme: alt
      text: View on GitHub
      link: https://github.com/sofn/ArchForge

features:
  - icon: 🚀
    title: Spring Boot 4 + Java 25
    details: Built on the latest Spring Boot 4 with Java 25 virtual threads, Liberica NIK Native Image support, and Spring Security.
  - icon: 🎨
    title: Vue 3 Admin UI
    details: Beautiful admin interface based on vue-pure-admin with Element Plus, Tailwind CSS, and dynamic menu routing.
  - icon: 🔐
    title: Complete RBAC
    details: Role-based access control with JWT authentication, dynamic menus, button-level permissions, token refresh, and role-based data scopes.
  - icon: 🛡️
    title: API Security
    details: API request signing with HMAC-SHA256 and idempotent tokens to prevent replay attacks and duplicate submissions.
  - icon: 📊
    title: Server Monitoring
    details: Real-time CPU, memory, JVM, disk monitoring powered by Oshi with auto-refresh dashboards.
  - icon: 🗄️
    title: Multi-Datasource + Flyway
    details: Dynamic datasource routing with read/write splitting. Flyway migration for production schema management.
  - icon: 🐳
    title: Docker Native & JVM
    details: Dual deployment modes — Liberica NIK 25 Native Image (~100ms startup) or JVM with Project Leyden CDS. One-command deployment.
  - icon: 📈
    title: Observability
    details: Prometheus + Grafana + Jaeger + Alertmanager out of the box — dashboards, alerts, and distributed traces.
  - title: File Management
    details: Upload, list, download, and delete files from the admin UI. Pluggable local filesystem or S3 (RustFS) backends with extension/size/MIME allow-lists.
  - title: Quartz Scheduling
    details: Reflective cron jobs with pause, resume, run-once, and execution logs, managed from the admin panel.
  - title: i18n
    details: Backend and frontend locale sync with English and Simplified Chinese message bundles out of the box.
  - title: Spring Modulith
    details: Explicit module boundaries, dependency verification, and documentation tests for the domain and infrastructure layers.
---
