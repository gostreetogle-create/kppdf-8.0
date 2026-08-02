# TZ-PRODUCTS-303 — Checklist (agent verification log)

**Task:** Товар — привязка модулей карточками в диалоге (паттерн TZ-MODULES-301)
**Layer:** 3 (frontend; backend НЕ изменялся — атомарные endpoints уже в `product.controller.ts`)
**Date:** 2026-08-02

## Scope

- `frontend/src/app/pages/products/product-form-dialog.component.ts` — секция
  «Модули в составе»: карточки привязанных модулей (имя, артикул, кол-во
  материалов) + «+ Добавить модуль» (переиспользует
  `ProductModulePickerDialogComponent` с `excludeIds`) + удаление (×).
- Submit-синхронизация через атомарные `POST/DELETE /products/:id/modules`
  (diff снапшота при открытии vs финальный выбор: attach добавленных +
  detach удалённых). Не bulk PATCH — `UpdateProductDto` (whitelist) НЕ
  содержит `productModuleIds` (проверено в коде, иначе 400).
- `frontend/src/app/pages/products/product-form-dialog.component.spec.ts` —
  NEW describe «modules (TZ-PRODUCTS-303)».
- `docs/pages/products.page.md` — секция про редактор модулей.

## Контракт (зафиксировано по факту кода)

- Backend: `POST /products/:productId/modules {moduleId}` → `$addToSet`;
  `DELETE /products/:productId/modules/:moduleId` → `$pull`; race-safe.
- `ProductModulesService.attachToProduct` / `detachFromProduct` (frontend).
- Каталог: `ProductModulesService.list()` (все модули); карточки рендерятся из
  `selectedModuleIds` + `modulesCatalog` (`attachedModules` computed). Модуль
  вне каталога (catalog failed/loading) → fallback-карточка, НЕ невидимый.
- Duplicate невозможен: `excludeIds` в picker + dedupe в `addModule`.
- Ошибки синхронизации модулей не блокируют закрытие (товар уже сохранён),
  но показываются toast-ом.

## Verification gates

| Gate | Command | Result |
|------|---------|--------|
| jest (dialog) | `pnpm exec jest --no-coverage --runInBand src/app/pages/products/product-form-dialog.component.spec.ts` | 34/34 PASS |
| jest (products) | `--testPathPattern "products\|product-module"` | 42/42 PASS (3 suites) |
| tsc (scope) | `pnpm exec tsc -p tsconfig.app.json --noEmit` | clean (мой scope; errors только в people/* — TZ-WORKERS-302) |
| ng build | `pnpm exec ng build --configuration=development` | BLOCKED by parallel-session files (people/*, index.ts → workers.service) — out of scope |
| diff-check | `git diff --check` | clean (LF/CRLF warnings only) |
| verify-status | `bash OrchestratorKit/verify-status.sh` | PASS |

## Browser scenario (manual)

1. «Продукция» → «Создать» → секция «Модули в составе» с кнопкой «+ Добавить модуль».
2. Добавить модуль → карточка (имя, артикул, N материалов); повторное добавление
   того же модуля невозможно (исключён из выбора).
3. Удалить модуль (×) → карточка исчезает.
4. Submit → POST create + атомарные attach; в каталоге/детальной странице модуль
   виден. Edit → attach добавленных + detach удалённых.
5. Ошибка синхронизации → toast, диалог закрывается (товар сохранён).

**Browser status:** MANUAL_BROWSER_CHECK_REQUIRED (dev-stack not run).

## Executor report (auto) — TZ-PRODUCTS-303
status: DONE
commits: fad91fd8c9db4be9012049da336508aa91a4aa94 (feat) + 592b3955efdccae79e4f43fc0709b229663691ab (closeout)
gates: product-form-dialog jest=34/34; products jest=42/42; tsc (scope) clean; ng build FAIL only на TZ-WORKERS-302 WIP (people.page.ts unterminated + index.ts→workers.service — out of scope); git-diff-check=PASS; verify-status=PASS
known: M:N sync через атомарные POST/DELETE /products/:id/modules (bulk productModuleIds PATCH → 400, DTO whitelist); fallback-карточка для модулей вне каталога; ralCode colorId SUCCESSOR — TZ-PRODUCTS-303 backend не трогал
ask: —
