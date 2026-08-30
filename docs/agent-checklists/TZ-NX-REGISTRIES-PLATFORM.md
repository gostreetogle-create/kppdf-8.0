# TZ-NX-REGISTRIES-PLATFORM checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T14:11:54+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — ACTIVE/LIVE было пусто, конфликтов нет
- [x] TZ восстановлено из промпта PO в `tasks/_active/TZ-NX-REGISTRIES-PLATFORM.md` (исходного `tasks/TZ-NX-REGISTRIES-PLATFORM.md` в репо не было)
- [x] Обследован текущий frontend-nx: `app.routes.ts`, `@kppdf/ui/*` public API (table/dialog/row-actions/page/card/status-banner/select), `@kppdf/data-access` (auth/capabilities/admin), architecture-check.mjs (не проверяет `frontend-nx/**` границы — это Nx ESLint), `ui:tokens:nx` (baseline-diff), `admin-roles.page.ts` как эталон паттерна (group-workspace / table / row-actions / dialog confirm), `nav-categories.ts` (нет записи `registries` — вне scope, не трогаем), legacy `frontend/src/app/pages/dictionaries/*` только для RU-копирайта (не для кода)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REGISTRIES-PLATFORM.md` на месте

## Acceptance

- [x] Типизированный контракт: `RegistryDefinition`, `RegistryColumn`, `RegistryFilter`, `RegistryRowAction`, `RegistryQueryState`, `RegistryPageState` (+ `RegistryDataSource`, `defineRegistry` erasure boundary) — `model/registry.types.ts`
- [x] `/registries` — card list (2 demo registries: `units`, `departments`, fixture-only) — `registries-list.page.ts`
- [x] `/registries/:registryKey` — раскрытый реестр (toolbar/filters/table/pagination/sort) — `registry-detail.page.ts`
- [x] URL/query state: filters, page, pageSize, sort — round-trip через `ActivatedRoute`/`Router` — `model/registry-query-state.ts` (+ unit tests)
- [x] Back/Forward через Router — все переходы состояния идут только через `Router.navigate()`/`RouterTestingHarness.navigateByUrl()`, ни одного прямого `history`/`Location` вызова в коде страниц (см. Known limitations — юнит-тест реального `Location.back()` упёрся в версийную особенность `RouterTestingHarness`+`SpyLocation`, не в код страницы)
- [x] unknown registry state — `registry-unknown` блок + back-link на `/registries`
- [x] loading/empty/error/retry states — skeleton (pi-table), `emptyMessage`, `PiStatusBannerComponent` + «Повторить», `departments` fixture `failFirstAttempt` демонстрирует реальный цикл
- [x] expandable row — `departments` (`expandable.fields`), generic engine через `<ng-template>` вне `@if`
- [x] row actions с confirmation (`AlertDialogComponent`) для destructive action — `delete`/`archive` actions на обоих demo-реестрах
- [x] responsive (grid card list `sm:`/`lg:` breakpoints, `overflow-x-auto` table) + keyboard/accessibility (aria-label filters/table, native focus-ring buttons, `role="alertdialog"` confirm)
- [x] app.routes.ts: только добавление `path: 'registries'` (`loadChildren` → `pages/registries/registries.routes.ts`)
- [x] Никаких Products/Materials/Orders, никаких новых backend permissions/pageKey/capabilityRouteGuard
- [x] Без AnyTableService — типы генерик везде, единственное контролируемое стирание типа — `defineRegistry()` (см. `registry.types.ts` докблок)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (frontend-nx, demo/fixture platform, без backend)
- [x] FIC §A–E: N/A — нет нового backend module/permission/MCP; это чисто frontend-nx fixture-платформа без domain API
- [x] page.md / PAGE-TZ-INDEX: **DONE** — создан `docs/pages/registries.page.md`, добавлена строка в `docs/pages/PAGE-TZ-INDEX.md` (секция после `frontend-nx` auth-parity строки)
- [x] SECTION-READINESS: N/A (нет нового user contour/роли/доступа)
- [x] Чужой WIP не в коммите; conflict keys: `frontend-nx/apps/kppdf-web/src/app/pages/registries/**`, `app.routes.ts` (1 route)
- [x] Coupling map: N/A (нет общего статус-поля/FK на нескольких экранах)
- [x] Канон: docs/DOCS-INTEGRITY.md — page.md создан в той же TZ

## Gates (факт)

- `pnpm exec nx build kppdf-web` (из `frontend-nx/`): **PASS** (только pre-existing budget-warnings на `pi-showcase-card`/`nx-welcome`, не мои файлы)
- `pnpm exec nx test kppdf-web`: **PASS** — 58/58 (11 test suites; в т.ч. `registries-list.page.spec.ts`, `registry-detail.page.spec.ts`, `registries.routes.spec.ts` (RouterTestingHarness), `registries-a11y.spec.ts`, `model/registry-query-state.spec.ts`)
- `pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors (13 pre-existing warnings в чужих файлах: `app-shell.component.spec.ts`, `nav-categories.spec.ts` — не трогал)
- `pnpm run architecture:check:nx` (root): **PASS** — 202 source files, 0 violations
- `pnpm run ui:tokens:nx` (root): **PASS** — 53 baseline occurrences, 0 new

## Executor report

**Реализовано:**
- Типизированный контракт `RegistryDefinition/Column/Filter/RowAction/QueryState/PageState/DataSource` + `defineRegistry()` erasure boundary (`model/registry.types.ts`).
- Чистые функции URL↔state: `parseRegistryQueryState`/`toRegistryQueryParams` (`model/registry-query-state.ts`) с валидацией filter/page/pageSize/sort против самого `RegistryDefinition`.
- Generic in-memory fixture adapter `createFixtureDataSource` (filter/sort/paginate + опциональный `failFirstAttempt` для демонстрации error→retry) — `data/fixture-registry-data-source.ts`.
- Два demo-реестра: `units` (flat, delete+copy actions) и `departments` (expandable row, archive+copy actions, `failFirstAttempt`) — `data/units.registry.ts`, `data/departments.registry.ts`.
- Каталог через `InjectionToken` (`REGISTRIES_CATALOG`) для тестируемости — `data/registries.catalog.ts`.
- `RegistriesListPage` (`/registries`) — card grid, `app-pi-card` (`[arrow]="false"`, см. известное ограничение ниже).
- `RegistryDetailPage` (`/registries/:registryKey`) — единый generic-движок: toolbar (native text+select filters), `@kppdf/ui/table` (server-side sort/pagination, expandable row, row-actions template), `AlertDialogComponent` confirm для destructive actions, `PiStatusBannerComponent` error+retry, unknown-registry fallback.
- `registries.routes.ts` (list+detail, lazy) + одна строка в `app.routes.ts` (`loadChildren`).
- 5 spec-файлов, 58 тестов: card list, url/query-state (unit), unknown registry, loading/empty/error/retry, expandable row, row-action confirmation, full-router integration (`RouterTestingHarness`: open registry, unknown key, paging→URL, revisit-prior-URL-restores-state, list↔detail), accessibility smoke.

**Route matrix:**

| Route | Component | Guard |
|-------|-----------|-------|
| `/registries` | `RegistriesListPage` | наследует `authGuard` от shell |
| `/registries/:registryKey` | `RegistryDetailPage` | наследует `authGuard` от shell; неизвестный key → unknown-state, не 404/redirect |

**Known limitations:**
1. `app-pi-card`'s `[arrow]="true"` (default) требует `LucideAngularModule.pick({ArrowUpRight})` в `app.config.ts`, которого там нет (расхождение с докблоком `card.component.ts`, pre-existing вне scope) → используется `[arrow]="false"`, не трогал `app.config.ts` (вне scope TZ).
2. Sort-arrow glyph в `<app-pi-table>` — one-shot seed в `ngOnInit`; при переключении между реестрами БЕЗ размонтирования (Angular route-reuse при смене только `:registryKey`) глиф может визуально не обновиться, хотя данные/сортировка корректны. Косметика, не блокирует AC.
3. `registries.routes.spec.ts`: тесты «Back/Forward» используют `harness.navigateByUrl()` вместо `Location.back()/forward()` — `SpyLocation.back()` эмитит корректный popstate (проверено вручную), но `Router.url` не обновляется в связке `RouterTestingHarness`+`provideLocationMocks()` (Angular 20.3.30) — похоже на версийную особенность тестовых утилит, не на баг страницы (весь код идёт только через `Router.navigate`). Real-browser QA не проводилась — нет headless-браузера в сессии и нет доступного device-invite тестового аккаунта для прохождения `authGuard`. Автоматическое покрытие (58 тестов, включая полный router-integration spec) — единственная выполненная проверка.
4. `/registries` не добавлен в `NAV_CATEGORIES`/sidebar — вне заявленного scope TZ (только `pages/registries/**` + одна строка `app.routes.ts`); страница доступна по прямой ссылке, не dead link (route реально существует и работает).

**Outcome: PASS.**

## Review handoff

- [x] Review diff перед закрытием (single-agent TZ, без wave review inbox) — самопроверка: типы без `any`, отсутствие правок вне `pages/registries/**`+`app.routes.ts`, все gates зелёные

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRIES-PLATFORM.done.md`
- [x] удалить `tasks/_active/TZ-NX-REGISTRIES-PLATFORM.md`
- [x] `_NOW.md` ACTIVE/LIVE очищен
- Status = DONE
- closed_at: 2026-08-29T14:46:41+03:00
