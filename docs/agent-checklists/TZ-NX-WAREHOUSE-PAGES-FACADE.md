# TZ-NX-WAREHOUSE-PAGES-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-WAREHOUSE-PAGES-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T04:12:39Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (Stream S archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-WAREHOUSE-PAGES-FACADE.md`, depends on S3 archived `0ab7a507`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-WAREHOUSE-PAGES-FACADE.md` на месте

## What changed

Created **three** facades, one per page (matching the TZ's "one per page" instruction), each component-scoped via its own `providers: [...]`:

- **`warehouses.facade.ts`** — list/filter/expand signals
  (`rows`/`status`/`error`/`search`/`filteredRows`/`expandedId`/`items`/
  `itemsLoading`/`itemsError`) + every method (`load`, `onSearch`,
  `toggleExpand`, `onRowSpace`, `loadItems`, `openCreate`, `openEdit`,
  `confirmDelete`, `create`/`update`/`remove`, `makeDefault`) +
  `EXPAND_ITEMS_LIMIT`. `load()` moved from `ngOnInit()` to the facade's own
  constructor (page no longer implements `OnInit` — no `@Input`s on this
  page, so constructor-time load is safe, matching the A3/S1/S2 precedent).
- **`storage-items.facade.ts`** — filter/route-sync signals
  (`warehouseId`/`lowStock`/`materialId`/`materialName`/`expandedId`/
  `warehouses`/`rows` computed/`status`/`error`) + every method
  (`onWarehouseChange`, `onLowStockChange`, `clearMaterialFilter`,
  `toggleExpand`, `onRowSpace`, `openPutOnStock`, `openAdjust`, `load`,
  `applyUpdatedItem`, `loadWarehouses`, `loadMaterialName`). Constructor's
  `queryParamMap` subscribe + `loadWarehouses()` call moved verbatim.
- **`stock-movements.facade.ts`** — filter/route-sync signals
  (`selectedType`/`selectedWarehouse`/`warehouses`/`items`/`status`/
  `error`/`expandedId`) + the `columns: ColumnDef<StockMovement>[]` table
  definition + every method (`onTypeChange`, `onWarehouseChange`, `load`,
  `openIn`/`openOut`, `isRowExpanded` (bound arrow fn), `toggleRow`,
  `itemUnit`/`itemSku`/`toWarehouseName`/`typeLabel`/`formatDate`,
  `openMovement`). `typeLabel`/`formatDate` had to move together with
  `columns` since the column defs' `accessor`/`format` closures call
  `this.formatDate(...)`/`this.typeLabel(...)` — leaving those two on the
  page while `columns` moved to the facade would have broken `this`
  resolution inside the column defs.

All three pages keep only chrome (`toc` = `WAREHOUSE_TOC_CHIPS`, shared
group-workspace TOC — unchanged, still page-level) and trivial
zero-dependency wrapper methods around `@kppdf/data-access` pure exporters
(`storage-items.page.ts`'s `itemName`/`warehouseName`/`itemMaterialId`/
`itemUnit`/`itemSku` — matches the "leave truly presentational, no-DI
helpers on the page" call made in S1/S2). Every template-bound handler on
all three pages is a same-named one-line delegate; every facade-owned
signal/computed/column-def/bound-arrow-fn is a readonly alias. Dialogs
(`warehouse-form-dialog`, `storage-put-on-stock-dialog`,
`storage-adjust-dialog`, `stock-movement-form-dialog`) stay unchanged
in-place, per the TZ's own instruction ("dialogs unchanged behavior" — the
features move is W2's job).

Page sizes: `warehouses.page.ts` 357 → 232 LOC (facade 187),
`storage-items.page.ts` 421 → 292 LOC (facade 176),
`stock-movements.page.ts` 373 → 204 LOC (facade 213).

Checked all three page specs + `storage-dialogs.spec.ts` before editing —
zero direct `fixture.componentInstance` field pokes on the PAGE classes
(the `storage-dialogs.spec.ts` `componentInstance` calls target the
dialog components, which this TZ does not touch) — so, unlike S1, **no
spec changes were needed**.

## Acceptance

- [x] Specs: `warehouses.page.spec.ts`, `storage-items.page.spec.ts`, `stock-movements.page.spec.ts`, `warehouse-form-dialog.component.spec.ts`, `stock-movement-form-dialog.component.spec.ts`, `storage-dialogs.spec.ts` — all green (6/6 suites, 36/36 tests)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no warehouse/stock rule change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface, templates unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no route/behavior change visible to users)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: the 3 page files + 3 new facade files + this checklist/tracker/task marker)
- [x] Coupling map — N/A (StorageItem/StockMovement/Warehouse semantics unchanged)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from S3 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, bundle unchanged (503.38 kB)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `npx jest --config apps/kppdf-web/jest.config.ts warehouses.page.spec.ts storage-items.page.spec.ts stock-movements.page.spec.ts warehouse-form-dialog.component.spec.ts stock-movement-form-dialog.component.spec.ts storage-dialogs.spec.ts` → PASS (6/6 suites, 36/36 tests)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="supply|warehouse"` → PASS (109/109 suites, 751/758 passed, 7 skipped, 0 failed)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; bundle 503.38 kB, unchanged)

## Executor report

Что сделано: механически вынес domain-state и API-методы всех трёх страниц
склада (`WarehousesPage`, `StorageItemsPage`, `StockMovementsPage`) в три
отдельных facade — без изменения складских правил/семантики движений.
Единственная нетривиальность: `columns` таблицы движений тянет за собой
`typeLabel`/`formatDate` (замыкания `this.formatDate(...)` внутри
column-defs) — все три перенесены в facade вместе. Спеки правок не
потребовали — все три page-спеки и `storage-dialogs.spec.ts` DOM-only /
целятся в диалоги, а не в страницы.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет — диалоги намеренно оставлены как есть (перенос в
features — задача W2).

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
