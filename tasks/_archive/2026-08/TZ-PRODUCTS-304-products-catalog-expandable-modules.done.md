# TZ-PRODUCTS-304 — DONE (expandable-каталог товаров с модулями)

**Date:** 2026-08-02
**Outcome:** DONE — каталог товаров получил expandable-строки: клик по строке
(или chevron) раскрывает панель привязанных модулей, клик по модулю ведёт на
страницу модуля. Ленивая загрузка модулей при первом раскрытии, page-scoped
cache, single-expand UX.
**Layer:** 3 (frontend; backend НЕ изменялся — populate уже в `product.service.ts`).

## Что сделано

- **Expandable-строки** в `products.page.ts`: `expandedId = signal<string | null>`
  (single-expand), `onRowClick` toggle, `(rowClick)` pi-table output.
- **Chevron** встроен в nameTpl (stopPropagation → без двойного toggle; отдельная
  колонка невозможна — `ColumnDef<Product>` требует `key: keyof Product`).
  routerLink на детальную страницу товара сохранён в той же ячейке.
- **Панель `#expandedTpl`** (`[expandedRow]="expandedId() ? expandedTpl : null"`):
  карточки модулей (имя, артикул, «N материалов»), `@let mods` — однократный
  вызов `expandedModules(row)`; empty state; loading/error.
- **Ленивая загрузка**: `ProductModulesService.list(pid)` при первом раскрытии
  ТОЛЬКО когда в строке строковые id, отсутствующие в cache; populated-строки
  (backend list populate, product.service.ts:72) рендерятся без GET и без
  loading-флэша; `loadedModuleProducts` guard — без повторных GET; при ошибке
  product снимается с guard (retry); `Map<moduleId, ProductModule>` локально в
  page, НЕ в сервисе.
- **`openModule`** → `router.navigate(['/modules', m._id])`.
- **Спека**: NEW `products.page.spec.ts`, 11 тестов (initial GET, collapsed start,
  toggle, single-expand, populated-refs render без fetch, lazy fetch, no-fetch
  for empty, error+retry, navigate, row-actions не раскрывают).

## Изменённые файлы (3)

| Файл | Δ |
|------|---|
| `frontend/src/app/pages/products/products.page.ts` | expandable-каталог + lazy module load |
| `frontend/src/app/pages/products/products.page.spec.ts` | NEW, 11 тестов |
| `docs/pages/products.page.md` | секция «Expandable-каталог с модулями» |

## Verification

- jest products.page: **11/11 PASS**
- jest products+pi-table: **71/71 PASS** (4 suites)
- tsc (мой scope): clean — errors только в `people/*` (TZ-WORKERS-302, out of scope)
- ng build: FAIL только на параллельно-сессионных файлах (people/*, index.ts →
  workers.service, builder/*) — TZ-WORKERS-302/TZ-DOC territory
- git diff --check: clean
- verify-status: **PASS**
- code review (независимый): P2 исправлены — (1) populated-строки больше НЕ
  фетчатся и не показывают loading-флэш; (2) retry при ошибке fetch;
  (3) спека покрывает populated-expand-path и error+retry; (4) `@let mods`
  вместо многократного вызова `expandedModules(row)`; (5) filter-предикат
  упрощён; (6) collapse очищает loading/error (без bleed между строками).

## Что намеренно НЕ изменялось

- `frontend/src/app/shared/ui/pi-table.component.ts` — готовый `expandedRow`/
  `rowClick` переиспользован как есть;
- `backend/src/modules/product/*` — populate уже готов;
- TZ-PRODUCTS-301/302/303/305, TZ-MODULES-*, TZ-DOC-*;
- `frontend/src/app/shared/services/index.ts` (грязный от параллельной сессии);
- people/*, workers.service (TZ-WORKERS-302 territory);
- package.json / lock-файлы.

## Successors

- **TZ-PRODUCTS-305** — UI Kit карточки-витрины sm/md/lg (showcase cards).
- **TZ-PRODUCTS.colorId** — backend FK на ColorReference (НЕ создан, deferred).

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
implementation_commit: 2dc09f2
verification:
  jest_products_page: 11/11 PASS
  jest_products_pi_table: 71/71 PASS
  tsc_my_scope: clean
  ng_build: BLOCKED by parallel-session files (TZ-WORKERS-302/TZ-DOC, out-of-scope)
  git_diff_check: clean
  verify_status: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED
known_limitations:
  - ng build fails only on parallel-session files (people.page.ts / people-form-dialog / missing workers.service / builder-*) — out of scope, not touched
  - chevron embedded in nameTpl (ColumnDef key requires keyof Product — no separate expand column)
  - lazy module fetch only for string ids missing from cache; populated rows render without GET
related_archive:
  - tasks/_archive/2026-08/TZ-PRODUCTS-303-product-modules-cards-editor.done.md
  - tasks/_archive/2026-08/TZ-PRODUCTS-302-product-form-dialog-rework.done.md
  - tasks/_archive/2026-08/TZ-PRODUCTS-301-color-reference-dictionary.done.md
lock_file: .mimocode/locks/TZ-PRODUCTS-304-products-catalog-expandable-modules.lock
successors: [TZ-PRODUCTS-305 (showcase cards), TZ-PRODUCTS.colorId (backend FK, NOT created)]
```
