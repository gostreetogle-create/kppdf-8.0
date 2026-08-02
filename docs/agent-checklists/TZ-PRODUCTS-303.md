# TZ-PRODUCTS-303 — Module cards editor in product dialog («Модули в составе»)

> Checklist (конвенция GEMINI.md / AI-AGENT-GUIDE). Создан до финализации, обновлён по результатам.

## Scope

Layer 3 (frontend). Третий в цепочке Products (зависит от TZ-PRODUCTS-302 — большой content-диалог товара).

- `frontend/src/app/pages/products/product-form-dialog.component.ts` — секция «Модули в составе» (eyebrow «Состав»):
  - карточки привязанных модулей (миниатюра-плейсхолдер, имя, артикул, «N материалов», удаление ×);
  - «+ Добавить модуль» → `ProductModulePickerDialogComponent` в мульти-режиме (`data.multi=true`, variant="content") — возвращает `string[]`;
  - loading/error/empty по образцу RAL dropdown (TZ-PRODUCTS-302);
  - dirty-tracking: добавление/удаление → `form.markAsDirty()`;
  - submit: **атомарные POST/DELETE** `/products/:id/modules` (дифф исходных привязок против черновика) — `syncModules()`.
- `frontend/src/app/pages/products/product-module-picker-dialog.component.ts` — расширен мульти-режимом (чекбокс-список, возвращает `string[]`), обратно совместим: без `multi` — классический single-select для `product-detail.page.ts`.
- `frontend/src/app/pages/products/product-module-picker-dialog.component.spec.ts` (NEW, 8 tests).
- `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` (+12 module tests → 32 total).
- `frontend/src/app/shared/services/products.service.ts` — `Product.productModuleIds?: Array<string | ProductModule>` (type-only import).
- `docs/pages/products.page.md` — секция «Модули в составе».

## Dependencies

- TZ-PRODUCTS-302 (content-dialog) — ЗАВЕРШЕН, commit `4b3b4e8`.
- Референсы: TZ-MODULES-301 (карточки-строки в диалоге модуля), TZ-83 Phase D (атомарные attach/detach endpoints).

## Conflict keys

- `frontend/src/app/pages/products/product-form-dialog.component.ts` (+ spec)
- `frontend/src/app/pages/products/product-module-picker-dialog.component.ts` (+ NEW spec)
- `frontend/src/app/pages/products/product-detail.page.ts` (НЕ менялся — picker обратно совместим)
- `frontend/src/app/shared/services/products.service.ts`
- `docs/pages/products.page.md`

## Protected paths

- TZ-PRODUCTS-301/302 commits (`610fd4b` / `4b3b4e8` — closed), TZ-PRODUCTS-305 / PiShowcaseCardComponent (`e00be99`).
- backend `/product-module/*` и `product.controller.ts` — НЕ трогались (контракт уже готов).
- TZ-WORKERS-302 (people.page.ts unterminated-string — parallel session), TZ-DOC-308 categories.page.ts (pre-existing blocker), TZ-MATERIALS-*, TZ-DOC-*, sanitize-html, Z-backlog, desktop/.

## Решения (зафиксированы)

1. **Submit-контракт = атомарные POST/DELETE** (bulk PATCH невозможен: `CreateProductDto` НЕ содержит `productModuleIds` — whitelist-валидация выбросит). Зафиксировано по коду:
   - `backend/src/modules/product/product.controller.ts:128-132` — `POST /products/:productId/modules` body `{ moduleId }` (attach, `$addToSet`, race-safe);
   - `product.controller.ts:147-151` — `DELETE /products/:productId/modules/:moduleId` (detach, `$pull`);
   - фронт: `PiProductModulesService.attachToProduct/detachFromProduct`.
2. **Карточка без фото**: `GET /modules` не возвращает фото (это отдельная сущность `ProductModulePhoto`) → нейтральная миниатюра-плейсхолдер (инициалы имени). Честно, без выдуманного фото.
3. **Гонка строковых ids исправлена**: `seedAttachedModules` откладывает строковые `productModuleIds` в `pendingStringModuleIds` и резолвит их ПОСЛЕ загрузки каталога (`loadModules` success → `resolvePendingStringModuleIds`). Иначе строки молча пропадали из черновика и на submit превращались в DELETE невидимых модулей (found by review).
4. **Дубликат невозможен**: picker исключает `excludeIds` (текущий черновик) + `addModules` дедуплицирует по `_id`.
5. **`Product` интерфейс**: `productModuleIds` добавлен как `Array<string | ProductModule>` (populated/unpopulated), type-only import — без runtime-циклов.

## Acceptance criteria (все выполнены)

1. `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` — exit 0 (sanity, backend не трогался). ✅
2. `cd backend && pnpm exec jest product --no-coverage` — 2 suites / 8 tests PASS (product + product-module, без регрессии). ✅
3. `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — exit 0. ✅
4. `cd frontend && pnpm exec jest pi-product-modules product-form-dialog product-module-picker-dialog --no-coverage` — 3 suites / 44 tests PASS. ✅
5. `cd frontend && pnpm exec jest --no-coverage --runInBand` (полный) — 845/846 PASS; единственный fail = pre-existing `button.component.spec.ts` (baseline-проверен stash'ем в 301, файл не мой). ✅
6. `cd frontend && pnpm exec ng build --configuration=development` — exit 0 (без warning'ов; categories.page.ts blocker отсутствует в этом билде). ✅
7. `git diff --check` — clean. ✅
8. Code review (code-reviewer-deepseek-flash): **P1 — гонка строковых ids** (см. Решения #3) исправлена + тест; minor: eyebrow «Состав» по wake-up, loading-тест picker'а переделан на незавершающийся Observable. ✅

## Тесты (44 в целевом скоупе)

- Picker (8): single-mode select + excludeIds, single submit → string, multi checkboxes → string[], multi no-op без выбора, toggle-off, loading (pending Observable), error, cancel → null.
- Dialog (32 = 20 legacy + 12 modules): catalog load, catalog error, addModules + dirty, dedupe, removeModule + dirty, edit seed из populated, **edit seed из строк + без DELETE на submit**, create без модулей → нет module-вызовов, create с 1 модулем → POST attach, edit diff → DELETE+POST, openModulePicker → multi + excludeIds, cancel после добавления → нет мутаций.

## Browser-сценарий

MANUAL_BROWSER_CHECK_REQUIRED — live authenticated flow не запускался (dev-stack не поднимался); контракт доказан unit-тестами (TestBed + NO_ERRORS_SCHEMA template compile) + ng build.

## Known limitations

- TZ-DOC-308 categories.page.ts — пре-экзистинг blocker из основного worktree; в этом билде ng build прошёл (не fix-force).
- TZ-WORKERS-302 (parallel session) — people.page.ts/workers.service.ts могут быть build-блокером в другом worktree; здесь ng build exit 0.
- `frontend` полный jest: 1 pre-existing failure в `button.component.spec.ts` — НЕ регрессия.
- Карточка модуля без фото (плейсхолдер) — у `GET /modules` нет photo в payload (фото — отдельная сущность).
