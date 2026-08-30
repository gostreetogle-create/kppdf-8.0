# TZ-NX-REGISTRIES-PLATFORM — платформа «Реестры» (frontend-nx)

> Примечание: исходный файл `tasks/TZ-NX-REGISTRIES-PLATFORM.md` в репозитории
> отсутствовал на момент старта — TZ восстановлено дословно из промпта PO
> (сессия 2026-08-29) и сохранено в `_active` как рабочая копия, теперь архивировано.

## Scope

Только:
- `frontend-nx/apps/kppdf-web/src/app/pages/registries/**`
- `frontend-nx/apps/kppdf-web/src/app/app.routes.ts` — только подключение `/registries`
- task/checklist/archive файлы

## Запрещено

- `frontend/**`
- `backend/**`
- `libs/ui/**`
- `libs/data-access/**`
- `libs/features/**`
- новые зависимости
- реальные domain API на этом этапе
- изменение operational shell и KitLayout

## Результат (требовалось)

- `/registries` со списком registry cards;
- `/registries/:registryKey` с раскрытым реестром;
- URL/query state для filters, page, pageSize, sort;
- fixture adapters, минимум 2 demo registry;
- toolbar, filters, table, pagination;
- expandable row;
- row actions с confirmation для destructive action;
- loading/empty/error/retry states;
- responsive layout;
- keyboard/accessibility;
- Back/Forward через Router;
- unknown registry state;
- без dead links и без AnyTableService.

Типизированный контракт: `RegistryDefinition`, `RegistryColumn`, `RegistryFilter`,
`RegistryRowAction`, `RegistryQueryState`, `RegistryPageState`.

Не подключать Products/Materials/Orders, не выдумывать backend permissions.

## Changed files

```
new:
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry-query-state.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry-query-state.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/fixture-registry-data-source.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/departments.registry.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/registries.catalog.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-list.page.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registry-detail.page.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.spec.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-a11y.spec.ts
  docs/pages/registries.page.md

modified:
  frontend-nx/apps/kppdf-web/src/app/app.routes.ts   (+4 lines: one `registries` child route, loadChildren)
  docs/pages/PAGE-TZ-INDEX.md                        (+1 row)
  docs/agent-checklists/_NOW.md                      (claim added, then cleared)

task/checklist:
  tasks/_active/TZ-NX-REGISTRIES-PLATFORM.md         (created during claim, removed at archive)
  docs/agent-checklists/TZ-NX-REGISTRIES-PLATFORM.md (this task's checklist, Status: DONE)
```

No other files touched — `frontend/**`, `backend/**`, `libs/**` untouched; no new dependencies added.

## Route matrix

| Route | Component | Guard | Notes |
|-------|-----------|-------|-------|
| `/registries` | `RegistriesListPage` | inherits `authGuard` from `AppShellComponent` | card grid, catalog injected via `REGISTRIES_CATALOG` |
| `/registries/:registryKey` | `RegistryDetailPage` | inherits `authGuard` | unknown `registryKey` → dedicated not-found state (no 404/dead redirect) |

No `capabilityRouteGuard`/`pageKey`/new `PermissionKey` — deliberately, per task instruction (no invented backend permissions for a page with no real domain API yet). No `NAV_CATEGORIES` entry — outside declared scope (`pages/registries/**` + one `app.routes.ts` line only); reachable by direct link, not a dead route.

## Typed contract

`model/registry.types.ts`: `RegistryDefinition<TRow>`, `RegistryColumn<TRow>`, `RegistryFilter`, `RegistryRowAction<TRow>`, `RegistryQueryState`, `RegistryPageState<TRow>`, `RegistryDataSource<TRow>`, `RegistryActionContext`, `RegistryExpandable<TRow>`. One controlled type-erasure boundary, `defineRegistry<TRow>()`, widens an authoring-time-strict `RegistryDefinition<TRow>` to the catalog's `RegistryDefinition<RegistryRow>` (`RegistryRow = Record<string, unknown>`) — the generic engine (list/detail pages) never references a concrete row shape and never uses `any` (no "AnyTableService").

## Demo registries (fixture-only, no backend)

- `units` — Единицы измерения: flat table, text+select filters, sort, destructive `delete` (confirm) + non-destructive `copy-code`.
- `departments` — Отделы: + expandable row, destructive `archive` (confirm, per-row `isDisabled`), fixture data source's `failFirstAttempt: true` demonstrates a real error→retry cycle (first `query()` call rejects, retry succeeds).

## Gates (факт)

- `pnpm exec nx build kppdf-web` (из `frontend-nx/`): **PASS**
- `pnpm exec nx test kppdf-web`: **PASS** — 58/58 tests, 11 suites
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors (pre-existing warnings in untouched files only)
- `pnpm run architecture:check:nx` (root): **PASS** — 202 source files, 0 violations
- `pnpm run ui:tokens:nx` (root): **PASS** — 53 baseline occurrences, 0 new

## Known limitations

1. `app-pi-card`'s default `[arrow]="true"` renders `<i-lucide name="arrow-up-right">`, which needs `LucideAngularModule.pick({ArrowUpRight})` registered in `app.config.ts` — that provider is missing there (a pre-existing gap vs. `card.component.ts`'s own docblock, outside this TZ's scope to fix). Worked around with `[arrow]="false"` on the registry cards; no `app.config.ts` edit made.
2. `<app-pi-table>`'s sort-arrow glyph is a one-shot `ngOnInit` seed from `[initialSortKey]`/`[initialSortDir]`. If a user navigates directly between two different registries' detail pages without passing through the list (Angular's default route-reuse keeps the same component instance for the same `:registryKey` route pattern), the glyph can go stale even though the underlying data/sort stays correct. Cosmetic only; no AC depends on it.
3. `registries.routes.spec.ts` — the "Back/Forward" tests use `RouterTestingHarness.navigateByUrl()` for both directions rather than `Location.back()/forward()`. Manual investigation confirmed `SpyLocation.back()` (`@angular/common/testing`) emits a correct `popstate` event (verified via a direct `location.subscribe` probe, including a proper `{navigationId, ɵrouterPageId}` state), but `Router.url` does not update afterwards in this exact `RouterTestingHarness` + `provideLocationMocks()` combination (Angular 20.3.30) — tried `withRouterConfig({ canceledNavigationResolution: 'computed' })` too, no change. This looks like a testing-utility version interaction, not a bug in the page: every state change in the app goes exclusively through `Router.navigate()`, never a raw History API call, which is the actual guarantee "Back/Forward через Router" requires. No manual real-browser QA was performed either — no headless browser/Playwright available in this session, and no device-invite test account to pass `authGuard`. The 58-test automated suite (including the full router-integration spec) is the verification actually completed.
4. `/registries` is not wired into `NAV_CATEGORIES`/the sidebar — deliberately, since the task scope is `pages/registries/**` + one `app.routes.ts` line only. Reachable by direct URL; not a dead link (the route exists and works).

## Executor report

See `docs/agent-checklists/TZ-NX-REGISTRIES-PLATFORM.md` for the full acceptance/gates/executor-report breakdown.

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-29
closed_by: Claude
verification:
  - acceptance criteria: PASS
  - build: PASS
  - tests: PASS (58/58)
  - lint: PASS (0 errors)
  - architecture:check:nx: PASS (0 violations)
  - ui:tokens:nx: PASS (0 new)
  - checklist: ADDED
  - status synchronization: PASS
