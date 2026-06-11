# 快速开始

5 分钟内在本地运行 ArchForge。

## 前置条件

| 工具 | 版本 | 检查命令 |
|------|---------|---------------|
| Java | 25+（推荐 Azul Zulu） | `java -version` |
| Node.js | 20+ | `node -v` |
| pnpm | 9+ | `pnpm -v` |
| Git | 任意版本 | `git --version` |
| Docker | 必需 | `docker -v` |

::: tip
请确保 `JAVA_HOME` 指向 JDK 25 安装目录。Docker 是 Testcontainers（开发模式下自动启动 PostgreSQL、Redis、RustFS）所必需的。你可以通过以下命令验证：
```bash
echo $JAVA_HOME
java -version
```
:::

## 方式一：手动安装

### 1. 克隆仓库

```bash
# 后端
git clone https://github.com/sofn/ArchForge.git

# 前端
git clone https://github.com/sofn/ArchForgeAdmin.git
```

### 2. 启动后端

```bash
cd ArchForge
./gradlew server-admin:bootRun
```

开发环境配置会自动激活，使用以下服务：
- **Testcontainers PostgreSQL** —— 通过 Docker 自动启动（无需手动配置数据库）
- **Testcontainers Redis** —— 通过 Docker 自动启动（无需安装 Redis）
- **Testcontainers RustFS** —— S3 兼容的文件存储，通过 Docker 自动启动
- **Hibernate DDL auto** 自动创建数据库表结构
- 预置种子数据（管理员用户、角色、菜单等）

等待启动日志：
