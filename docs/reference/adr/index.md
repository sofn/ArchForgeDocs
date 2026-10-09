# Architecture decision records

ArchForge keeps **one** ADR series, in the backend repository:
[`ArchForge/docs/adr`](https://github.com/sofn/ArchForge/tree/main/docs/adr). This page is its index — the records
themselves live next to the code they constrain, so a change and its decision land in the same review.

| ADR | Decision |
|-----|----------|
| [0001](https://github.com/sofn/ArchForge/blob/main/docs/adr/0001-api-internal-layout.md) | Domain modules: api + internal only |
| [0002](https://github.com/sofn/ArchForge/blob/main/docs/adr/0002-single-emf-per-datasource.md) | One EntityManagerFactory per datasource group |
| [0003](https://github.com/sofn/ArchForge/blob/main/docs/adr/0003-contracts-in-common-base.md) | Shared contracts live in common-base, never infrastructure |
| [0004](https://github.com/sofn/ArchForge/blob/main/docs/adr/0004-nullaway-error.md) | NullAway enforced at ERROR on all source sets |
| [0005](https://github.com/sofn/ArchForge/blob/main/docs/adr/0005-service-placement.md) | Service placement: api.service + internal.service, runtime via ports |
| [0006](https://github.com/sofn/ArchForge/blob/main/docs/adr/0006-dual-process-topology.md) | Two server processes (admin :8080 / web :8081) + all-in-one image |
| [0007](https://github.com/sofn/ArchForge/blob/main/docs/adr/0007-meta-definition-file-first-write-authority.md) | Meta definitions: file-first write authority |
| [0008](https://github.com/sofn/ArchForge/blob/main/docs/adr/0008-meta-runtime-registry-tablecode-identity.md) | Meta runtime registry; tableCode as the public identity |
| [0009](https://github.com/sofn/ArchForge/blob/main/docs/adr/0009-actuator-management-port-and-sql-hardening.md) | Actuator on a management port; SQL and secrets hardening |
| [0010](https://github.com/sofn/ArchForge/blob/main/docs/adr/0010-repositories-are-internal.md) | Repositories are internal; other modules use api services |
| [0011](https://github.com/sofn/ArchForge/blob/main/docs/adr/0011-sa-token-not-spring-security-jwt.md) | sa-token instead of Spring Security + JWT |
| [0012](https://github.com/sofn/ArchForge/blob/main/docs/adr/0012-sibling-repositories.md) | Four sibling repositories, not a monorepo |
| [0013](https://github.com/sofn/ArchForge/blob/main/docs/adr/0013-jpa-static-metamodel.md) | Spring Data JPA + static metamodel instead of MyBatis |

The four short records this site used to carry moved there: "two servers" is ADR-0006, sa-token ADR-0011,
"five sibling repos" is superseded by ADR-0012 (ArchForgeSpec was merged into ArchForge), and JPA + metamodel is
ADR-0013.
