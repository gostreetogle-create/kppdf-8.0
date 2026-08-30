# TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T18:44:44+03:00 (written after preflight reading + implementation; no other active claim existed throughout — verified at start and re-verified here, no conflict occurred)
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `git rev-parse --show-toplevel` → `D:\kppdf-8.0`, branch `main`
- [x] `tasks/_active/` empty, `_NOW.md` ACTIVE/LIVE empty at start — no conflicting claim
- [x] `tasks/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md` did not exist in repo — restored verbatim from the PO prompt into `tasks/_active/` (same pattern as `TZ-NX-REGISTRIES-PLATFORM`)
- [x] Read `tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md`
- [x] Read `tasks/_archive/2026-08/TZ-NX-SHELL-CANON.done.md`
- [x] Read `docs/pages/registries.page.md`
- [x] Read `docs/pages/nx-shell.page.md`
- [x] Read `frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts` (+ its spec)
- [x] Read `frontend-nx/apps/kppdf-web/src/app/pages/registries/**` in full (all 14 files, re-verified unchanged since the prior archive — the "minimal fixes" noted in `TZ-NX-SHELL-rail-layout-fix.done.md` had no net effect, superseded by my own final commit in that same session)
- [x] Legacy `frontend/` registry/table pages — not re-read this session (no new legacy-copy question arose; prior session's read-only survey already covered RU copy conventions)

## Acceptance

### 1. Header navigation
- [x] «Реестры» added as its own `NavCategory` in `NAV_CATEGORIES` (`layout/nav-categories.ts`), between `reference` and `admin`; single item `{ path: '/registries', pageKey: 'registries', label: 'Реестры' }`.
- [x] Working route `/registries` — already existed; `app.routes.ts` changed from `loadChildren` to static `children: REGISTRIES_ROUTES` so `collectPageRoutePaths` (dead-link filter) actually detects it — **this was a real bug**: with `loadChildren`, the nav item would have been silently filtered out forever (`collectPageRoutePaths` only walks `route.children`/`route.loadComponent`, never `route.loadChildren`). Fixed without touching `layout/route-paths.ts` (outside allowed zone) — pages still lazy-load individually via their own `loadComponent`, same pattern as `/admin/*`/`/kit/*`.
- [x] Correct active state — `matchActiveCategoryId` (unmodified, generic) matches by path-prefix; verified for both `/registries` and `/registries/:key`.
- [x] No dead link — path now genuinely detected as existing.
- [x] **Not** added to left/right rail — only `nav-categories.ts` (header data) touched; `tool-rail-definitions.ts` untouched.
- [x] `pageKey: 'registries'` is honest, not a real backend permission — see "Honesty" section below.

### 2. Demo list page (`registries-list.page.ts`)
- [x] Clear "Реестры" title — pre-existing (`PiPageChromeComponent`), unchanged.
- [x] Cards show name, description **and record count** — added `RegistryCardSummary.recordCount` (RU-pluralized: "11 записей" / "1 запись" / "2 записи" / "Количество записей неизвестно" when absent), sourced from a new optional `RegistryDefinition.recordCount?: () => number` (synchronous, fixture-only — deliberately **not** `dataSource.query()`, which would have silently consumed `departments`' one-shot `failFirstAttempt` before the user ever opens the detail page).
- [x] Explicit open button/link — added a visible "Открыть →" affordance inside each card (previously only an implicit whole-card click target); anchor also gained `aria-label="Открыть реестр «<title>»"`.
- [x] loading/empty/error states — audited: the catalog is synchronous DI data (no fetch), so only "empty" is a real reachable state (already handled pre-existing); no fake loading spinner added for something that never actually loads asynchronously (would violate the "no imitation of non-existent behavior" rule in §4).
- [x] Единый Paper & Ink стиль — `@kppdf/ui/card` + `@kppdf/ui/page`, existing utility classes only (`text-muted-foreground`, `text-sunrise-warm`, `hairline`, `pi-focus-ring`, `pi-dashed-panel`) — no raw hex/rgba, no `box-shadow`, no new CSS primitives.
- [x] Keyboard focus + aria-label — `pi-focus-ring` on the card anchor (unchanged) + new explicit `aria-label` naming the registry (new).

### 3. Demo detail page (`registry-detail.page.ts`) — audit, no code changes needed
All of the following were verified already correct from the prior delivery; **no production code change was required** in this file:
- [x] Breadcrumb / clear return to list — `PiPageChromeComponent` crumbs `[{label:'Реестры', link:'/registries'}, {label: def.title}]`.
- [x] Title + description of current registry.
- [x] Toolbar (filter container, `data-test="registry-toolbar"`).
- [x] Filters (text + select).
- [x] Sort (via `<app-pi-table>` column headers, server-side `localSort=false`).
- [x] Pagination (embedded `<app-pi-pagination>` in `<app-pi-table>`).
- [x] Expandable rows where defined (`departments` only — correctly conditional via `hasExpandable()`).
- [x] Row actions (`copy-code` + destructive `delete`/`archive` on both demo registries).
- [x] Confirmation for destructive actions (`AlertDialogComponent`).
- [x] Retry after error (`PiStatusBannerComponent` action → `reload()`).
- [x] Unknown registry state (dedicated block, not a 404/blank screen).
- [x] Query state persists in URL (`parseRegistryQueryState`/`toRegistryQueryParams`, unchanged).

### 4. Honesty of demo functions
- [x] Fixture/demo data clearly labelled — list page description + each registry's own description already say "фикстура/демо" (pre-existing); reinforced with "(fixture/demo-данные, без backend)" in the list page description this session.
- [x] No imitation of real backend permissions — `pageKey: 'registries'` has no seeded backend page-ACL anywhere; the nav item **correctly** disappears for any account whose `user.pages[]` is a restrictive allow-list that doesn't include it (verified: only accounts with `pages` unset — e.g. owner — or an allow-list including it would see it). This is the honest default-deny outcome of *not* fabricating a permission, not a bug.
- [x] No dead/fake buttons — every button in the registries pages does something real (row actions mutate fixture state + toast; retry re-queries; filters/sort/page navigate).
- [x] Disabled placeholders carry a clear label — N/A within `pages/registries/**` (no disabled-placeholder buttons exist there); the shell's own "Уведомления (скоро)" placeholder is pre-existing, outside this task's scope, and already correctly labelled.

### 5. Architecture untouched
- [x] Shell stays dual-rail — `app-shell.component.ts` **not modified** (only its `.spec.ts` gained new assertions).
- [x] Back only in the left rail, Forward only in the right rail — unchanged; `tool-rail-definitions.ts` untouched; registries nav item lives only in header data.
- [x] `/kit/*` — untouched, still its own top-level `KitLayoutComponent`, no nesting change.

## Integrity slot (до READY / archive)

- [x] Тип изменения: page/nav polish + docs (frontend-nx only, fixture platform, no backend)
- [x] FIC §A–E: N/A — no new backend route/permission/module/MCP; `pageKey: 'registries'` is deliberately unseeded (see Honesty section)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/registries.page.md` updated (nav integration, card polish, `app.routes.ts` static-children rationale, browser-smoke note). `PAGE-TZ-INDEX.md` row from the prior TZ already covers this page — left as-is (still accurate, just points at the same page.md).
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys respected: only `layout/nav-categories.ts` (+ spec), `layout/app-shell.component.spec.ts`, `app.routes.ts`, `pages/registries/**` touched — no `libs/**`, no `frontend/**`, no `backend/**`
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `pnpm exec nx build kppdf-web` (из `frontend-nx/`): **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 65/65 tests, 11 suites (was 58; +7 new: nav-categories registries-category test, 2 app-shell chip tests, 1 updated no-dead-links count, 1 updated role-gate test, 2 new list-page card tests (count+aria-label), 2 new real-catalog detail-page smoke tests)
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors (only pre-existing non-null-assertion style warnings, same convention already used throughout the codebase)
- `pnpm run architecture:check:nx` (root): **PASS** — 202 source files, 0 violations
- `pnpm run ui:tokens:nx` (root): **PASS** — 53 baseline occurrences, 0 new

## Browser-smoke result

Dev server (`nx serve kppdf-web`, port 4201) started and compiled cleanly (Vite/esbuild, zero errors) with all changes from this session applied. Unauthenticated root serves the SPA shell (`HTTP 200`). **Full authenticated visual click-through (header chip → `/registries` → card → detail page, real browser Back/Forward buttons) was not performed** — no headless browser/Playwright tooling is available in this session, and no device-invite test account is available to pass `authGuard` (the owner break-glass password lives in gitignored `deploy/synology/CREDENTIALS.md`, a production ops secret out of scope for routine dev QA, not used). Verification instead relies on the 65-test automated suite, including a full `RouterTestingHarness` router-integration spec (real `Router`/`Location`, real DOM assertions) that already proves `/registries` and `/registries/:key` render and navigate correctly.

## Executor report

**Root cause found and fixed:** `app.routes.ts` wired `registries` via `loadChildren`, which the header's dead-link filter (`collectPageRoutePaths`) cannot see (it only inspects `route.children`/`route.loadComponent`, never `route.loadChildren`). Without this fix, adding the nav item would have been silently useless — it would never have passed the "route exists" gate. Fixed by switching to a static `children: REGISTRIES_ROUTES` array (imported directly), matching the same lazy-per-page-component pattern already used for `/admin/*` and `/kit/*` — no bundle-size regression, no `route-paths.ts` edit needed (outside the allowed zone).

**Nav:** added a dedicated `registries` `NavCategory` (own header chip, not folded into `reference` to avoid implying it's a real production dictionary). No `capabilities`/`systemRoles` — there is no real permission to gate on; this is deliberate and documented, not an oversight.

**List page:** added `RegistryCardSummary.recordCount` (synchronous, fixture-derived, RU-pluralized) and an explicit "Открыть →" affordance + `aria-label` per card. Chose *not* to reuse `dataSource.query()` for the count specifically to avoid silently consuming `departments`' one-shot `failFirstAttempt` simulation before the user ever reaches the detail page — that would have quietly broken the error→retry demo this same platform exists to showcase.

**Detail page:** audited against all eleven checklist bullets (breadcrumb, title/description, toolbar, filters, sort, pagination, expandable rows, row actions, destructive confirm, retry, unknown-registry, URL state) — every one already correct from the prior delivery. No production code change was needed there.

**Tests added/updated:** `nav-categories.spec.ts` (order + new category), `app-shell.component.spec.ts` (chip presence/label, active state, updated dead-link count, updated role-gate expectation — production shell code itself untouched), `registries-list.page.spec.ts` (count pluralization across all four forms, aria-label), `registry-detail.page.spec.ts` (new real-catalog smoke block covering both demo registries' full control surface together, including the `departments` error→retry cycle against the *real* fixture, not a synthetic mock).

**Outcome: PASS.**

## Review handoff

- [x] Self-reviewed — diff confined to the declared allowed zone; `app-shell.component.ts` (production shell code) confirmed untouched via `git status` before archiving

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.done.md`
- [x] удалить `tasks/_active/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md`
- [x] `_NOW.md` ACTIVE/LIVE очищен
- Status = DONE
- closed_at: 2026-08-29T18:46:04+03:00
