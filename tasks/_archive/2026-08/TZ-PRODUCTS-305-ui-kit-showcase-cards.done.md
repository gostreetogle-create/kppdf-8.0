# TZ-PRODUCTS-305 — DONE (Showcase cards sm/md/lg + catalog list/grid toggle)

**Date:** 2026-08-02
**Outcome:** DONE — каталог товаров получил переключение вида list (pi-table) ↔ grid (sm showcase-карточки); переиспользуемый `PiShowcaseCardComponent` (sm/md/lg) перенесён из part-1 `e00be99`.
**Layer:** 3 (frontend). Backend НЕ трогался (endpoint /products готов).

## Что сделано

**`frontend/src/app/shared/ui/card/pi-showcase-card.component.ts` (+ spec, NEW):**
- Перенесён **идентичным контентом** из part-1 `e00be99` (`git show e00be99:... > файл`) — e00be99 лежит на `main`, а не в этой ветке (проверено: `E00BE99_IS_ANCESTOR=NO`). Вербатим-порт → будущий merge 221ae09f → main без конфликтов.
- Три размерных варианта: `sm` (компактная строка: media 40×40 + title/description + слот `sc-actions-sm`), `md` (плитка: header+badge+title+media 16:9+footer), `lg` («журнальная» витрина: eyebrow+badge+title+media+body+related+footer).
- Spec адаптирован под jsdom: `CUSTOM_ELEMENTS_SCHEMA` + `overrideComponent` (lucide-иконки, паттерн card.component.spec) — 9/9 PASS.

**`frontend/src/app/pages/products/products.page.ts` (toggle list ↔ grid, TZ-PRODUCTS-305):**
- `viewMode: signal<'list'|'grid'>` + `setViewMode()`; localStorage persistence `pi-products-view-mode` (паттерн snapSettings из builder: load/save в try/catch, дефолт `list`).
- Кнопки `ListIcon`/`GridIcon` (lucide) в тулбаре: `aria-pressed`, `data-test=view-list-button|view-grid-button`, `role=group aria-label="Вид каталога"`.
- Grid-вид: сетка `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`, каждая ячейка — `<a [routerLink]="['/products', row._id]">` + `app-pi-showcase-card size="sm"`:
  - `eyebrow` — метка вида (Товар/Услуга/Работа, метод `gridEyebrow`);
  - `title` — name; `description` — SKU · подкатегория (`gridDescription`);
  - слот `sc-actions-sm`: `app-pi-avatar` (инициалы по названию — фото это отдельная сущность, в list-payload нет) + badge статуса (`@if (statusLabel(row))` guard, muted для Неактивен/Архив/Черновик через `statusBadgeClass`) + цена (`formatPrice`);
  - loading / empty state (`grid-loading` / `grid-empty`) по образцу pi-table.
- **Критический фикс:** `ng-template`'ы (#nameTpl/#rowActionsTpl/#expandedTpl) **хоустированы из `@if/@else` на корень** — `@ViewChild({ static: true })` не резолвит refs внутри structural-ветки; после хоустинга row-actions/name-ссылки работают в обоих viewMode (иначе edit-button терялся).
- `KIND_LABELS` — модульная константа недоступна из шаблона Angular → метод `gridEyebrow(row)`.

**`frontend/src/app/pages/products/products.page.spec.ts` (+9 тестов к 304-восьми):**
Toggle → grid, карточки (name/инициалы/цена), routerLink href `/products/p1`, localStorage persistence (grid сохраняется + pre-seed рендерит grid + возврат в list), grid empty state, badge скрыт при пустом статусе. localStorage.clear() в beforeEach/afterEach для изоляции.

**Исправления по code review (code-reviewer-deepseek-flash):**
1. Badge статуса — `@if (statusLabel(row))` guard (пустой pill не рендерился);
2. `statusBadgeClass` — общий base-класс + токен цвета (убрано дублирование);
3. Мёртвый `[arrow]="true"` на sm-карточке убран (sm не рендерит arrow — только md/lg);
4. Тест цены/статуса — ассерт на `showcase-price` + badge-hidden-кейс.

**Docs:** `docs/pages/products.page.md` — секция «Карточки-витрины / toggle list ↔ grid (TZ-PRODUCTS-305)» + TZ-строка.

## Решения (зафиксированы)

1. **e00be99 divergence (disclosed):** part-1 лежит на `main` (`e00be9956a280efd6625d449bb63924b092a3649`), НЕ в этой ветке. По инструкции «НЕ переписывай с нуля» компонент перенесён verbatim — идентичный контент = чистый merge. module-detail.page.ts из e00be99 НЕ переносился (TZ-MODULES territory, вне скоупа текущего spec).
2. **Template-refs вне `@if/@else`** — static ViewChild не видит refs в структурных ветках.
3. **localStorage persistence** — паттерн snapSettings (try/catch, дефолт).

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0 (sanity, backend не трогался)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0
- `cd frontend && pnpm exec jest pi-showcase-card products --no-coverage` — 4 suites / 64 tests PASS (в целевом: 25/25)
- `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — 869/870 PASS; единственный fail = pre-existing `button.component.spec.ts` (baseline-проверен stash'ем в 301, файл не мой)
- `cd frontend && pnpm exec ng build --configuration=development` — exit 0 (без warning'ов)
- `git diff --check` — clean
- `bash OrchestratorKit/verify-status.sh` — PASS

## Что НЕ изменялось намеренно

- Backend — НЕ трогался (TZ-305 frontend-only).
- `frontend/src/app/shared/ui/pi-table.component.ts` — НЕ менялся (правило TZ-304).
- `module-detail.page.ts` из e00be99 — НЕ переносился (вне скоупа).
- TZ-PRODUCTS-301..304 (closed), TZ-MODULES-*, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*, sanitize-html, Z-backlog, desktop/, mobile/.
- package.json / lock-файлы.

## Conventional commits

- `feat(products): showcase cards sm/md/lg for catalog (TZ-PRODUCTS-305)`
- `docs(closeout): TZ-PRODUCTS-305 archive + executor report`

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
closed_by: autonomous-frontend-agent (Buffy)
source_task: tasks/TZ-PRODUCTS-305-ui-kit-showcase-cards.md
implementation_commit: <feat-sha>
closeout_commit: <closeout-sha>
prerequisite: TZ-PRODUCTS-304 (84ad25c) — expandable catalog rows
related_archive:
  - tasks/_archive/2026-08/TZ-PRODUCTS-301-color-reference-dictionary.done.md
  - tasks/_archive/2026-08/TZ-PRODUCTS-302-product-form-dialog-rework.done.md
  - tasks/_archive/2026-08/TZ-PRODUCTS-303-product-modules-cards-editor.done.md
  - tasks/_archive/2026-08/TZ-PRODUCTS-304-products-catalog-expandable-modules.done.md
  - part-1: e00be9956a280efd6625d449bb63924b092a3649 (main, ported verbatim)
scope_before: каталог только pi-table; no showcase cards; нет переключения вида
scope_after: toggle list ↔ grid (sm showcase-карточки: инициалы/name/цена/badge статуса), routerLink /products/:id, localStorage persistence; PiShowcaseCardComponent sm/md/lg в shared/ui/card
verification:
  - backend_tsc: PASS (sanity)
  - frontend_tsc: PASS
  - jest_targeted: 4 suites / 64 tests PASS
  - jest_frontend_full: 869/870 PASS (1 pre-existing button.component.spec.ts — baseline, не регрессия)
  - ng_build_dev: PASS (exit 0)
  - git_diff_check: clean
  - verify_status_sh: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack не поднимался; контракт доказан unit-тестами с реальным рендером + ng build)
known_limitations:
  - e00be99 part-1 лежит на main (не в ветке) — компонент перенесён verbatim; disclosed
  - TZ-DOC-308 categories.page.ts — pre-existing blocker (ng build exit 0, не fix-force)
  - TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts; здесь ng build exit 0
  - frontend полный jest: 1 pre-existing failure в button.component.spec.ts — НЕ регрессия
  - sm-карточка без фото — инициалы-аватар (у list-payload нет photo URL, фото = отдельная сущность)
protected_files:
  - frontend/src/app/shared/ui/card/pi-showcase-card.component.ts (NEW, ported from e00be99)
  - frontend/src/app/shared/ui/card/pi-showcase-card.component.spec.ts (NEW)
  - frontend/src/app/shared/ui/card/index.ts
  - frontend/src/app/pages/products/products.page.ts
  - frontend/src/app/pages/products/products.page.spec.ts
  - docs/pages/products.page.md
not_changed:
  - backend (product/* — endpoint /products готов)
  - frontend/src/app/shared/ui/pi-table.component.ts (правило TZ-304)
  - module-detail.page.ts (e00be99 изменение — вне скоупа)
  - TZ-PRODUCTS-301..304, TZ-MODULES-*, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*, sanitize-html, Z-backlog, desktop/, mobile/
  - package.json / lock-файлы
successor: TZ-PRODUCTS.colorId (backend FK migration — NOT created yet); merge 221ae09f → main (PO/merge-agent)
lock_file: .mimocode/locks/TZ-PRODUCTS-305-ui-kit-showcase-cards.lock
```
