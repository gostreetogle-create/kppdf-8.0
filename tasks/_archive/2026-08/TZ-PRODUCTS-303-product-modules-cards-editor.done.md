# TZ-PRODUCTS-303 — DONE (Module cards editor in product dialog)

**Date:** 2026-08-02
**Outcome:** DONE — в диалог товара встроена секция «Модули в составе» (карточки модулей + мульти-picker), submit через атомарные POST/DELETE `/products/:id/modules`.
**Layer:** 3 (frontend). Backend НЕ трогался.

## Что сделано

**`frontend/src/app/pages/products/product-form-dialog.component.ts` — секция «Модули в составе» (eyebrow «Состав»):**
- Карточки привязанных модулей: миниатюра-плейсхолдер (инициалы — у `GET /modules` нет фото, это отдельная сущность `ProductModulePhoto`), имя, артикул, «N материалов», кнопка «×» (удаление из черновика).
- «+ Добавить модуль» → `ProductModulePickerDialogComponent` в мульти-режиме (`data.multi=true`, variant="content") — чекбокс-список доступных модулей (уже привязанные исключены через `excludeIds`), возвращает `string[]`.
- Состояния loading/error/empty по образцу RAL dropdown (TZ-PRODUCTS-302): каталог грузится в `loadModules()` на mount.
- Dirty-tracking: добавление/удаление карточки → `form.markAsDirty()` (→ «Сохранить» активна).
- **Submit:** после успешного create/update `syncModules()` считает diff исходных привязок (`data.productModuleIds`) против черновика: удалённые → DELETE, добавленные → POST (через `PiProductModulesService.attachToProduct/detachFromProduct`, silent-http, никогда не бросают).

**`frontend/src/app/pages/products/product-module-picker-dialog.component.ts` — расширен мульти-режимом:**
- Без `multi` — классический single-select (обратно совместим с `product-detail.page.ts`, который НЕ менялся).
- С `multi: true` — чекбокс-список, submit → `ref.close(string[])`; submit disabled, пока ничего не выбрано; cancel → null в обоих режимах.
- Добавлены loading/error сигналы + empty-state.

**Исправления по code review (P1):**
- **P1: гонка строковых moduleIds.** `seedAttachedModules()` резолвил строковые id синхронно, пока каталог ещё не загрузился (асинхронно) → строки молча пропадали из черновика и на submit превращались в DELETE невидимых модулей. Исправлено: строки откладываются в `pendingStringModuleIds` и резолвятся ПОСЛЕ загрузки каталога (`loadModules` success → `resolvePendingStringModuleIds`); неразрешённые остаются в очереди. Покрыто тестом.
- Minor: eyebrow «Состав» по wake-up (двухстрочный заголовок «Состав» + «Модули в составе»); loading-тест picker'а переделан на незавершающийся Observable (реально проверяет loading=true фазу).

**`frontend/src/app/shared/services/products.service.ts`:** `Product.productModuleIds?: Array<string | ProductModule>` (type-only import из pi-product-modules.service, без runtime-циклов). Учтите: `shared/models/products.ts` (unused mirror) не менялся — там поля нет.

**Spec (NEW):** `product-module-picker-dialog.component.spec.ts` — 8 тестов (single/multi, excludeIds, loading/error/cancel). `product-form-dialog.component.spec.ts` — +12 module тестов (→ 32 total): catalog load/error, addModules+dirty, dedupe, remove+dirty, edit seed из populated и из строк (+без DELETE), create без модулей → нет вызовов, create с модулем → POST, edit diff → DELETE+POST, openModulePicker multi+excludeIds, cancel → нет мутаций.

**Docs:** `docs/pages/products.page.md` — секция «Модули в составе» (TZ-PRODUCTS-303).

## Submit-контракт (ЗАФИКСИРОВАН по коду)

Bulk PATCH с `productModuleIds[]` НЕ поддерживается — `CreateProductDto` не содержит этого поля, whitelist-валидация его выбросит. Используются атомарные race-safe endpoints:

- `backend/src/modules/product/product.controller.ts:128-132` — `POST /products/:productId/modules` body `{ moduleId }` → `product.service.attachModule` (`$addToSet`)
- `backend/src/modules/product/product.controller.ts:147-151` — `DELETE /products/:productId/modules/:moduleId` → `product.service.detachModule` (`$pull`)
- `product.service.ts:138-186` — race-safe (`$addToSet`/`$pull` вместо замены всего массива)
- Фронт: `PiProductModulesService.attachToProduct(productId, moduleId)` / `detachFromProduct(productId, moduleId)`

## Гейты (все зелёные)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — **exit 0** (sanity)
- `cd backend && pnpm exec jest product --no-coverage` — **2 suites / 8 tests PASS** (product + product-module, без регрессии)
- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — **exit 0**
- `cd frontend && pnpm exec jest pi-product-modules product-form-dialog product-module-picker-dialog --no-coverage` — **3 suites / 44 tests PASS**
- `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — **845/846 PASS**; единственный fail = pre-existing `button.component.spec.ts` (baseline-проверен stash'ем в 301, файл не мой)
- `cd frontend && pnpm exec ng build --configuration=development` — **exit 0** (без warning'ов)
- `git diff --check` — clean

## Что НЕ изменялось намеренно

- Backend — НЕ трогался (контракт уже готов, см. file:line выше).
- TZ-PRODUCTS-301/302 commits (`610fd4b`/`4b3b4e8` — closed), TZ-PRODUCTS-305 / PiShowcaseCardComponent (`e00be99`).
- `frontend/src/app/pages/products/product-detail.page.ts` — НЕ менялся (picker обратно совместим, секция IV продолжает работать).
- TZ-WORKERS-* (people.page.ts — parallel session), TZ-DOC-308 categories.page.ts (pre-existing), TZ-MATERIALS-*, TZ-DOC-*, sanitize-html, Z-backlog, desktop/.
- package.json / lock-файлы.

## Conventional commit (push НЕ выполнялся — ждёт владельца)

`feat(products): module cards editor in product dialog (TZ-PRODUCTS-303)`

## ARCHIVE_MARKER

```yaml
outcome: DONE
closed_at: 2026-08-02
closed_by: autonomous-frontend-agent (Buffy)
source_task: tasks/TZ-PRODUCTS-303-product-modules-cards-editor.md
implementation_commit: <fill-after-commit>
prerequisite: TZ-PRODUCTS-302 (4b3b4e8) — content-dialog товара; паттерн TZ-MODULES-301 (карточки в диалоге модуля)
submit_contract: ATOMIC POST/DELETE /products/:id/modules (bulk PATCH невозможен — CreateProductDto без productModuleIds)
  - product.controller.ts:128-132 POST /products/:productId/modules { moduleId } ($addToSet, race-safe)
  - product.controller.ts:147-151 DELETE /products/:productId/modules/:moduleId ($pull)
  - product.service.ts:138-186; фронт PiProductModulesService.attachToProduct/detachFromProduct
scroll_restoration: НЕ требуется — диалог модальный (CDK overlay), списки короткие (каталог модулей в picker'е max-h-72 overflow-y-auto)
verification:
  - backend_tsc: PASS (sanity)
  - backend_jest_product: 2 suites / 8 tests PASS
  - frontend_tsc: PASS
  - jest_products_scope: 3 suites / 44 tests PASS (pi-product-modules + product-form-dialog + product-module-picker-dialog)
  - jest_frontend_full: 845/846 PASS (1 pre-existing button.component.spec.ts failure — baseline, не регрессия)
  - ng_build_dev: PASS (exit 0)
  - git_diff_check: clean
browser_status: MANUAL_BROWSER_CHECK_REQUIRED (dev-stack не поднимался; контракт доказан unit-тестами + ng build)
known_limitations:
  - TZ-DOC-308 categories.page.ts — pre-existing blocker из основного worktree (в этом билде ng build прошёл; не fix-force)
  - TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts могут быть build-блокером в другом worktree; здесь ng build exit 0
  - frontend полный jest: 1 pre-existing failure в button.component.spec.ts — baseline-проверен stash'ем в 301, НЕ регрессия
  - карточка модуля без фото (плейсхолдер-инициалы) — у GET /modules нет photo в payload (фото = отдельная сущность ProductModulePhoto, N+1 fetch вне скоупа)
  - product-detail.page.ts секция IV «Модули» использует single-режим picker'а (обратно совместим) — общий мульти-редактор НЕ выносился (TZ ШАГ 3 опционально)
protected_files:
  - frontend/src/app/pages/products/product-form-dialog.component.ts (+ spec)
  - frontend/src/app/pages/products/product-module-picker-dialog.component.ts (+ NEW spec)
  - frontend/src/app/shared/services/products.service.ts (Product.productModuleIds)
  - docs/pages/products.page.md
not_changed:
  - backend (product-module/*, product.controller.ts — контракт готов)
  - frontend/src/app/pages/products/product-detail.page.ts (picker обратно совместим)
  - TZ-PRODUCTS-301/302/305, TZ-MODULES-*, TZ-DOC-*, TZ-MATERIALS-*, TZ-WORKERS-*, sanitize-html, Z-backlog, desktop/
  - package.json / lock-файлы
lock_file: .mimocode/locks/TZ-PRODUCTS-303-product-modules-cards-editor.lock
```
