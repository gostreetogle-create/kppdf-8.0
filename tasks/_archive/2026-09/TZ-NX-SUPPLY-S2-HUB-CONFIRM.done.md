# TZ-NX-SUPPLY-S2-HUB-CONFIRM

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude

## Verification

- acceptance criteria: PASS — dialog shows per-material need/available/status before confirm; confirm reflects reserve/SupplyRequest results in the API response and UI (toast + summary + warnings + deep-link); `nx build` + tray/dialog tests PASS.
- focused Jest: PASS — `pi-orders.service.spec.ts` (+2 new: `getKitAvailability`/`confirmKitReserve`, 9/9 total), `kit-reserve-confirm-dialog.component.spec.ts` (7/7 new), `order-hub-tray.component.spec.ts` (+3 new: open dialog with current order / reload counters on confirm / disabled with no items, 13/13 total).
- frontend-nx app typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`.
- frontend-nx data-access typecheck: PASS — `cd frontend-nx && pnpm exec tsc -p libs/data-access/tsconfig.lib.json --noEmit`.
- lint: PASS — changed-path ESLint on all new/edited S2 files, 0 errors.
- architecture: PASS — `pnpm architecture:check` (1452 files; baseline 17, 2 resolved) + `pnpm architecture:check:nx` (394 files, 0 violations).
- full suite: PASS — `nx test data-access` 21/21 suites, 105/105 tests; `nx test kppdf-web` — only pre-existing known `app-shell.component.spec.ts` failures remain (N/A, unrelated to S2, present before this TZ).
- final gate: PASS — `cd frontend-nx && pnpm exec nx build kppdf-web` (only pre-existing known warnings: Studio NG8102, Gantt CSS budget).

## Delivered

- `PiOrdersService` (`libs/data-access/src/lib/sales/pi-orders.service.ts`) gained `getKitAvailability(orderId, orderItemIndex)` (`GET /orders/:id/items/:itemIndex/kit-availability`) and `confirmKitReserve(orderId, orderItemIndex)` (`POST /orders/:id/items/:itemIndex/kit-reserve`) — same home as the existing `patchEstimateDays`/`patchEstimateStart`/`patchEstimateWorker` sub-resource methods (S0's endpoints live on `OrderController`, not a separate supply client). New types `KitAvailability`/`KitAvailabilityLine`/`KitReserveResult` in `order.types.ts` mirror the backend `KitReserveService` response shapes exactly.
- New `KitReserveConfirmDialogComponent` (`frontend-nx/apps/kppdf-web/src/app/pages/orders/kit-reserve-confirm-dialog.component.ts` + spec): defaults to order item 0, shows a line-picker `<select>` only for multi-item orders (reloads availability on change); lists each material's need/available/status; a summary banner (all-ok vs soft-shortage copy); Confirm action; on success shows a status banner + toast, reserved count, created-SupplyRequest id list, warnings, and an "Открыть снабжение" deep-link to `/supply?orderId=` (only when a SupplyRequest was actually created).
- `order-hub-tray.component.ts` — added a «Подтвердить материалы» button in the existing «Снабжение» block (disabled when the order has no items), opening the dialog via `PiDialogService` (same convention as `storage-items.page.ts`'s `openAdjust`/`openPutOnStock`); on close with a truthy result, reloads the tray's supply + reservation counters so the hub reflects the new reserve/SupplyRequest without a page refresh.
- `docs/pages/orders.page.md` — new § "TZ-NX-SUPPLY-S2" documenting this as the one deliberate write exception to the hub tray's otherwise read-only contract.
- `docs/pages/supply.page.md` — cross-reference note: S2 is the entry point that creates `SupplyRequest` rows (separate entity from S1's `SupplyTask` registry); NX still has no `SupplyRequest` list view (documented gap, matches legacy).
- `docs/agent-checklists/WAVE-NX-SUPPLY.md` / `_NOW.md` — wave marked fully closed (S0+S1+S2 all DONE).

## Scope disclosure

- No desk dual-write, warehouse movement create, or Gantt start auto-call touched (explicit TZ prohibition).
- No OUT stock movement is written or promised — matches S0's own declared successor-work scope.
- `SupplyRequest` list/detail UI on `/supply` itself is still not implemented in NX — out of S2's scope (deep-link only); a future TZ would need to add it if the hub's created requests should be browsable as a registry.

## Commit

- see git log
