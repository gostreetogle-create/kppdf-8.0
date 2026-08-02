# TZ-PRODUCTS-305 — Карточки-витрины sm/md/lg + toggle list ↔ grid

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Layer 3 (frontend). Пятый в цепочке Products (зависит от TZ-PRODUCTS-304 — expandable-каталог). Backend НЕ трогается.

- `frontend/src/app/shared/ui/card/pi-showcase-card.component.ts` (+ spec) — **перенесён идентичным контентом из part-1 `e00be99`** (лежит на main, НЕ в этой ветке): три размерных варианта sm/md/lg (eyebrow/title/description/mediaUrl/badge/interactive/arrow + слоты sc-actions-sm / sc-actions-md / sc-actions / sc-related).
- `frontend/src/app/shared/ui/card/index.ts` — экспорт `pi-showcase-card`.
- `frontend/src/app/pages/products/products.page.ts` — toggle list ↔ grid:
  - `viewMode: signal<'list' | 'grid'>` + `setViewMode()`; localStorage persistence (`pi-products-view-mode`, паттерн snapSettings try/catch);
  - кнопки `ListIcon`/`GridIcon` в тулбаре (`aria-pressed`, `data-test=view-list-button|view-grid-button`);
  - grid-вид: сетка `grid-cols-1 md:2 xl:3` sm showcase-карточек — `eyebrow` (метка вида), `title` (name), `description` (SKU · подкатегория), `sc-actions-sm` слот: PiAvatar (инициалы по name, т.к. фото = отдельная сущность) + badge статуса (`@if (statusLabel(row))`, muted для Неактивен/Архив/Черновик) + цена (`formatPrice`);
  - routerLink `/products/:id`, loading/empty state (`grid-loading`/`grid-empty`);
  - **template-refs хоустированы из `@if/@else`** на корень — `@ViewChild({ static: true })` резолвится независимо от viewMode (иначе row-actions/name-ссылки терялись в grid-режиме).
- `frontend/src/app/pages/products/products.page.spec.ts` — +9 тестов (toggle open/close, карточки, routerLink, localStorage обе стороны, empty state, badge скрыт при пустом статусе).
- `docs/pages/products.page.md` — секция «Карточки-витрины / toggle list ↔ grid (TZ-PRODUCTS-305)» + TZ-строка.

## Dependencies

- TZ-PRODUCTS-304 (`84ad25c`) — expandable-каталог (products.page.ts).
- part-1 `e00be99` (main) — PiShowcaseCardComponent; перенесён verbatim (чистый merge в main).

## Conflict keys

- `frontend/src/app/shared/ui/card/*` (pi-showcase-card NEW, index.ts)
- `frontend/src/app/pages/products/products.page.ts`
- `frontend/src/app/pages/products/products.page.spec.ts`
- `docs/pages/products.page.md`

## Protected paths

- Backend — НЕ трогается (endpoint /products готов).
- pi-table — НЕ меняется (правило TZ-304).
- TZ-PRODUCTS-301..304 (closed), TZ-MODULES-*, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*, sanitize-html, Z-backlog, desktop/, mobile/.

## Решения (зафиксированы)

1. **Part-1 e00be99 НЕ в ветке** (лежит на main) — компонент перенесён идентичным контентом (`git show e00be99:... > файл`), будущий merge без конфликтов. Spec адаптирован: `CUSTOM_ELEMENTS_SCHEMA` + `overrideComponent` (lucide-иконки в jsdom, паттерн card.component.spec).
2. **Template-refs вне `@if/@else`** — `@ViewChild({ static: true })` не резолвит refs внутри structural-directive-ветки; хоустинг на корень решает (row-actions/name-ссылки работают в обоих viewMode).
3. **`KIND_LABELS` — модульная константа** недоступна из шаблона Angular → метод `gridEyebrow(row)`.
4. **Badge статуса** — `@if (statusLabel(row))` guard (пустой pill не рендерится); `statusBadgeClass` с общим base (текст-muted для Неактивен/Архив/Черновик).
5. **`arrow` на sm не рендерится** (md/lg только) — не передаём, `interactive` оставлен (hover).

## Acceptance criteria (все выполнены)

1. PiShowcaseCardComponent с size sm/md/lg — рендер корректный (unit-spec 9 тестов). ✅
2. lg-витрина показывает медиа/badge/статус/секции/связанные/actions; sm — компактная строка. ✅
3. Каталог: toggle list ↔ grid, sm-карточки (name/цена/статус/инициалы), клик → /products/:id. ✅
4. Стили на дизайн-токенах (hairline, shadow, Paper & Ink). ✅
5. `pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0. ✅
6. `pnpm exec jest pi-showcase-card products --no-coverage` — 4 suites / 64 tests PASS (25 в двух целевых). ✅
7. `pnpm exec ng build --configuration=development` — exit 0 (без warning'ов). ✅
8. `git diff --check` — clean; `bash OrchestratorKit/verify-status.sh` — PASS. ✅

## Тесты

- pi-showcase-card.component.spec.ts (9): рендер, дефолт md, sm/md/lg разметка, interactive hover, arrow suppression, media, content projection.
- products.page.spec.ts (+9 к 304-восьми): toggle → grid, карточки (name/инициалы/цена), routerLink `/products/p1`, localStorage persistence обе стороны, grid empty, badge скрыт при пустом статусе, list-возврат.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — live flow не запускался (dev-stack не поднимался); контракт доказан unit-тестами с РЕАЛЬНЫМ рендером (provideHttpClientTesting + provideRouter) + ng build.

## Known limitations

- TZ-DOC-308 categories.page.ts — pre-existing blocker (в этом билде ng build exit 0; не fix-force).
- TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts; здесь ng build exit 0.
- `frontend` полный jest: 1 pre-existing failure в `button.component.spec.ts` — НЕ регрессия (869/870 PASS).
- e00be99 divergence: part-1 лежит на main, перенесён verbatim — disclosed в archive marker.
