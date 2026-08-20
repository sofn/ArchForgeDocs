# ADR 0003 — Five sibling repos, not a monorepo

**Status:** accepted

## Context

A monorepo would put Java, Vue, Next.js, VitePress, and OpenAPI in one tree. That couples release cadence, CI images, and `can_modify` scope. Agents then load the whole tree.

## Decision

Five Git repositories cloned side by side. No submodules. ArchForgeSpec is the constitution. Each repo's `AGENTS.md` states `can_modify`.

## Consequences

Cross-repo changes need an explicit Spec-first sequence. Clone scripts and docs must list all five. CI is per-repo (Spec now has its own Actions).
