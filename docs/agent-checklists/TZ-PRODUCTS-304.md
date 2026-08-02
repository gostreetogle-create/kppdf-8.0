# TZ-PRODUCTS-304 — Checklist (agent verification log)

**Task:** Каталог товаров — expandable-строки с модулями + переход на страницу модуля
**Layer:** 3 (frontend; backend НЕ изменялся — populate уже в `product.service.ts`)
**Date:** 2026-08-02

## Scope

- `frontend/src/app/pages/products/products.page.ts` — expandable-каталог:
  - chevron-кнопка в nameTpl (stopPropagation + `onRowClick`), `expandedId`
    signal (single-expand), `(rowClick)` toggle, `[expandedRow]` TemplateRef.
  - Панель `#expandedTpl`: карточки модулей (имя, артикул, «N материалов»),
    клик → `openModule` → `/modules/:id`; empty state; loading/error.
  - Ленивая загрузка: `ProductModulesService.list(pid)` при ПЕРВОМ раскрытии
    ТОЛЬКО когда в строке строковые id, отсутствующие в cache; page-scoped
    `Map<moduleId, ProductModule>` (не в сервисе); retry при ошибке;
    populated-строки (backend list populate) НЕ фетчатся и не показывают
    loading-флэш.
- `frontend/src/app/pages/products/products.page.spec.ts` — NEW, 11 тестов.
- `docs/pages/products.page.md` — секция «Expandable-каталог с модулями».

## Контракт (зафиксировано по факту кода)

- pi-table НЕ изменён: используется готовый `[expandedRow]` (TemplateRef,
  `$implicit: row`) + `(rowClick)` output; `[expandedRow]="expandedId() ?
  expandedTpl : null"` — свёрнутые строки без пустых `<tr>`.
- `ColumnDef<Product>` требует `key: keyof Product` — отдельная колонка
  'expand' невозможна; chevron встроен в nameTpl (fix после build-error).
- Backend `list()` популирует `productModuleIds` top-level (product.service.ts:72)
  → populated-строки рендерятся без GET; строковые id → lazy `list(pid)`.
- Row-actions (edit/delete) не раскрывают строку (stopPropagation в pi-table);
  routerLink на детальную страницу сохранён (stopPropagation в nameTpl).

## Verification gates

| Gate | Command | Result |
|------|---------|--------|
| jest (page) | `pnpm exec jest --no-coverage --runInBand src/app/pages/products/products.page.spec.ts` | 11/11 PASS |
| jest (products+pi-table) | `--testPathPattern "products\|pi-table"` | 71/71 PASS (4 suites) |
| tsc (scope) | `pnpm exec tsc -p tsconfig.app.json --noEmit` | clean (мой scope; errors только в people/* — TZ-WORKERS-302) |
| ng build | `pnpm exec ng build --configuration=development` | BLOCKED by parallel-session files (people/*, index.ts→workers.service, builder/*) — out of scope |
| diff-check | `git diff --check` | clean |
| verify-status | `bash OrchestratorKit/verify-status.sh` | PASS |

## Browser scenario (manual)

1. «Продукция» → таблица. Клик по строке/chevron раскрывает панель модулей.
2. Повторный клик сворачивает; другая строка — single-expand.
3. Карточки модулей: имя/артикул/N материалов; клик → `/modules/:id`.
4. Товар без модулей → «Нет модулей в составе…».
5. Навигация по имени (routerLink) — на детальную страницу товара.
6. Edit/Delete не раскрывают строку.

**Browser status:** MANUAL_BROWSER_CHECK_REQUIRED (dev-stack not run).

## Executor report (auto) — TZ-PRODUCTS-304
status: DONE
commits: <FEAT_SHA> (feat) + <CLOSEOUT_SHA> (closeout)
gates: products.page jest=11/11; products+pi-table jest=71/71; tsc (scope) clean; ng build FAIL only на TZ-WORKERS-302/TZ-DOC WIP (people.page.ts unterminated + index.ts→workers.service + builder/* — out of scope); git-diff-check=PASS; verify-status=PASS
known: chevron встроен в nameTpl (ColumnDef key требует keyof Product — отдельной колонки нет); lazy-фетч только для строковых id вне cache; populated-строки не фетчатся; retry при ошибке; pi-table НЕ изменён
ask: —
