# NX UX smell audit — `/stock-movements`

**TZ:** `TZ-NX-UX-10-stock-movements-AUDIT` · **Wave:** `WAVE-NX-UX-PAGE-SWEEP` row 10
**Canon:** `docs/audits/2026-09-09-nx-ux-page-sweep-canon.md`
**Gold reference:** `/registries` (expand + `pi-button`); already-fixed `/orders`, `/shipping`,
`/supply`, `/supply-requests`, `/warehouses`, `/storage-items` (same wave, same anti-patterns)
**Page source (conflict keys):** `stock-movements.page.ts` (now ~360 lines after fix),
`stock-movement-form-dialog.component.ts` (364).
**Route:** `/stock-movements`.

## Что это за страница

`StockMovementsPage` — "Движения": read-only journal of приходы/расходы/корректировки/перемещения
per `<app-pi-table>` (the same shared Paper & Ink primitive `/registries` itself uses — this page
is architecturally closer to gold than the hand-rolled `<div role="table">` grids on
`/shipping`/`/supply`/`/storage-items`, since `[expandedRow]`/`[expandedRowWhen]`/`(rowClick)` are
already first-class inputs on `TableComponent`, just unused here before this fix). Only «Приход»/
«Расход» are user-createable from this page (via `StockMovementFormDialogComponent`); «Корректировка»
and «Перемещение» rows exist for viewing only (created elsewhere — adjust dialog on
`/storage-items`, a transfer flow out of this wave's scope), which the type-filter's
«Перемещение (просмотр)» label already documents honestly.

## Чеклист T1–C1

| # | Зона | Вердикт | Факт · path:line |
|---|------|---------|-------------------|
| **T1** | **Таблица: часть данных нигде не видна** | **FAIL — P1** | `stock-movements.page.ts` columns (pre-fix, 6: date/type/target/warehouse/qty/documentRef) never surfaced `zoneName`, `toWarehouseId`/`toWarehouse`/`toZoneName` (`stock-movement.types.ts:20-25` — meaningful specifically for `type: 'transfer'` rows, which this page's own filter explicitly lists), `sku`/`unit` on the populated material/product ref (same gap class as `/storage-items`'s T1), and `orderId` whenever `documentRef` was *also* set (`stockMovementDocument()` silently drops `orderId` in that case, `stock-movement.types.ts:77-79`) |
| T2 | Таблица: пустые/сдвинутые колонки; нет loading/empty/error | **OK** | `app-pi-table`'s own `[loading]` skeleton + honest `emptyMessage` («Нет движений. Проведите приход или расход.») + `app-pi-status-banner` error+retry (`:113-121`) |
| A1 | Действия: `<a class="underline">` / мёртвый `pi-button-*` вместо `app-pi-button` | **OK** | Toolbar «+ Приход»/«+ Расход» and dialog footer both already `<app-pi-button>` |
| A2 | Destructive без confirm | **OK / N/A** | No delete/edit on movements — an append-only ledger by design, consistent with `/storage-items`' "adjust ≠ delete" precedent |
| F1 | Фильтры: поле без `label` / голый native select | **OK** | Both type and warehouse filters have `<label class="sr-only" for>` |
| F2 | Фильтры: нет сброса чипа deep-link | **OK / N/A** | No deep-link query param drives these filters from another page (unlike `/storage-items`'s `materialId`) — both selects already have their own "Все …" reset option as the first item, no separate chip needed |
| D1 | Dropdown: не Pi/канон; ObjectId руками | **OK** | Selects show `name`, never a raw ObjectId; dialog's material/product selects likewise |
| L1 | Layout: контент липнет к рамке | **OK** | `px-panel-inset py-6`, `gap-2`/`gap-3` |
| L2 | Layout: прыгающие ошибки валидации | **OK** | Dialog renders one static error paragraph below the form, non-jumping |
| C1 | Copy: EN в UI; мёртвые кнопки; stub «скоро» | **OK** | All copy RU; every button wired; empty state honest |

## Что уже ок (не чинить)

- Already built on `TableComponent` (the same primitive `/registries` uses) rather than a
  hand-rolled grid — this made the T1 fix a matter of wiring existing `[expandedRow]` inputs, not
  hand-building the click/Enter/Space/`aria-expanded` machinery from scratch like the other pages
  this wave.
- A1/F1/D1/L1/L2/C1 all clean before this audit even started — best-behaved page of the wave on
  those axes.
- The «Перемещение (просмотр)» filter label is a deliberate, already-honest signal that transfer
  rows are view-only here — not a smell, a good precedent other read-only filters could follow.
- `StockMovementFormDialogComponent` uses `app-pi-form-field`/`app-pi-input` throughout — no
  hand-rolled `<label>`+`<input>` pairs, cleaner than several dialogs fixed earlier this wave.

## Verdict

**PASS-FIX** — found 1×P1 (T1: `zoneName`/`toWarehouse`+`toZoneName`/`sku`+`unit`/`orderId`
invisible or silently dropped). FIX TZ (`TZ-NX-UX-10-stock-movements-FIX`) — **claim**: wire
`TableComponent`'s existing `[expandedRow]`/`[expandedRowWhen]`/`(rowClick)` inputs (no new
component needed, unlike the hand-rolled expand pattern on prior pages).

## Closeout (FIX applied)

- **P1 (T1) — fixed.** Added `stockMovementUnit`/`stockMovementSku`/`stockMovementToWarehouseName`
  helpers to `stock-movement.types.ts` (same product-then-material fallback shape as
  `stockMovementTargetName`). Wired `<app-pi-table>`'s built-in `[expandedRow]`/
  `[expandedRowWhen]`/`(rowClick)` — a local `expandedId` signal toggles per-row, same UX as the
  hand-rolled expand on sibling pages but using the primitive's own mechanism (`ng-template
  #detailTpl`, referenced directly per the `forms.page.ts` §IV precedent, no `ViewChild`
  needed). Expand panel shows Зона / Единица / Артикул always, plus Склад назначения / Зона
  назначения conditionally (only when `toWarehouseId` is present — i.e. transfer rows), and ID
  заказа always (so it's visible even when `documentRef` also exists).
  `expandedId` resets on `load()`.
- **Specs added:** `stock-movements.page.spec.ts` — expand shows unit/sku/order and collapses on
  second click; a transfer row's expand shows destination warehouse/zone.
  Existing 3 specs unmodified and still pass (no selector/behavior changes to sort/filter/create
  flows).
- Gates: `nx build kppdf-web` PASS; `nx test kppdf-web` PASS, 0 regressions (692/699, +2 new).
- `docs/pages/stock-movements.page.md` — NX UX note added.
