# TZ-NX-WAREHOUSE-PAGES-FACADE: warehouses + storage-items + stock-movements facades

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (2/2)
  - typecheck: PASS
  - tests: PASS (6 AC specs, 6/6 suites, 36/36 tests; kppdf-web supply|warehouse pattern 109/109 suites, 751/758, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB)
  - checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-PAGES-FACADE.md
  - commit: ea3c4405
  - status synchronization: PASS (tracker updated)

## Root cause

Three warehouse list pages (`warehouses.page.ts` ~357 LOC,
`storage-items.page.ts` ~421 LOC, `stock-movements.page.ts` ~373 LOC) each
owned all list/filter/expand/route-sync state and API orchestration
directly on the component — active BE stock integration, foundation-only
wave per the pack's elevated priority.

## Fix

Mechanical extract, no behavior change: created one facade per page
(`WarehousesFacade`, `StorageItemsFacade`, `StockMovementsFacade`,
each `@Injectable()` + component-scoped), holding every signal, computed,
and method verbatim. `stock-movements`' table `columns` def moved together
with `typeLabel`/`formatDate` since the column accessor/format closures
call `this.formatDate(...)`/`this.typeLabel(...)` — splitting them across
page and facade would have broken `this` resolution. Dialogs stayed
in-place per the TZ's own instruction (their features-lib move is W2).
No spec changes needed — all three page specs plus `storage-dialogs.spec.ts`
are DOM-driven or target the (untouched) dialog components.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.page.ts` (357 → 232 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/warehouses.facade.ts` (new, 187 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.page.ts` (421 → 292 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/storage-items.facade.ts` (new, 176 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.ts` (373 → 204 LOC)
- `frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.facade.ts` (new, 213 LOC)
- `docs/agent-checklists/TZ-NX-WAREHOUSE-PAGES-FACADE.md` (new)

## Successor

`TZ-NX-WAREHOUSE-TO-FEATURES` (W2, final TZ of the DECOMP-B2 wave).
