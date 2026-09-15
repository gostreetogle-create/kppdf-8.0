# TZ-NX-ORDER-WS-LOGISTICS checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-ORDER-WS-LOGISTICS.md` (removed on closeout)

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-15T16:27:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI in this environment)

## Preflight

- [x] `_active/` пуст перед claim
- [x] `order-hub.facade.ts` full read (reservations/shipments/ship/cancel-shipment logic — ported verbatim)

## Acceptance (из TZ)

- [x] Секция Логистика: Склад (reservation counters by `order.number`, `/storage-items` link, no cells) + Отгрузка (active shipment summary, «Отгружено» reuse ShipConfirmDialog, «Отменить отгрузку» gate as hub, `/shipping?orderId=`) + badge «Отгрузка целым заказом»
- [x] Facade reuses order-hub's ship/cancel services (no second write-path — `PiOrdersService.ship()`, `PiShipmentsService.cancelShipment()`, same dialogs)
- [x] Specs ship/cancel/disabled states (4 new tests)
- [x] `nx build kppdf-web` LAST PASS

## Gates (факт)

- `nx test kppdf-web` (571 total, was 567, +4 new) — **PASS**, `order-detail.page.spec.ts` all 24 tests, first attempt (no rework needed this time — the TZ4 mock-reset lesson was applied proactively). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` / `nx test features` — PASS.
- `nx lint kppdf-web` + `nx lint features` — baseline FAIL (pre-existing); zero new issues (relative imports for both reused dialogs from the start, no reactive fix needed).
- `nx build kppdf-web` — **PASS**, exit 0 on first attempt.

## Executor report

- Read `order-hub.facade.ts` in full before writing anything — ported the reservations/shipments loading, `activeShipment()`/`hasShipment()`/`shipmentCancellable()`/`canMarkShipped()` gates, and the ship/cancel-shipment dialog flows **verbatim** (same APIs, same TZ-SHIP-433 gate logic, same RU copy) rather than re-deriving them, per the TZ's explicit "reuse... no second write-path".
- Confirmed the `order.number` (not `_id`) key for `PiReservationsService.list()` directly from the source, then locked it with a dedicated test asserting the exact call args.
- `ShipConfirmDialogComponent` imported via a relative path (`../order-hub/ui/ship-confirm-dialog.component`) from the start — same intra-project boundary rule TZ3/TZ4 already established, applied proactively instead of reactively this time.
- Added `success`/`ship`/reservations/shipments mocks to the spec's shared fixtures, extending the same 4-block pattern used throughout this wave; used the by-now-established "reconfigure the mock after `setup()`, call the real facade reload method" technique (from TZ4's lesson) for the counters/shipment-state tests, so all 4 new tests exercise real data flow, not shortcuts.
- Component text/data-test attributes mirror `order-hub-tray.component.ts`'s reference markup closely (Отгружен:/Документ не оформлен/Отменить отгрузку/Отгружено/Отгрузка не оформлена) for consistency with the existing hub, plus an explicit «целым заказом» hint per AC.

## Closeout

- [x] archive + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15T16:33:21Z

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing, zero new issues)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
