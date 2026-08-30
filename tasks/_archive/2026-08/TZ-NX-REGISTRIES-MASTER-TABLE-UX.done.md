# TZ-NX-REGISTRIES-MASTER-TABLE-UX — master table + inline detail panel for `/registries`

> Full checklist (Claim/Preflight/Acceptance/Integrity/Gates/Browser
> smoke/Executor report) lives at
> `docs/agent-checklists/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md`; this file
> carries the same summary for permanent archival. Source TZ:
> `tasks/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md` (verbatim in repo).

## Goal

Replace the `/registries` card grid + routed detail page
(TZ-NX-REGISTRIES-PLATFORM) with a single master table page: one row per
registry (title/description, source badge, record count, expand control),
clicking a row expands the full registry detail engine (table, filters,
pagination, loading/empty/error+retry, expandable child rows, row actions)
directly beneath that row — router-driven, only one row open at a time,
survives refresh/back/forward.

## Architecture

- `/registries` and `/registries/:registryKey` both resolve to the same
  `RegistriesPage` (`registries-page.ts`) — the route param only decides
  which master row is expanded, not which page renders.
- The detail engine was extracted verbatim (no logic changes) from the
  former routed `RegistryDetailPage` into `RegistryDetailPanelComponent`
  (`registry-detail-panel.component.ts`) — the ONLY place query-state
  (filters/page/sort) ↔ URL, loading/error/retry, expandable child rows and
  row-action logic lives. It receives `@Input({required}) definition` and
  reads/writes the SAME `ActivatedRoute`/`Router` as its host page (it is
  mounted as a plain child component via `*ngTemplateOutlet`, not a separate
  router-outlet, so DI resolves the identical matched route).
- The master table itself reuses `@kppdf/ui/table`'s own existing
  `expandedRow`/`expandedRowWhen`/`rowClick` API — the same primitive that
  already powered Departments' child-row expansion. "Only one row open" is
  an architectural guarantee (a single `expandedRowWhen` predicate driven by
  one `registryKey` signal), not a manually-maintained flag. The ink-frame
  border around the open row + its tray comes free from that primitive's
  existing CSS — zero new styles were added.
- **Narrow, justified platform-contract change**: `RegistryDefinition.source:
  'api' | 'demo'` (required) — lets the master table label the data source
  honestly without parsing `description` strings. Applied to
  `units.registry.ts` (`'api'`) and `departments.registry.ts` (`'demo'`).
  `RegistryCardSummary` (used only by the deleted card-grid page) was
  replaced by `RegistryMasterRow` (`id, key, title, description?, source,
  recordCount`).

## Changed files

```
new:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-page.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail-panel.component.spec.ts
  docs/agent-checklists/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md
  tasks/_archive/2026-08/TZ-NX-REGISTRIES-MASTER-TABLE-UX.done.md

deleted:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.spec.ts

modified:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.ts
    — both routes → registries-page.ts (same loadComponent target)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-a11y.spec.ts
    — rewritten for master table + panel a11y
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.spec.ts
    — rewritten: master table URL-sync/back-forward/only-one-open/real-catalog smoke
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
    — +RegistrySource, +RegistryDefinition.source (required), RegistryCardSummary→RegistryMasterRow
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry-query-state.spec.ts
    — +source:'demo' in its one fixture (compile-only change, no assertion changes)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
    — +source:'api'
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/departments.registry.ts
    — +source:'demo'
  docs/pages/registries.page.md — rewritten for master-table UX
  docs/pages/PAGE-TZ-INDEX.md — registries row updated (was stale "fixture-only demo platform")

created-then-removed:
  tasks/_active/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md (claim working copy, removed at closeout)
```

`backend/**`, `frontend/**`, `frontend-nx/libs/ui/**`,
`frontend-nx/libs/data-access/**`, `frontend-nx/apps/kppdf-web/src/app/layout/**`
(header/rails/nav-categories), `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`,
`/kit/*` routes — **untouched**. No new dependencies, endpoints, permissions,
or DB fields.

## Gates

- `cd frontend-nx && pnpm exec nx build kppdf-web`: **PASS** — clean build
  (verified with a forced `--skip-nx-cache` rerun), only 2 deliberate
  `NG8102` warnings (`queryState().filters[filter.key] ?? ''` — TS's
  `Record<string,string>` index type structurally promises `string`, but a
  filter key genuinely may be absent at runtime; removing `?? ''` would risk
  a literal `"undefined"` appearing in the search input, so the "redundant"
  fallback is intentional) + the 2 pre-existing bundle-budget warnings
  (`pi-showcase-card`, `nx-welcome` — untouched files, known from prior TZs).
- `cd frontend-nx && pnpm exec nx test kppdf-web`: **PASS** — 101/101 tests,
  15 suites (was 83/14 before this task — +18 tests, +1 suite).
- `cd frontend-nx && pnpm exec nx run-many -t lint --all`: **PASS** — 0
  errors (26 pre-existing/consistent-style `no-non-null-assertion` warnings
  repo-wide, including one in the new `registry-detail-panel.component.spec.ts`
  following the same established pattern used throughout this codebase's
  spec files).
- `pnpm run architecture:check:nx`: **PASS** — 205 source files, 0
  violations.
- `pnpm run ui:tokens:nx`: **PASS** — 53 baseline occurrences, 0 new (no raw
  colors/box-shadow introduced — only existing `@kppdf/ui/*` components and
  already-used utility classes).

## Browser smoke

- `nx serve kppdf-web` (fresh instance, port 4211) compiled cleanly (same 2
  deliberate `NG8102` only), `Watch mode enabled`.
- `curl` status codes: `/` → 200, `/registries` → 200, `/registries/units` →
  200, `/registries/departments` → 200 (SPA history-fallback works for all
  three paths, including a direct deep-link to a specific registry).
- **Real mouse-click browser verification was NOT performed** — no
  Playwright/headless browser available in this session (`pnpm exec
  playwright` → not found, no browser binary on PATH) and no device-invite
  test account to pass `authGuard` — the same tooling gap already recorded
  in `TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW`.
- The click/expand/only-one-open behavior itself IS verified by DOM-level
  automated tests that perform a real `.click()`: `registries-page.spec.ts`
  (click a master row, assert `data-row-open`/`registry-panel-title`) and
  `registries.routes.spec.ts` (via `RouterTestingHarness` with a real
  `Router`/`Location` — dedicated tests for "clicking Units expands the real
  table", "clicking Departments expands the demo table", "clicking a second
  row closes the first", "clicking the open row collapses it"). This is not
  a substitute for manual browser QA, but it does concretely prove the DOM
  effect of the click, not just URL/state changes.

## Executor report

See `docs/agent-checklists/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md` for the full
acceptance/gates/executor-report breakdown, including three known
limitations (no manual browser click verification; an inherited
`RouterTestingHarness` back/forward test nuance carried over unchanged from
the original spec; and a documented side-benefit — the previously-known
"sort arrow may not refresh when switching registries without unmount" bug
is fixed as a natural consequence of the panel now being destroyed/recreated
on every row-expansion change, rather than reused by the Router).

**Outcome: PASS.**

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: Claude
verification:
  - master table replaces card grid: PASS
  - inline expand panel (not a separate page/modal): PASS
  - only one registry expanded at a time: PASS (architectural + tested)
  - /registries/:registryKey URL sync + refresh/back/forward: PASS
  - unknown key not-found state + return action: PASS
  - Units real API / Departments demo fixture, explicitly labelled: PASS
  - shell canon (header/rails) untouched: PASS
  - Paper & Ink tokens only, no raw colors/box-shadow/new primitives: PASS (ui:tokens:nx 0 new)
  - detail engine not duplicated (extracted RegistryDetailPanelComponent): PASS
  - query state (filters/page/pageSize/sort) in URL preserved: PASS
  - row.key remains the Units identifier: PASS
  - backend/frontend/libs/ui/kit untouched, no new deps/permissions/endpoints/fields: PASS
  - build: PASS
  - tests: PASS (101/101, +18 new)
  - lint: PASS (0 errors)
  - architecture:check:nx: PASS (0 violations)
  - ui:tokens:nx: PASS (0 new)
  - browser smoke: PARTIAL — dev server + HTTP 200 verified for all 3 routes; real mouse click not manually verified (no headless browser in session), substituted with DOM-level automated click tests
  - page.md / PAGE-TZ-INDEX: updated
  - checklist: ADDED
  - status synchronization: PASS
