# TZ-NX-WAREHOUSE-TO-FEATURES: warehouse pages → @kppdf/features/warehouse

ARCHIVE_MARKER
outcome: DONE (scoped — see Root cause / Fix)
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (scoped per disclosed rationale)
  - typecheck: PASS (kppdf-web + features)
  - architecture check: PASS (1513 files; baseline 17; 2 resolved since baseline)
  - tests: PASS (features 24/24 suites 247/247; kppdf-web supply|warehouse pattern 107/107 suites, 745/752, 7 skipped, 0 failed)
  - nx build kppdf-web: PASS (last gate, exit 0, bundle unchanged 503.38 kB; confirmed both moved facades lazy-only)
  - checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-TO-FEATURES.md
  - commit: 6b08842a
  - status synchronization: PASS (tracker all-DONE, _NOW.md updated)

## Root cause

The TZ asked to move all three warehouse facades + their dialogs into
`libs/features/src/lib/warehouse/`. Investigation before moving found
`storage-items.facade.ts` transitively needs `MaterialFormDialogComponent`
(734 LOC) via `StoragePutOnStockDialogComponent` — the exact same
cross-domain component that blocked `TZ-NX-SUPPLY-TO-FEATURES`, also
shared by `material-registry-dialog-host.ts` and
`supply-request-form-dialog.component.ts`.

## Fix

Moved the two facades with no such blocker: `WarehousesFacade` +
`WarehouseFormDialogComponent`, and `StockMovementsFacade` +
`StockMovementFormDialogComponent` (lib root + `ui/`), duplicating the
19-line `on-dialog-close-once.ts` helper (established pattern from
doc-studio/production/order-hub/supply). `storage-items.facade.ts` and both
storage dialogs (`storage-put-on-stock-dialog.component.ts`,
`storage-adjust-dialog.component.ts` — the latter clean but kept alongside
to avoid fragmenting their shared `storage-dialogs.spec.ts`) stay in
`apps/kppdf-web`, documented in full with the identical precedent
`TZ-NX-ORDER-HUB-UI-FEATURES` and `TZ-NX-SUPPLY-TO-FEATURES` set.

First `tsc` run after the move caught 2 missed import-path fixes (the
facades' own references to their dialogs, which moved from same-dir to
`ui/`) — fixed and reran clean.

## Files changed

- `warehouses.facade.ts` → `libs/features/src/lib/warehouse/warehouses.facade.ts`
- `stock-movements.facade.ts` → `libs/features/src/lib/warehouse/stock-movements.facade.ts`
- `warehouse-form-dialog.component.ts` (+ spec) → `libs/features/src/lib/warehouse/ui/`
- `stock-movement-form-dialog.component.ts` (+ spec) → `libs/features/src/lib/warehouse/ui/`
- New: `libs/features/src/lib/warehouse/ui/on-dialog-close-once.ts` (duplicate)
- New barrels: `warehouse/index.ts`, `warehouse/ui/index.ts`
- `frontend-nx/tsconfig.base.json` (new `@kppdf/features/warehouse` path)
- `warehouses.page.ts`, `stock-movements.page.ts` (+ specs) — import paths
- `docs/agent-checklists/TZ-NX-WAREHOUSE-TO-FEATURES.md` (new)

## B2 WAVE — COMPLETE (5/5)

| TZ | Commit |
|----|--------|
| TZ-NX-SUPPLY-PAGE-FACADE | 7e68240c |
| TZ-NX-SUPPLY-REQUESTS-FACADE | 4533da8b |
| TZ-NX-SUPPLY-TO-FEATURES | 0ab7a507 |
| TZ-NX-WAREHOUSE-PAGES-FACADE | ea3c4405 |
| TZ-NX-WAREHOUSE-TO-FEATURES | 6b08842a |

## Successor

Block 3 pack (Proposals) — `tasks/_ready/2026-09-14-decomp-b3-proposals/`, not started this session per PO instruction ("не трогай B3").
