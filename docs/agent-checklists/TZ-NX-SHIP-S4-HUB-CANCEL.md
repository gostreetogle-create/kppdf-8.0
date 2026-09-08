# TZ-NX-SHIP-S4-HUB-CANCEL checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIP-S4-HUB-CANCEL.md` (removed at closeout)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T04:04:15Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (`_active/` пуст)
- [x] TZ / канон / deps прочитаны (S0–S3 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIP-S4-HUB-CANCEL.md` на месте

### Preflight Check Output
- **Context read:** `TZ-NX-SHIP-S4-HUB-CANCEL.md`; own S1–S3 work this session (`order-hub-tray.component.ts` current state: `activeShipment/hasShipment/shipmentNumber/shipmentDateLabel/shipmentHasDocs/canMarkShipped/openShipConfirm`); `PiShipmentsService.cancelShipment` (S0); legacy tray `shipmentCancellable()` gate (`draft`/`scheduled` + no `dispatchedAt`); shipping.page.ts registry cancel (S1, `AlertDialogComponent` confirm pattern already used for `cancelShipment` on `/shipping`)
- **Key Constraints:** cancel only `draft`/`scheduled` without `dispatchedAt`; confirm dialog (destructive); after dispatch — no button, BE error stays authoritative if ever hit; reload S2 summary + orders (order reverts to `ready` per TZ-SHIP-433); registry cancel (S1) untouched
- **Planned Deliverable:** `order-cancel-shipment-button` in hub tray Отгрузка block, gated by `shipmentCancellable()`, confirm via existing `AlertDialogComponent` pattern → `PiShipmentsService.cancelShipment` → reload
- **Validation Path:** tray specs (visible only when allowed; POST cancel; hidden after dispatch); `nx build kppdf-web`

## Acceptance

- [x] Operator undoes mistaken ship from hub before dispatch without opening `/shipping`
- [x] After dispatch — no cancel in hub
- [x] Specs + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page enhancement** (existing `/orders` hub tray, no new route)
- [x] FIC §A: N/A — no new page/route
- [x] page.md / PAGE-TZ-INDEX: `orders.page.md` HUB-304 row + TZ table updated
- [x] DOMAIN-MAP: N/A — no new route/page/module contour
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — reuses existing `Shipment.status`/`Order.status` semantics, no new shared field
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — `_active/` был пуст
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web` → 102 suites / 675 passed, 7 pre-existing skipped, 0 failed (6 new `order-hub-tray` cancel tests: visible for draft/scheduled+no dispatchedAt, hidden after dispatch, hidden when delivered, opens destructive confirm, cancels+reloads on confirm, toast error + no reload on failure; extended the shared `shipmentsApi` mock shape with `cancelShipment` across all 4 inline `TestBed` setups in the same spec file — expected consequence of the new method, not a regression)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (same 2 pre-existing baseline warnings as S0–S3)

## Executor report

- `order-hub-tray.component.ts`: imported `AlertDialogComponent`; added `shipmentCancellable()` (mirrors legacy/registry TZ-SHIP-433 gate: `draft`/`scheduled` status **and** no `dispatchedAt`) and `cancelActiveShipment()` (confirm via the same `AlertDialogComponent` pattern already used on the `/shipping` registry → `PiShipmentsService.cancelShipment(id)` → toast → `loadShipments()` reuse from S2, no new HTTP call type). Отгрузка block's `hasShipment()` branch gains the cancel button (`order-cancel-shipment-button`) right after the «Документ не оформлен» note, only when cancellable.
- Class doc-comment updated: cancel-shipment is no longer legacy/desk-only — the hub now has it via the same registry API, not a duplicated write-path.
- Docs: `orders.page.md` (HUB-304 row + TZ table). `shipping.page.md` was already updated for cancel context in S1/S3; no further change needed there since the registry's own cancel button/flow is untouched.
- Known limits: same as S1–S3 — no live-browser/Playwright pass this step (DOM-level Jest + AOT production build are the verification evidence). Per TZ-SHIP-433 note (RU error from BE after dispatch), no client-side duplicate validation was added beyond the visibility gate — the BE remains authoritative if this is ever raced.

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T04:10:00Z
