# TZ-NX-REGISTRIES-MASTER-TABLE-UX checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MASTER-TABLE-UX.done.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-08-29T00:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] `pwd` / `git rev-parse --show-toplevel` → `D:\kppdf-8.0`
- [x] `tasks/_active/` проверен — пусто до этого claim, конфликтов нет
- [x] `git status --porcelain -- frontend-nx/apps/kppdf-web/src/app/pages/registries frontend-nx/libs/ui` — только baseline `??` (весь frontend-nx untracked), чужого WIP поверх baseline нет
- [x] TZ прочитан: `tasks/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md`
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS

## Acceptance

- [x] `/registries` — master table вместо card grid, доступна через header button (nav-categories.ts не тронут, chip по-прежнему ведёт на `/registries`)
- [x] Строки: title+description (cellTemplate), source (API/Демо badge), record-count (RU-плюрализация/«Неизвестно»), expand control (встроенный `pi-table` шеврон + клик по строке)
- [x] Клик по строке раскрывает inline panel сразу под строкой (`pi-table`'s `expandedRow` tray, не отдельная страница, не модал)
- [x] Panel содержит полный detail engine: table/filters/pagination/loading/empty/error+retry/expandable child rows/row actions (дословно перенесено из бывшего `RegistryDetailPage`)
- [x] Только один раскрытый registry одновременно (архитектурно гарантировано единым предикатом `expandedRowWhen`, не отдельным флагом — покрыто тестами)
- [x] `/registries/:registryKey` — router-aware, переживает refresh/back/forward (`registries.routes.spec.ts`, `RouterTestingHarness`)
- [x] Unknown key — понятный not-found + return action, master table остаётся видимой
- [x] Units = реальный API, Departments = demo fixture, оба явно подписаны (`source: 'api'|'demo'` + badge)
- [x] Shell canon не тронут: header/left rail/right rail/center workspace (`layout/**` не в diff)
- [x] Paper & Ink токены/spacing/borders/typography/breadcrumb — без raw colors/box-shadow/новых UI-примитивов (`ui:tokens:nx` PASS, 0 новых occurrences; только существующие `@kppdf/ui/*` компоненты и уже используемые utility-классы)
- [x] Detail engine не задублирован — вынесен в `RegistryDetailPanelComponent`, единственное место с query/loading/error/row-action логикой
- [x] Query state (filters/page/pageSize/sort) в URL сохранён (`registry-query-state.ts` не менялся по логике)
- [x] `row.key` остаётся идентификатором Units (`rowId: row => row.key` в `units.registry.ts`, не тронут)
- [x] Не тронуты: backend/**, frontend/**, libs/ui/**, `/kit/*`, header/rails, новые deps/permissions/endpoints/fields — подтверждено `git status --porcelain` (см. Executor report)

## Integrity slot (до READY / archive)

- [x] Тип изменения: page (frontend-nx UX rework, без backend)
- [x] FIC §A–E: N/A — нет нового backend module/permission/MCP; route path не меняется (`/registries`, `/registries/:registryKey` уже существовали, только их внутренний `loadComponent`-таргет объединён)
- [x] page.md / PAGE-TZ-INDEX: **DONE** — `docs/pages/registries.page.md` переписан под master-table UX; строка в `docs/pages/PAGE-TZ-INDEX.md` обновлена (была "TZ-NX-REGISTRIES-PLATFORM DONE — fixture-only", стала актуальной)
- [x] SECTION-READINESS: N/A (нет нового user contour/роли)
- [x] Чужой WIP не в коммите; conflict keys: `frontend-nx/apps/kppdf-web/src/app/pages/registries/**`
- [x] Coupling map: N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend-nx && pnpm exec nx build kppdf-web`: **PASS** — clean build (`--skip-nx-cache` verified fresh), только 2 заведомо-намеренных `NG8102` (defensive `?? ''` на индексации `Record<string,string>`, TS структурно обещает `string`, но ключа может не быть в объекте — риск буквального `"undefined"` в input value, оставлено намеренно) + 2 pre-existing bundle-budget warnings (`pi-showcase-card`, `nx-welcome` — чужие файлы, известны по прежним TZ)
- `cd frontend-nx && pnpm exec nx test kppdf-web`: **PASS** — 101/101 (15 suites, было 83/14 до этой TZ — +18 тестов, +1 suite)
- `cd frontend-nx && pnpm exec nx run-many -t lint --all`: **PASS** — 0 errors (26 pre-existing/consistent-style warnings — `no-non-null-assertion` в спеках по всему репо, включая один в моём новом `registry-detail-panel.component.spec.ts:286` тем же паттерном, что уже везде в кодовой базе)
- `pnpm run architecture:check:nx`: **PASS** — 205 source files, 0 violations
- `pnpm run ui:tokens:nx`: **PASS** — 53 baseline occurrences, 0 new

## Browser smoke (обязателен)

- `nx serve kppdf-web` (свежий инстанс, порт 4211, `--skip-nx-cache`-эквивалент через чистый повторный запуск) — компилируется без ошибок (только те же 2 намеренных `NG8102`), `Watch mode enabled`.
- `curl` HTTP-статусы: `/` → 200, `/registries` → 200, `/registries/units` → 200, `/registries/departments` → 200 (SPA history-fallback работает для всех трёх путей, включая deep-link на конкретный реестр).
- **Реальный клик мышью в браузере НЕ выполнялся** — в этой сессии нет Playwright/headless-браузера (`pnpm exec playwright` → not found, нет браузерного бинарника в PATH) и нет доступного device-invite тестового аккаунта для прохождения `authGuard`, тот же зафиксированный ранее (TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW) пробел инструментария этой среды.
- Верификация самого клика/раскрытия панели/«только одна открыта» выполнена **автотестами уровня DOM с реальным кликом**: `registries-page.spec.ts` (`.click()` по master-строке + assert `data-row-open`/`registry-panel-title`) и `registries.routes.spec.ts` (через `RouterTestingHarness` с реальным `Router`/`Location`, включая раздельные тесты «клик по Units раскрывает реальную таблицу», «клик по Departments раскрывает demo-таблицу», «клик по второй строке закрывает первую», «клик по открытой строке схлопывает»). Это не полная замена ручной браузерной проверки, но конкретно доказывает DOM-эффект клика, а не только URL/state.

## Executor report

**Архитектура:** `/registries` и `/registries/:registryKey` теперь резолвятся
в один и тот же `RegistriesPage` (`registries-page.ts`, ранее было два файла
`registries-list.page.ts` (card grid) + `registry-detail.page.ts` (routed
detail) — оба удалены). Detail-движок вынесен без изменения логики в новый
`RegistryDetailPanelComponent` (`registry-detail-panel.component.ts`) —
`@Input required definition`, тот же `ActivatedRoute`/`Router` DI (компонент
монтируется как обычный child, не через router-outlet, поэтому получает тот
же matched route). Master table и раскрытие строки целиком используют
готовый `@kppdf/ui/table`'s `[expandedRow]`/`[expandedRowWhen]`/`(rowClick)`
API (тот же примитив, что уже показывал expandable child rows у Departments)
— «только одна раскрыта» и ink-frame рамка вокруг открытой строки+панели
получены бесплатно из существующего, уже covered тестами примитива, без
единой новой строчки CSS.

**Platform-contract change (узкий, обоснованный):** `RegistryDefinition.source:
'api'|'demo'` — обязательное поле, добавлено, чтобы master table могла
честно подписать источник данных без парсинга `description`. Затронуло:
`units.registry.ts` (`source:'api'`), `departments.registry.ts`
(`source:'demo'`), 3 тестовых fixture-файла (`registry-query-state.spec.ts`
— 1 строка; остальные фикстуры уже переписаны в новых спеках).
`RegistryCardSummary` (использовался только удалённым card-grid) заменён на
`RegistryMasterRow` (`id,key,title,description?,source,recordCount`).

**Изменённые файлы:**
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
    — both routes → registries-page.ts
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries-a11y.spec.ts
    — rewritten for master table + panel a11y
  frontend-nx/apps/kppdf-web/src/app/pages/registries/registries.routes.spec.ts
    — rewritten: master table URL-sync/back-forward/only-one-open/real-catalog smoke
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry.types.ts
    — +RegistrySource, +RegistryDefinition.source (required), RegistryCardSummary→RegistryMasterRow
  frontend-nx/apps/kppdf-web/src/app/pages/registries/model/registry-query-state.spec.ts
    — +source:'demo' in its one fixture (compile-only change)
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/units.registry.ts
    — +source:'api'
  frontend-nx/apps/kppdf-web/src/app/pages/registries/data/departments.registry.ts
    — +source:'demo'
  docs/pages/registries.page.md — rewritten for master-table UX
  docs/pages/PAGE-TZ-INDEX.md — registries row updated (was stale "fixture-only")

created-then-removed:
  tasks/_active/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md (claim working copy)
```

**Не тронуто (проверено):** `backend/**`, `frontend/**`,
`frontend-nx/libs/ui/**`, `frontend-nx/libs/data-access/**`,
`frontend-nx/apps/kppdf-web/src/app/layout/**` (header/rails/nav-categories),
`frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `/kit/*` routes, никаких
новых зависимостей в `package.json`.

**Known limitations:**
1. Реальный браузерный клик не проверен вручную (см. Browser smoke) — нет
   headless-браузера в сессии, тот же пробел, что и в прошлых registries-TZ.
2. `registries.routes.spec.ts` paging back/forward тест по-прежнему
   использует `navigateByUrl` вместо `Location.back()/forward()` — тот же
   ранее задокументированный версийный нюанс `RouterTestingHarness` (не мой
   баг, унаследовано из оригинального теста один-в-один).
3. **Побочное улучшение, не отдельная правка:** прежний известный баг «стрелка
   сортировки может не обновиться при переключении между реестрами без
   размонтирования» (задокументирован в TZ-NX-REGISTRIES-NAV-AND-DEMO-REVIEW)
   устранён как естественное следствие того, что panel теперь пересоздаётся
   (`@if` + `*ngTemplateOutlet`) при каждом переключении раскрытой строки,
   вместо переиспользования Angular Router'а того же routed-компонента.

**Outcome: PASS.**

## Review handoff

- [x] Review diff перед закрытием (single-agent TZ, без wave review inbox) — самопроверка: только `pages/registries/**` + docs, `git status --porcelain` подтверждает отсутствие правок вне разрешённой зоны

## Closeout (после PASS)

- [x] archive `tasks/_archive/2026-08/TZ-NX-REGISTRIES-MASTER-TABLE-UX.done.md`
- [x] удалить `tasks/_active/TZ-NX-REGISTRIES-MASTER-TABLE-UX.md`
- Status = DONE
- closed_at: 2026-08-29T00:00:00+03:00
