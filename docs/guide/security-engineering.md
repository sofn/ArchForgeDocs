# Security Engineering Spec

> Scope: all web frontend/backend projects (Next.js / Vue SPAs, BFF layers, API gateways, CI/CD, containerized deployments).
> Origin: distilled from five consecutive external audit rounds on ArchForgeWeb (SSR / SEO / performance / security) — every rule below corresponds to a defect that actually shipped.
> This page records **generic norms only**; project-specific implementation details live in each repo's `AGENTS.md`.

## S1 Credential storage: HttpOnly is the only legal form

**Rule**: auth tokens (access / refresh / token names) live only in server-issued `HttpOnly; Secure; SameSite=Lax` cookies. Never in localStorage, sessionStorage, non-HttpOnly cookies, JS module-level variables, or any JavaScript-readable location.

**Why**: XSS is the most common web vulnerability class. Tokens in JS-readable storage upgrade a one-off script injection into **permanent account takeover** — an attacker holding the refresh token controls the account indefinitely. HttpOnly makes the cookie unreadable to JS, collapsing the XSS payoff. **Duplicate storage (localStorage + cookie) is not redundancy, it is doubled attack surface.**

**The BFF pattern** (standard solution when the backend returns tokens in the response body):

1. A server route (e.g. `/api/auth/login`) exchanges the body tokens for HttpOnly cookies; the **response body returns only sanitized profile data** (userId / username / nickname / avatar) — zero credentials reach JS.
2. SPA API calls go through a **same-origin proxy** (e.g. `/api/proxy/[...path]`): the proxy injects the Authorization header, performs single-flight token refresh + rotation, rate-limits per IP, and refuses to forward auth endpoints directly. The browser never touches the backend origin.
3. The only JS-readable auth cookie allowed is a **session indicator containing no secret material** (e.g. `hasSession=1`).
4. Server components read cookies directly (`cookies()`) — independent of the browser path.

**Review signals**: `localStorage.setItem` with token-like values → P0 reject; a `credentials` setting that contradicts a cross-origin API → fix the architecture (the same-origin proxy is the cure; `credentials: "include"` is a band-aid).

## S2 CSP: any unsafe-* means "not configured"

**Rule**: if `script-src` contains `'unsafe-inline'` or `'unsafe-eval'`, the CSP has no real defensive power against XSS and must be treated as absent.

**Correct form**: nonce + `'strict-dynamic'`. The nonce must flow through the whole chain: middleware generates it → request header → framework applies it to inline (flight/bootstrap) scripts → libraries receive it via a prop (e.g. theme providers).

**Requirements and trade-offs (must be commented)**:

- `connect-src 'self'` is only enforceable with the S1 same-origin proxy — they are one architecture, not two settings.
- `style-src 'unsafe-inline'` is common because React inline styles are everywhere; acceptable, but document the trade-off.
- Nonce-based CSP typically turns pages dynamic (giving up SSG) — when accepted, state the reason in code comments and the commit.
- Framework upgrades can change the CSP chain (e.g. Next 16 removed the `x-nextjs-cache` header) — verification must not depend on a single signal.

## S3 Session validation layers

**Rule**: the edge (middleware) does only a cheap existence check; **real validation** happens in the protected route group / layout layer against the backend. A dead session must feel like "cookies cleared + bounced to login", never "page renders and every request 401s".

**Why**: real validation in middleware turns every request into a backend round-trip; existence-only checks let expired/forged/revoked tokens walk right through. Layering puts cost and safety where each belongs.

**Companion rules**:

- Dead sessions bounce through the logout endpoint (which also clears cookies); redirect targets accept **site-relative paths only** (reject `//`, `/\`, absolute origins — open-redirect defense).
- Network-level failures (backend unreachable) must not be mistaken for dead sessions: only an explicit 401 ends the session.

## S4 Fail closed

**Rules**:

- Secret not configured → the dependent endpoint is **disabled** (401/404); never silently run in a no-secret mode.
- Security gates (dependency audit / lint / vulnerability scans) **must not use `continue-on-error`**. Grade them: high/critical block the merge, moderate stays advisory.

**Why**: a gate with `continue-on-error` is decoration — it creates the illusion of a check while blocking nothing. A default-open secret turns a deployment mistake into a security incident.

## S5 Containers and rate limiting

**Rules**:

- Runtime containers run as a **non-root USER** (the base image's `node` user is fine) with `COPY --chown` assets — container escape / RCE lands on an unprivileged account.
- Login, registration, code-sending, and public proxies **must be rate-limited**. Start with an in-memory sliding window per instance; comment the Redis swap point for multi-replica deployments.
- When IP extraction relies on `x-forwarded-for`, document the degradation without a reverse proxy (all requests share one counter).

## S6 Crawler governance

**Rule**: robots.txt is a **statement, not a fence**.

- AI training crawlers (GPTBot, ClaudeBot, CCBot, Bytespider, …) are **hard-blocked with 403 at the edge** (middleware).
- AI search/referral crawlers (OAI-SearchBot, PerplexityBot, …) **stay allowed** — they send traffic back instead of only taking data.
- The list has a **single source of truth**: one shared constant feeds both robots.txt and the middleware; two hand-maintained copies will always drift.

## M Meta-rule: configured ≠ working

The common root cause across all five audit rounds: **a configuration claim with no observable-behavior verification**. Real cases — `revalidate = 60` was set but the cache never hit (an AbortSignal on fetch excludes it from the Data Cache); the CSP header existed but was full of unsafe; the audit step existed but had `continue-on-error`. Same disease.

**Rule**: every "I configured X" claim must come with observable evidence:

| Claim | Verification |
|---|---|
| Caching/ISR works | mock backend request counter: N page views → < N backend calls |
| CSP nonce works | header nonce matches every inline script nonce in the HTML |
| Gate blocks | deliberately break it once; confirm CI actually goes red |
| Budget threshold | measured baseline + margin (regression-blocking), not an aspirational number |
| Auth flow | cookie flags (HttpOnly) + sanitized response body + proxy injection behavior |

**Fix delivery self-verification matrix**: lint (zero warnings) / typecheck / unit tests / production build / end-to-end smoke (mock backend + curl on observable behavior). Write down only what was verified; label anything unverified as such.

## Pre-merge checklist

| Level | Check |
|---|---|
| P0 | No tokens in localStorage / sessionStorage / JS-readable cookies |
| P0 | Login/registration response bodies carry zero credentials (BFF returns sanitized profiles) |
| P0 | `script-src` free of unsafe-inline / unsafe-eval |
| P0 | Redirect parameters accept site-relative paths only |
| P0 | No continue-on-error on CI security steps |
| P1 | Auth cookies carry the trio (HttpOnly/Secure/SameSite) + proxy injection + single-flight refresh |
| P1 | Protected pages validate sessions for real; dead sessions bounce via the logout endpoint |
| P1 | Secret-dependent endpoints disabled when the secret is missing (fail-closed) |
| P1 | Containers run non-root; auth/proxy endpoints rate-limited |
| P1 | AI training crawlers blocked at the edge; list has a single source |
| P2 | Budget thresholds based on measured baselines; rate limiter documents the Redis swap; style-src trade-off commented |
