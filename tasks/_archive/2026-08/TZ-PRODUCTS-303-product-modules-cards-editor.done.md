# TZ-PRODUCTS-303 — DONE (редактор модулей карточками в диалоге товара)

**Date:** 2026-08-02
**Outcome:** DONE — секция «Модули в составе» в `ProductFormDialogComponent`
(карточки модулей, добавление через существующий `ProductModulePickerDialog`,
удаление, атомарная M:N-синхронизация на submit).
**Layer:** 3 (frontend; backend НЕ изменялся — атомарные endpoints уже готовы).

## Что сделано

- **Секция «Модули в составе»** в диалоге товара: карточка = имя, артикул,
  кол-во материалов, кнопка удаления (×); пустое состояние «Нет модулей в
  составе»; loading/error состояния каталога.
- **«+ Добавить модуль»** — переиспользует `ProductModulePickerDialogComponent`
  с `data: { productId, excludeIds }` (уже привязанные исключены → дубликат
  невозможен; `addModule` дополнительно dedupes).
- **Каталог** загружается один раз через `ProductModulesService.list()`;
  карточки рендерятся из `selectedModuleIds` + `modulesCatalog`
  (`attachedModules` computed). Модуль вне каталога (catalog failed/loading,
  либо выбран через picker) → fallback-карточка «Модуль» — выбор никогда не
  становится невидимым/неудаляемым.
- **Submit-синхронизация — атомарные endpoints** (НЕ bulk PATCH): diff
  `originalModuleIds` (снапшот при открытии) vs `selectedModuleIds` →
  `attachToProduct` для добавленных + `detachFromProduct` для удалённых
  (`forkJoin`). Причина: `UpdateProductDto` (whitelist) НЕ содержит
  `productModuleIds` — bulk PATCH вернул бы 400 (проверено по коду).
- Create-режим: attach после успешного `create` к новому `_id`.
- Ошибки синхронизации модулей не блокируют закрытие диалога (товар уже
  сохранён), показываются toast-ом; без изменений модулей — без лишних вызовов.
- **Спека**: NEW describe «modules (TZ-PRODUCTS-303)» — catalog load/error,
  edit-seed из `productModuleIds` (populated refs и строковые id), add/remove
  dedupe, picker excludeIds, picker close → add, create-attach, edit
  attach+detach diff, no-change no-op, partial-fail close, DOM-рендер карточек,
  DOM empty-state, fallback-карточка.

## Изменённые файлы (3)

| Файл | Δ |
|------|---|
| `frontend/src/app/pages/products/product-form-dialog.component.ts` | секция модулей + syncModules + fallback computed |
| `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` | +14 модульных тестов (34 всего) |
| `docs/pages/products.page.md` | секция «Редактор модулей в диалоге товара» |

## Verification

- jest product-form-dialog: **34/34 PASS**
- jest products/product-module: **42/42 PASS** (3 suites)
- tsc (мой scope): clean — errors только в `people/*` (TZ-WORKERS-302, out of scope)
- ng build: FAIL только на параллельно-сессионных файлах (people.page.ts
  unterminated, index.ts → missing workers.service) — TZ-WORKERS-302 territory
- git diff --check: clean (LF/CRLF warnings only)
- verify-status: **PASS**
- code review (независимый): P0/P1 нет; P2 исправлены — DOM-тесты карточек,
  fallback-карточка для модуля вне каталога (invisible-selection edge)

## Что намеренно НЕ изменялось

- `backend/src/modules/product/*` — атомарные endpoints уже готовы;
- `product-detail.page.ts` — не менялся (работает со своим populated
  `productModuleIds`); общий редактор не выносился — picker переиспользован;
- TZ-PRODUCTS-301/302/304/305, TZ-MODULES-*, TZ-DOC-*;
- `frontend/src/app/shared/services/index.ts` (грязный от параллельной сессии);
- people/*, workers.service (TZ-WORKERS-302 territory);
- package.json / lock-файлы.

## Successors

- **TZ-PRODUCTS-304** — expandable-каталог товаров (клик по строке → модули,
  клик по модулю → страница модуля).
- **TZ-PRODUCTS-303+ (backlog)** — `colorId` FK на ColorReference в Product
  (backend; НЕ в scope 303 dialog-редактора).

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
implementation_commit: fad91fd
verification:
  jest_product_form_dialog: 34/34 PASS
  jest_products_module: 42/42 PASS
  tsc_my_scope: clean
  ng_build: BLOCKED by parallel-session files (TZ-WORKERS-302, out-of-scope)
  git_diff_check: clean
  verify_status: PASS
browser_status: MANUAL_BROWSER_CHECK_REQUIRED
known_limitations:
  - ng build fails only on parallel-session files (people.page.ts / people-form-dialog / missing workers.service) — TZ-WORKERS-302 territory, not touched
  - M:N sync via atomic POST/DELETE /products/:id/modules; bulk productModuleIds PATCH is rejected by DTO whitelist
  - fallback-card for picked modules missing from catalog (catalog load failure)
lock_file: .mimocode/locks/TZ-PRODUCTS-303-product-modules-cards-editor.lock
successors: [TZ-PRODUCTS-304 (expandable catalog)]
```
