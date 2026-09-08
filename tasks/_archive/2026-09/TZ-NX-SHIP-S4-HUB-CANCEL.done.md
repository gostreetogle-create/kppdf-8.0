# TZ-NX-SHIP-S4-HUB-CANCEL: отмена отгрузки из hub до dispatch

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
implementation_sha: 0bb8e0b8

## Verification

- acceptance criteria: PASS — operator can cancel a mistaken ship from the hub before
  dispatch without opening `/shipping`; button disappears after dispatch (or delivered).
- typecheck: PASS — `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` exit 0.
- tests: PASS — `nx test kppdf-web` 102 suites / 675 passed, 7 pre-existing skipped, 0 failed.
- nx build: PASS — exit 0, same 2 pre-existing baseline warnings as S0–S3.
- checklist: `docs/agent-checklists/TZ-NX-SHIP-S4-HUB-CANCEL.md` — filled.
- status synchronization: `WAVE-NX-SHIPPING.md` S0–S4 all DONE; `_NOW.md` Claude → IDLE.

## Delivered

- `order-hub-tray.component.ts`: `shipmentCancellable()` (TZ-SHIP-433 gate:
  draft/scheduled + no dispatchedAt) + `cancelActiveShipment()` (destructive confirm →
  `PiShipmentsService.cancelShipment` → reload); «Отменить отгрузку»
  (`order-cancel-shipment-button`) in the hasShipment() branch.
- Docs: `orders.page.md` HUB-304 row + TZ table.

## WAVE-NX-SHIPPING closeout

S0 (`d1e0a04b`) → S1 (`d027275c`) → S2 (`ae22acff`) → S3 (`cfd5292c`) → S4 (this commit).
All four TZs plus this follow-up DONE; wave fully closed.

## Known limits / next

- No live-browser/Playwright pass (continuous queue, same rationale as S1–S3).
- Registry cancel on `/shipping` (S1) is unchanged — same BE endpoint, now reachable from
  two UI entry points.
