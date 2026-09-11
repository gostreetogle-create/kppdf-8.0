# TZ-NX-REG-TEXT-BLOCK-CATEGORIES checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-09/TZ-NX-REG-TEXT-BLOCK-CATEGORIES.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-11T12:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто, нет чужого CLAIM
- [x] Audit + WAVE + оба TZ прочитаны; gold `text-blocks.registry.ts`/`text-blocks-http-data-source.ts`/`doc-studio-registry-actions.ts`; deleted-page source `dictionaries/text-block-categories.page.ts` (+ spec, для портирования coverage); `TextBlockCategoryFormDialogComponent`/`Data`; `registries.catalog.ts`/`.spec.ts`; `registry.types.ts`/`registry-crud-actions.ts`; BE `text-block-category.service.ts` (`list()` без параметров = все категории, roots+subs, не только roots)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-REG-TEXT-BLOCK-CATEGORIES.md` на месте

## Acceptance

- [x] `/registries` → Документы → «Категории текстов» + «Тексты» (порядок как в TZ AC)
- [x] Create root + subcategory + edit работает — reuse `TextBlockCategoryFormDialogComponent` без изменений, только вызов из registry actions вместо page methods
- [x] Системная «Общее» без delete — `isDeleteDisabled`/`deleteDisabledReason` (новый опциональный hook в `createRegistryCrudActions`), delete кнопка видна, но disabled+reason (не скрыта — платформенный idiom, см. `units.registry.ts` activate/deactivate)
- [x] Старый URL `/dictionaries/text-block-categories` открывает реестр — `redirectTo: '/registries/text-block-categories'` в `app.routes.ts`
- [x] Studio/text form cascade не сломан — `TextBlockFormDialogComponent`/`categoryId` cascade не тронуты, `text-blocks-http-data-source.ts`/`text-blocks.registry.ts` не изменены
- [x] Gates PASS (tsc/test/lint-baseline/architecture-check/nx build)

## Integrity slot (до READY / archive)

- [x] Тип изменения: новый registry (data source + registry def + action wiring) + 1 shared-helper extension (`isDeleteDisabled`) + route redirect + удаление мёртвого page-компонента — не BE TextBlockCategory rewrite, не catalog `Category`
- [x] FIC: A (route redirect; `/registries/:key` matcher уже покрывает новый ключ без правки route файла)
- [x] page.md обновлён: `text-block-categories.page.md` (новая секция «SoT», старая помечена historical/superseded) + `registries.page.md` (2 таблицы + История)
- [x] Чужой WIP не в коммите; conflict keys соблюдены (плюс 2 небольших выхода за явно перечисленные ключи, задокументированы в Executor report: `registry-crud-actions.ts` — минимальное backward-compatible расширение; `app-shell.component.spec.ts` — вынужденный фикс, без него gates TZ-01 не прошли бы)
- [x] Канон: docs/DOCS-INTEGRITY.md — не спутал `TextBlockCategory` с catalog `Category` (type=material/product/module) ни в одном файле

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → **PASS** exit 0
- `cd frontend-nx && pnpm test` (5 projects) → **PASS** 110 suites / 758 tests (7 skipped), 0 failed
- `cd frontend-nx && pnpm exec nx lint kppdf-web` → baseline restored exactly (271 problems / 38 errors) после одной самофиксированной non-null-assertion warning в новом spec
- `pnpm architecture:check` (repo root) → **PASS** (1478 files)
- `cd frontend-nx && pnpm exec nx build kppdf-web` (production, последний) → **PASS**, те же 2 pre-existing warnings

## Executor report

- **Design decision — flat registry, not a second master-detail platform.** The audit itself recommended this ("prefer flat + reuse form dialogs — меньше платформенного долга"). New `path` column carries the old page's two-tier hierarchy as a single breadcrumb string ("Root" for a root row, "Root › Sub" for a sub); sorting rows lexicographically by `path` alone groups every root directly above its own children for free — no separate group-by pass needed, since a root's path string is always a prefix of its children's.
- **Two small, necessary touches outside the TZ's own listed conflict keys** (both documented here rather than silently expanded scope):
  1. `registry-crud-actions.ts` (`createRegistryCrudActions`) had no way to disable its auto-generated `delete` action per-row — every other registry that needs a conditional lock (`units.registry.ts`) only ever needed it on a *domain* action, which already supported `isDisabled`. Added optional `isDeleteDisabled`/`deleteDisabledReason`, fully backward compatible (every existing caller's `delete` behavior is unchanged since the new fields default to `undefined`). Added a dedicated test for the new option in `registry-crud-actions.spec.ts`.
  2. `app-shell.component.spec.ts` (declared as a TZ-02 conflict key, not this one) broke immediately once `/dictionaries/text-block-categories` became a `redirectTo` — `collectPageRoutePaths` only counts routes with a real `loadComponent` as "existing", so the `reference` nav group's one live item disappears again and its header chip vanishes (counts 9→8, 8→7). Left unfixed, TZ-01 alone would ship with 2 failing tests. Fixed both assertions now (documented inline in the spec) rather than deferring to TZ-02, since "Gates PASS" is this TZ's own AC #5 — TZ-02 will still do the real work of physically deleting the `reference` block from `NAV_CATEGORIES`, just starting from a state where the chip is already gone rather than causing a regression in between.
  3. Deleted `dictionaries/text-block-categories.page.ts` + its spec (TZ explicitly preferred deletion over an unused leftover) — the "system row 409 / no delete" test intent it carried was ported onto the registry's own `delete` row-action tests (`text-block-categories.registry.spec.ts`), not lost.
- New files: `text-block-categories-http-data-source.ts` (+ spec: path resolution, root-groups-above-its-subs sort, `rootsOnly`/`search` filters, pagination), `text-block-categories.registry.ts` (+ spec: key/title/category, toolbar create, edit, «Создать подкатегорию» enabled-on-root/disabled-on-sub, delete disabled-for-system + BE-409 surfaced without reload). `doc-studio-registry-actions.ts` gained `buildTextBlockCategoryActions`/`buildTextBlockCategoryCreateAction`/`openTextBlockCategoryForm`, mirroring the existing `buildTextBlockActions`/`openTextCreate` shape for texts.
- `registries.catalog.ts`: `createTextBlockCategoriesRegistry(studio)` added to the studio-gated array, positioned before `text-blocks`/`table-templates` (matches the TZ AC's own listed order, "«Категории текстов» + «Тексты»"). `registries.catalog.spec.ts`'s one key-order assertion updated.
- `app.routes.ts`: `/dictionaries/text-block-categories` is now `redirectTo: '/registries/text-block-categories'` (old bookmarks keep working) — the destination needs no new route entry since `REGISTRIES_ROUTES`' single `UrlMatcher` already resolves any `/registries/:key` including this new one.
- No live browser click-through performed in this session (no windowed environment); relied on the gate battery plus reading the BE service's actual query-builder logic directly (confirmed `list()` with no params returns roots+subs together, not just roots) rather than assuming the flat-list approach would work. Recommend PO does one visual pass on `/registries/text-block-categories` — create root, create sub under it, edit, confirm system «Общее» row shows delete greyed out with a tooltip — before calling this fully closed visually.

## Closeout (после PASS)

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-11T13:05:00Z
