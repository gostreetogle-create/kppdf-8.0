# TZ-AUDIT-FULL — Comprehensive Task Tracker Audit

**Date:** 2026-07-19
**Scope:** All active + archived TZ files (July 2026)
**Project:** kppdf-8.0 (ERP system — NestJS backend + Angular frontend)

---

## 1. Executive Summary

kppdf-8.0 has undergone **massive development velocity** in July 2026. The project is a production-grade ERP system with:
- **NestJS 10** backend with 18+ feature modules, MongoDB 7 replica set
- **Angular 20** frontend with Paper & Ink design system, signal-based state
- **37+ completed TZs** archived in `_archive/2026-07/`
- **22+ active TZs** in the tasks/ directory (specs ready for implementation)
- **6 structural audit TZs** (TZ-AUDIT-1 through 24) defining future roadmap

The active TZs represent a **quality hardening wave**: after building the core features (TZ-83 product hierarchy, TZ-85 cost calculation, TZ-86 document constructor, TZ-91 security), the team is now systematically addressing data integrity, security, performance, and UX consistency across the codebase.

**Key insight:** The active TZs form a dependency graph where backend data integrity (TZ-120 soft-delete, TZ-121 cross-service TX, TZ-122 optimistic locking, TZ-126 EAV atomicity) are foundational and should be sequenced before frontend UX improvements (TZ-114 category tree, TZ-117 toolbar UX).

---

## 2. Complete TZ Table

### Active (In-Progress / Ready to Implement)

| # | ID | Title | Status | Category | Priority | Dependencies |
|---|-----|-------|--------|----------|----------|-------------|
| 1 | TZ-127 | Auth Rate-Limit Bypass + XSS Tokens | ⏳ READY | security | HIGH | TZ-110, TZ-119 |
| 2 | TZ-126 | EAV Partial Writes — atomic bulkWrite | ⏳ READY | bugfix | CRITICAL | TZ-120 (soft-delete) |
| 3 | TZ-125 | Interceptor RxJS Leaks | ⏳ READY | bugfix | CRITICAL | None |
| 4 | TZ-124 | List-Query Populate Optimization | ⏳ READY | performance | LOW | None |
| 5 | TZ-123 | Type-Safe ObjectId Refactoring | ⏳ READY | refactor | LOW | None |
| 6 | TZ-122 | Optimistic Locking — versionKey | ⏳ READY | security | MEDIUM | TZ-120 |
| 7 | TZ-121 | Cross-Service Transaction Integrity | ⏳ READY | bugfix | CRITICAL | TZ-110, TZ-120 |
| 8 | TZ-119 | Backend safety sweep + lookup cleanup | ⏳ READY | security | HIGH | TZ-110 |
| 9 | TZ-118 | Cross-page Type Safety | ⏳ READY | refactor | HIGH | TZ-115, TZ-117, TZ-105.3 |
| 10 | TZ-117 | Toolbar UX consistency | ⏳ READY | UX | HIGH | TZ-115 |
| 11 | TZ-116 | Sort state reactivity bug | ⏳ READY | bugfix | MEDIUM | TZ-115 (conflict) |
| 12 | TZ-114 | Category Tree View UX — drag-reorder | ⏳ READY | feature | MEDIUM | TZ-110 (hard blocker) |
| 13 | TZ-113 | Builder Canvas — keyboard a11y | ⏳ READY | UX | MEDIUM | TZ-111 |
| 14 | TZ-112 | Table Template Dialog — metadata preservation | ⏳ READY | bugfix | MEDIUM | None |
| 15 | TZ-105 | Vector DB verdict + BOM migration + error-handling | ⏳ READY | infrastructure | HIGH | TZ-104, TZ-103 |
| 16 | TZ-105.3 | Server-side DOMPurify for block HTML | ⏳ BACKLOG | security | P2 | TZ-104.7 |
| 17 | TZ-104.5 | Pi-Primitives Broader Migration | ⏳ READY | feature | MEDIUM | TZ-103, TZ-104.1-3 |
| 18 | TZ-104.4 | pi-table polish (debounce + generic restoration) | ⏳ READY | refactor | MEDIUM | TZ-104.3 |
| 19 | TZ-104.3-b2 | Remaining catalog pages migration | ⏳ READY | feature | HIGH | TZ-104.3 batch-1 |
| 20 | TZ-87 | Document Constructor F.3 close-out | ⏳ READY | bugfix | MEDIUM | TZ-86, TZ-95 |
| 21 | tz-ui-audit | UI-kit unification plan | 📋 AUDIT | infrastructure | MEDIUM | None |
| 22 | u.audit | Architectural refactoring plan (24 items) | 📋 AUDIT | infrastructure | MEDIUM | Various |

### Archived (Completed — `_archive/2026-07/`)

| # | ID | Title | Category | Key Deliverable |
|---|-----|-------|----------|-----------------|
| 1 | TZ-83 | Product→Module→Material+WorkType hierarchy | feature | Product-module hierarchy with 5 phases |
| 2 | TZ-85 | Cost calculation over module hierarchy | feature | Automated cost pricing with breakdown dialog |
| 3 | TZ-86 | Document Constructor (flagship) | feature | 3-pane builder, texts/tables, e2e tests |
| 4 | TZ-87 | Document Constructor F.3 close-out | bugfix | Dev fixtures seed + Create-template UI |
| 5 | TZ-90 | Dialog system (4 templates + migration) | feature | Polymorphic dialog wrapper + animations |
| 6 | TZ-91 | Critical Security Hardening | security | Auth, RBAC, CORS, Swagger, Rate Limit |
| 7 | TZ-92 | MCP integration (codebase-memory) | infrastructure | Project-local MCP server |
| 8 | TZ-93 | Brutalist UI — Utility classes | feature | pi-dashed-panel, pi-corner-marks, pi-crosshair |
| 9 | TZ-94 | Brutalist UI — Component adoption | feature | Component refactoring for utilities |
| 10 | TZ-95 | Brutalist UI — Showcase & Docs | infrastructure | Kit pages + docs sync |
| 11 | TZ-100 | Default seed data | infrastructure | Categories, warehouse, meter unit seeds |
| 12 | TZ-101 | Inventory Operations frontend | feature | Dashboard, storage-items, stock-movements pages |
| 13 | TZ-102 | Currency module + seed | feature | Currency entity with RUB/USD/EUR seed |
| 14 | TZ-103 | Dialog system audit + 4-bug fix | bugfix | Close, positioning, tab-switch, button fixes |
| 15 | TZ-104 | Pi-* UI-kit adoption audit | feature | Adoption matrix + migration plan |
| 16 | TZ-110 | Category backend safety | bugfix | fullPath integrity + atomic bulkWrite + ObjectId validation |
| 17 | TZ-111 | Builder bulk-delete race fix | bugfix | Ghost blocks counter + forkJoin race fix |
| 18 | TZ-115 | Inventory httpResource migration | refactor | silent-http error toast + httpResource migration |
| 19 | TZ-120 | Soft-Delete plugin | feature | Mongoose plugin for deletedAt filtering |
| 20 | TZ-41 | Health Check Panel + Log TUI | infrastructure | start.mjs health panel + TUI mode |
| 21 | TZ-45 | Backend DI Audit | infrastructure | audit-di.ts cascade analyzer |
| 22 | TZ-46 | Console polish | infrastructure | Russian log messages + ready panel |
| 23 | TZ-AUDIT-9 | Tailwind chroma bump | infrastructure | Design system refinement |
| 24 | QA-01 through QA-06 | Quality audits | audit | Security, frontend, backend, roadmap, build-tests, deeper |

---

## 3. What Has Been Built

### Core ERP Features (Shipped)
- **Product Hierarchy (TZ-83):** Product → ProductModule → Materials + WorkTypes with detail pages
- **Cost Calculation (TZ-85):** Automated pricing from module hierarchy with breakdown dialogs
- **Document Constructor (TZ-86):** 3-pane builder canvas, text-blocks, table-templates, drag-from-palette
- **Inventory System (TZ-100/101):** Dashboard, storage-items, stock-movements with warehouse management
- **Organizations/Contacts (TZ-06):** Full CRM with counterparties, interactions, INN validation

### Security Infrastructure (Shipped)
- **Auth & Identity (TZ-04):** JWT (15m access + 7d refresh), bcrypt, role hierarchy, refresh token versioning
- **RBAC Sweep (TZ-91):** `@Roles('admin','manager')` on all write endpoints across 73 controllers
- **Rate Limiting:** Global 10 req/s + 100 req/min; login-specific 5 req/min, 20 req/hour
- **Swagger gating, CORS multi-origin, admin-password drift detection**

### Design System (Shipped)
- **Paper & Ink (TZ-93/94/95):** Brutalist architectural UI with hairline borders, OKLCH palette
- **Pi-* primitives:** 24+ components (button, card, dialog, table, input, textarea, checkbox, switch, progress, skeleton, toast, etc.)
- **UI-kit wrappers:** PageHeader, EmptyState, Badge, TableRowActions
- **Dialog system (TZ-90):** Polymorphic wrapper, animation triggers, 4 dialog templates

### Dev Tooling (Shipped)
- **start.mjs (TZ-41/42/46):** Cross-platform orchestrator with TUI mode, health checks, production mode
- **MCP integration (TZ-92):** Project-local codebase-memory server for AI-assisted development
- **DI audit (TZ-45):** Static analyzer for NestJS module dependency cascade bugs
- **242 frontend unit tests, 10 backend e2e suites**

---

## 4. Patterns and Themes

### Theme 1: Data Integrity Hardening (CRITICAL priority)
The active TZs form a **defense-in-depth chain** for MongoDB data:
1. **TZ-120** (Soft-delete) → hides deleted records from queries
2. **TZ-121** (Cross-service TX) → atomic operations across Order/Contract/Reservation
3. **TZ-122** (Optimistic Locking) → prevents silent overwrite on concurrent edits
4. **TZ-126** (EAV atomicity) → bulkWrite in transactions for attribute resolution
5. **TZ-110** (Category safety) → fullPath integrity + ObjectId validation (completed)

### Theme 2: Frontend UI Consistency (HIGH priority)
- **TZ-104** series: Migrating 27 list-pages from native `<table>` to `<app-pi-table>`
- **TZ-104.5**: Checkbox, textarea, select primitive adoption
- **TZ-117/118**: Toolbar UX, error banner extraction, type safety
- **tz-ui-audit**: Comprehensive UI-kit adoption plan (251-line spec)

### Theme 3: Security & Reliability (CRITICAL priority)
- **TZ-127**: HttpOnly cookie auth + tiered rate limiting (anti-XSS, anti-DoS)
- **TZ-125**: RxJS interceptor crash prevention (audit failure → process crash)
- **TZ-119**: ObjectId validation pipe + lookup-table cleanup
- **TZ-105.3**: Server-side DOMPurify for HTML block content

### Theme 4: Developer Experience
- **TZ-123**: Type-safe ObjectId (eliminating `as unknown as Types.ObjectId` hacks)
- **TZ-124**: Query optimization (batch populate + lean() for list views)
- **TZ-116**: Sort state reactivity bugs (cross-reactive computed signals)
- **u.audit**: 24-item refactoring roadmap with 8 stages

---

## 5. Dependency Graph (Critical Path)

```
TZ-110 (Category safety, DONE)
    ├─→ TZ-119 (Backend safety sweep)
    ├─→ TZ-121 (Cross-service TX) ──→ TZ-122 (Optimistic Locking)
    ├─→ TZ-126 (EAV atomicity)
    └─→ TZ-114 (Category tree UX)

TZ-120 (Soft-delete, DONE)
    ├─→ TZ-122 (Optimistic Locking)
    ├─→ TZ-121 (Cross-service TX)
    └─→ TZ-126 (EAV atomicity)

TZ-115 (Inventory httpResource, DONE)
    ├─→ TZ-117 (Toolbar UX)
    ├─→ TZ-116 (Sort state bugs)
    └─→ TZ-118 (Type Safety)

TZ-104.3 batch-1 (Materials/Products/Orders)
    └─→ TZ-104.3-b2 (7 remaining pages)
         └─→ TZ-104.5 (Primitives)
              └─→ TZ-104.4 (pi-table polish)

TZ-86 (Document Constructor, DONE)
    └─→ TZ-87 (F.3 close-out)
         └─→ TZ-105.3 (Server-side sanitization)
```

---

## 6. What's Still Open / Pending

### Must-Fix (CRITICAL — Data Integrity)
| TZ | Issue | Risk |
|----|-------|------|
| TZ-126 | EAV partial writes — no atomicity in resolveAttributes | Data corruption on 5th attribute write failure |
| TZ-125 | Interceptor RxJS crash — audit.log() throws → process exit | Entire API crashes on DB connection issues |
| TZ-121 | Cross-service TX — orphan orders/contracts on failure | Business/money risk from partial operations |

### Should-Fix (HIGH — Security + Quality)
| TZ | Issue | Risk |
|----|-------|------|
| TZ-127 | Auth bypass — authorized user = unlimited req/s | Application-Layer DoS from compromised account |
| TZ-119 | ObjectId validation — `GET /api/products/INVALID_ID` → 500 | Unhandled exceptions in production logs |
| TZ-118 | Duplicate error-banner markup in 8+ pages | Maintainability risk, no design system consistency |
| TZ-117 | No reload button — user can't refresh list without page reload | Poor UX for data-heavy pages |

### Nice-to-Have (MEDIUM — UX + Polish)
| TZ | Issue | Impact |
|----|-------|--------|
| TZ-114 | Category drag-reorder UI | UX feature blocked on TZ-110 |
| TZ-113 | Builder canvas keyboard a11y | WAI-ARIA compliance gap |
| TZ-116 | Sort state reactivity bugs | Misleading sort behavior in work-types |
| TZ-124 | N+1 populate queries — 80+ DB queries per list page | 200ms+ latency on list endpoints |
| TZ-123 | `as unknown as Types.ObjectId` casts in 12+ services | Code quality / maintainability debt |

### Deferred / Future
| TZ | Issue | Reason |
|----|-------|--------|
| u.audit | 24-item refactoring roadmap (8 stages) | Systematic; stages 1-8 over months |
| TZ-105.3 | Server-side DOMPurify | Trust model doesn't yet require it |
| TZ-AUDIT-1 | Cycle-import audit (madge) | Structural audit, no behavior change |
| TZ-AUDIT-2 | Bundle size audit | Performance optimization phase |
| TZ-AUDIT-3 | axe-core a11y audit | Blocked by pnpm install issues |
| TZ-87 | Dev fixtures seed + Create-template UI | Verification flow, not production |
| tz-ui-audit | UI-kit unification (251-line spec) | 6 priority tiers, longest-running |

---

## 7. Recommendations

### Immediate (This Week)
1. **Ship TZ-125 (RxJS crash fix)** — lowest effort, highest impact (process crash prevention)
2. **Ship TZ-126 (EAV atomicity)** — data integrity, requires MongoDB replica set verification
3. **Ship TZ-127 (Auth hardening)** — security hardening, HttpOnly cookies

### Short-term (Next 2 Weeks)
4. **Ship TZ-120→TZ-121→TZ-122 sequence** — soft-delete → cross-service TX → optimistic locking
5. **Ship TZ-119 (ObjectId validation)** — eliminates 500 errors on invalid IDs
6. **Ship TZ-118 (Error banner extraction)** — 8+ pages get consistent error UX

### Medium-term (Month)
7. **Complete TZ-104 series** — 27-page pi-table migration (22 pages remaining)
8. **Ship TZ-117 (Toolbar UX)** — reload button, search input, keyboard a11y
9. **Address u.audit Stage 1** — cycle-import, bundle-size, a11y audits

---

*Generated by MiMoCode audit agent — 2026-07-19*
