# TZ-NX-SHIP-S2-HUB-READ: Orders hub Отгрузка READ

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-08
closed_by: claude
implementation_sha: pending (recorded in follow-up commit)

## Verification

- acceptance criteria: PASS — hub Отгрузка block reads real `GET /shipments?orderId=`,
  honest empty/error states, deep-link carries `?orderId=`.
- typecheck: PASS — `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` exit 0.
- tests: PASS — `nx test kppdf-web` 101 suites / 662 passed, 7 pre-existing skipped, 0 failed.
- nx build: PASS — exit 0, same 2 pre-existing baseline warnings as S0/S1.
- checklist: `docs/agent-checklists/TZ-NX-SHIP-S2-HUB-READ.md` — filled.
- status synchronization: `docs/agent-checklists/WAVE-NX-SHIPPING.md` S2 → DONE.

## Delivered

- `order-hub-tray.component.ts`: `PiShipmentsService.list({orderId})` wired into the
  eager row-expand load (alongside supply/reservations); real summary
  (`activeShipment`/`hasShipment`/`shipmentNumber`/`shipmentDateLabel`/`shipmentHasDocs`,
  cancelled shipments excluded per TZ-SHIP-433 canon) replaces the fake order-status stub.
- Отгрузка block: loading/error/hasShipment («Отгружен: N · date» + «Документ не оформлен»
  when no docs)/honest-empty («Отгрузка не оформлена») states; link now
  `/shipping?orderId=<id>`.
- Docs: `orders.page.md` HUB-304 row + budget line + TZ table.

## Known limits / next

- No live-browser/Playwright pass this step (continuous 4-TZ queue).
- No ship/cancel button in hub this step — S3 adds ship-without-doc; cancel stays
  registry-only (`/shipping`) per PO lock.
