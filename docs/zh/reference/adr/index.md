# 架构决策记录

ArchForge 只保留 **一套** ADR，在后端仓库：[`ArchForge/docs/adr`](https://github.com/sofn/ArchForge/tree/main/docs/adr)。
本页是它的目录——记录本身和它约束的代码放在一起，改动和决策在同一次评审里落地。

| ADR | 决策 |
|-----|------|
| [0001](https://github.com/sofn/ArchForge/blob/main/docs/adr/0001-api-internal-layout.md) | 领域模块只有 api + internal |
| [0002](https://github.com/sofn/ArchForge/blob/main/docs/adr/0002-single-emf-per-datasource.md) | 每个数据源组一个 EntityManagerFactory |
| [0003](https://github.com/sofn/ArchForge/blob/main/docs/adr/0003-contracts-in-common-base.md) | 共享契约放在 common-base，不放 infrastructure |
| [0004](https://github.com/sofn/ArchForge/blob/main/docs/adr/0004-nullaway-error.md) | 所有源码集启用 ERROR 级 NullAway |
| [0005](https://github.com/sofn/ArchForge/blob/main/docs/adr/0005-service-placement.md) | 服务放置：api.service + internal.service，运行期经端口 |
| [0006](https://github.com/sofn/ArchForge/blob/main/docs/adr/0006-dual-process-topology.md) | 两个服务进程（admin :8080 / web :8081）+ 一体化镜像 |
| [0007](https://github.com/sofn/ArchForge/blob/main/docs/adr/0007-meta-definition-file-first-write-authority.md) | 元表格定义：文件优先的写入权 |
| [0008](https://github.com/sofn/ArchForge/blob/main/docs/adr/0008-meta-runtime-registry-tablecode-identity.md) | 元表格运行期登记表；tableCode 作为公开标识 |
| [0009](https://github.com/sofn/ArchForge/blob/main/docs/adr/0009-actuator-management-port-and-sql-hardening.md) | Actuator 独立管理端口；SQL 与密钥加固 |
| [0010](https://github.com/sofn/ArchForge/blob/main/docs/adr/0010-repositories-are-internal.md) | Repository 属于模块内部，其他模块走 api 服务 |
| [0011](https://github.com/sofn/ArchForge/blob/main/docs/adr/0011-sa-token-not-spring-security-jwt.md) | 用 sa-token 而不是 Spring Security + JWT |
| [0012](https://github.com/sofn/ArchForge/blob/main/docs/adr/0012-sibling-repositories.md) | 四个并列仓库，不是 monorepo |
| [0013](https://github.com/sofn/ArchForge/blob/main/docs/adr/0013-jpa-static-metamodel.md) | Spring Data JPA + 静态元模型，而不是 MyBatis |

本站以前的四篇短记录已迁过去：「两个服务」即 ADR-0006，sa-token 为 ADR-0011，「五仓并列」被 ADR-0012 取代
（ArchForgeSpec 已并入 ArchForge），JPA + 元模型为 ADR-0013。
