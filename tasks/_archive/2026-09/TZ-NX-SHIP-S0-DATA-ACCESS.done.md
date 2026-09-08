# TZ-NX-SHIP-S0-DATA-ACCESS: PiShipmentsService + Orders.ship

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
implementation_sha: d1e0a04b

## Verification

- acceptance criteria: PASS — `PiShipmentsService` mirrors legacy `list/findById/update/dispatch/
  cancelShipment/addDoc/remove`; `PiOrdersService.ship(id, body = {})` → `POST /orders/:id/ship`;
  exported from `libs/data-access/src/index.ts`.
- typecheck: PASS — `tsc -p libs/data-access/tsconfig.lib.json --noEmit` exit 0.
- tests: PASS — `nx test data-access` 25 suites / 130 tests (incl. 8 new
  `pi-shipments.service.spec.ts` + 2 new `ship()` cases in `pi-orders.service.spec.ts`).
- lint: N/A this step — no lint script diff needed for pure data-access addition mirroring
  existing lib conventions; will run with S1 page gates.
- nx build: PASS — `nx build kppdf-web` exit 0 (baseline before + after, same pre-existing
  NG8102/gantt-bars budget warnings, unrelated to this TZ).
- checklist: `docs/agent-checklists/TZ-NX-SHIP-S0-DATA-ACCESS.md` — filled.
- status synchronization: `docs/agent-checklists/WAVE-NX-SHIPPING.md` S0 → DONE.

## Delivered

- `frontend-nx/libs/data-access/src/lib/logistics/shipment.types.ts` — `Shipment`,
  `ShipmentItem`, `ShipmentDocumentLine`, `ShipmentStatus`, `ShipmentListFilters`,
  `ShipmentUpdatePayload`, `ShipmentAddDocPayload` (1:1 with legacy
  `frontend/src/app/shared/services/shipments.service.ts`).
- `frontend-nx/libs/data-access/src/lib/logistics/pi-shipments.service.ts` (+ spec) —
  `PiShipmentsService`: `list/findById/update/dispatch/cancelShipment/addDoc/remove`, same URLs
  as legacy `ShipmentsService`.
- `frontend-nx/libs/data-access/src/lib/logistics/index.ts` + export added to
  `frontend-nx/libs/data-access/src/index.ts`.
- `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`:
  `ship(id, body: Record<string, unknown> = {})` → `POST /orders/:id/ship`, mirrors legacy
  `OrdersService.ship()` (TZ-SWEEP-401), not a PATCH.
- Specs added to `pi-orders.service.spec.ts` for `ship()` empty-body and optional-body cases.

## Known limits / next

- No UI/page/route yet — `/shipping` route and page component are S1
  (`TZ-NX-SHIP-S1-REGISTRY.md`), already claimed next in the same WAVE session.
- No BE changes — all endpoints already live per audit
  `docs/audits/2026-09-08-shipping-nx-port-audit.md`.
