# TZ-NX-ORDER-WS-LOGISTICS — DONE

- **Status:** DONE
- **Agent:** claude
- **Closed:** 2026-09-15

## Delivered

- New dumb `OrderWsLogisticsComponent`: Склад (reservation counters by `order.number`) + Отгрузка (active-shipment summary or ship/cancel actions, ported verbatim from `order-hub.facade.ts`).
- `OrderWorkspaceFacade` extended: `reservationLoading`/`reservationError`/`reservationCounters`, `shipmentsLoading`/`shipmentsError`/`shipments` signals; `loadReservations()`, `loadShipments()`, `activeShipment()`, `hasShipment()`, `shipmentNumber()`/`shipmentDateLabel()`/`shipmentHasDocs()`, `shipmentCancellable()`, `cancelActiveShipment()`, `canMarkShipped()`, `openShipConfirm()`.
- `docs/pages/orders.page.md`: TZ5-landed note.

## Scope guard

- No second write-path — reuses `PiOrdersService.ship()` and `PiShipmentsService.cancelShipment()` exactly as `order-hub.facade.ts` does.
- No TTN/driver fake fields; no per-line ship (badge explicitly says whole-order).

## Gates

- `nx test kppdf-web`: PASS, `order-detail.page.spec.ts` 24/24 (20 prior + 4 new, all passed first attempt). Same 2 unrelated pre-existing `app-shell.component.spec.ts` failures as every TZ this session.
- `nx test data-access` / `nx test features`: PASS.
- `nx lint`: baseline FAIL (pre-existing); zero new issues.
- Final `nx build kppdf-web`: PASS.

Successor: `TZ-NX-ORDER-WS-DOCS-CHIPS` (final TZ in the chain — WAVE STOP after).

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS
  - lint: BASELINE FAIL (pre-existing)
  - checklist: ADDED
  - progress.md: N/A (feature build, reuses existing backend endpoints)
  - status synchronization: PASS
