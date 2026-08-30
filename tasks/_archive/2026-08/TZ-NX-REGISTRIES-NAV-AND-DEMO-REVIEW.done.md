# TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW — nav integration + demo review

> Исходный файл `tasks/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md` в репозитории
> отсутствовал на момент старта — TZ восстановлено дословно из промпта PO
> (сессия 2026-08-29) и сохранено в `_active` как рабочая копия, теперь архивировано.

## Цель

Сделать платформу «Реестры» видимой и проверяемой через интерфейс, а не
только по ручному URL. Привести demo-страницы к принятому Paper & Ink UI и
shell-канону.

## Scope (как задано)

Разрешено: `layout/nav-categories.ts`, `pages/registries/**`,
`app.routes.ts` (только если нужно для навигации), соответствующие tests,
docs. Запрещено: `frontend/**`, `backend/**`, `libs/ui/**`,
`libs/data-access/**`, `libs/features/**`, `start.mjs`, новые зависимости,
реальные backend API, изменение геометрии shell/rails.

## Root cause found

`app.routes.ts` wired `registries` via `loadChildren` (lazy children
loader). The header's dead-link filter, `collectPageRoutePaths`
(`layout/route-paths.ts`), only inspects `route.children` (a static array)
and `route.loadComponent` — it never recurses into `route.loadChildren`.
Consequence: `/registries` would **never** have been recognized as an
"existing route" by the nav filter, so adding a nav item pointing at it
would have been silently and permanently filtered out, regardless of any
other configuration. Fixed by switching to a static `children:
REGISTRIES_ROUTES` array (statically imported), which is the same pattern
already used for `/admin/*` and `/kit/*` in this file — each page underneath
still lazy-loads individually via its own `loadComponent`, so there is no
bundle-size regression. `layout/route-paths.ts` itself was **not** touched
(outside the allowed zone).

## Changed files

```
modified:
  frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.ts
    — new `registries` NavCategory (Table2 icon) between `reference` and `admin`;
      single item { path: '/registries', pageKey: 'registries', label: 'Реестры' }
  frontend-nx/apps/kppdf-web/src/app/layout/nav-categories.spec.ts
    — NAV_CATEGORY_ORDER updated; new describe block for the registries category
  frontend-nx/apps/kppdf-web/src/app/layout/app-shell.component.spec.ts
    — 2 new tests (chip presence/label, active state on /registries + /registries/:key);
      2 existing tests updated (dead-link chip count 1→2; role-gate test now expects
      the registries chip to survive since it has no systemRoles/capabilities gate)
      — AppShellComponent production code itself NOT modified
  frontend-nx/apps/kppdf-web/src/app/app.routes.ts
    — registries: loadChildren → static children: REGISTRIES_ROUTES (+ static import)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
    — RegistryDefinition.recordCount?: () => number (optional, synchronous);
      RegistryCardSummary.recordCount: number | null (now actually used)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
    — recordCount: () => rows.length
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/departments.registry.ts
    — recordCount: () => rows.length
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.ts
    — cards now use RegistryCardSummary; RU-pluralized record count;
      explicit "Открыть →" affordance; anchor aria-label naming the registry
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.spec.ts
    — updated helper + 2 new tests (count pluralization all 4 RU forms + unknown-count
      fallback, aria-label)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.spec.ts
    — new describe block: real-catalog smoke (both demo registries' full control
      surface together, including departments' real failFirstAttempt error→retry)

modified (docs):
  docs/pages/registries.page.md — nav integration section, card polish section,
    app.routes.ts static-children rationale, browser-smoke note
  docs/agent-checklists/_NOW.md — claim added, then cleared

new:
  docs/agent-checklists/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md (this task's checklist)
  tasks/_archive/2026-08/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.done.md (this file)

created-then-removed:
  tasks/_active/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md (claim working copy)

NOT touched (verified): registry-detail.page.ts (audited only, no gaps found),
frontend/**, backend/**, libs/ui/**, libs/data-access/**, libs/features/**,
start.mjs, package.json, layout/route-paths.ts, layout/app-shell.component.ts,
layout/tool-rail-definitions.ts.
```

## Route matrix

| Route | Component | Guard | Nav |
|-------|-----------|-------|-----|
| `/registries` | `RegistriesListPage` | inherits `authGuard` | Header chip "Реестры" (own `NavCategory`, no rail entry) |
| `/registries/:registryKey` | `RegistryDetailPage` | inherits `authGuard` | Reached via card click or direct URL; header chip stays active (path-prefix match) |

No `capabilityRouteGuard`, no new `PermissionKey`, no `systemRoles` — `pageKey: 'registries'` has no seeded backend page-ACL anywhere, by design (see Honesty below).

## Honesty of the new nav item (no fabricated permission)

The nav item filters through the existing, unmodified `filterNavCategories`
logic: `if (pages && !pages.includes(item.pageKey)) return false;`. Since
`'registries'` is not a real backend-seeded page key, any account whose
`user.pages[]` is a restrictive allow-list (the normal case for non-owner
roles provisioned via the Roles UI) will correctly **not** see the chip.
Only accounts with `pages` unset (e.g. the owner) see it unconditionally.
This is the intended, honest behavior — the task explicitly forbids
inventing backend permissions, which means letting the real (currently
absent) ACL entry govern visibility rather than fabricating a way around it.

## Gates (факт)

- `pnpm exec nx build kppdf-web`: **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 65/65 tests, 11 suites (was 58 before this task)
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors
- `pnpm run architecture:check:nx`: **PASS** — 202 source files, 0 violations
- `pnpm run ui:tokens:nx`: **PASS** — 53 baseline occurrences, 0 new

## Browser-smoke result

Dev server (`nx serve kppdf-web`, port 4201) started, compiled cleanly
(zero Vite/esbuild errors) with all changes applied; unauthenticated root
serves the SPA shell (HTTP 200). Full authenticated visual click-through
(header chip click → `/registries` → card click → detail page; real browser
Back/Forward buttons) **was not performed** — no headless browser/Playwright
tooling available in this session, and no device-invite test account
available to pass `authGuard` (owner break-glass credentials live in
gitignored `deploy/synology/CREDENTIALS.md`, a production ops secret, not
used for routine dev QA). Verification relies on the 65-test automated
suite, including a full `RouterTestingHarness` router-integration spec
(real `Router`/`Location`) already covering `/registries` and
`/registries/:key` navigation end-to-end.

## Known limitations (carried over + new)

1. (carried over) `app-pi-card`'s default arrow icon needs a Lucide provider missing from `app.config.ts` — worked around with `[arrow]="false"`, not fixed (outside scope).
2. (carried over) `<app-pi-table>` sort-arrow glyph can go stale on same-instance cross-registry navigation (cosmetic).
3. (carried over) `registries.routes.spec.ts` uses `navigateByUrl` instead of real `Location.back()/forward()` for the same `RouterTestingHarness`+`SpyLocation` reason documented previously.
4. **New:** the "Реестры" header chip is visible only to accounts without a restrictive `pages[]` ACL (see Honesty section) — by design, not a defect.
5. **New:** no real-browser QA performed this session either (same tooling/credential gap as the prior task) — automated test coverage is the verification actually completed.

## Executor report

See `docs/agent-checklists/TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW.md` for the full acceptance/gates/executor-report breakdown.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - build: PASS
  - tests: PASS (65/65)
  - lint: PASS (0 errors)
  - architecture:check:nx: PASS (0 violations)
  - ui:tokens:nx: PASS (0 new)
  - checklist: ADDED
  - status synchronization: PASS
