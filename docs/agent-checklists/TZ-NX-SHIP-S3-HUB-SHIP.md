# TZ-NX-SHIP-S3-HUB-SHIP checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIP-S3-HUB-SHIP.md` (removed at closeout)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T03:46:14Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (S0+S1+S2 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIP-S3-HUB-SHIP.md` на месте

### Preflight Check Output
- **Context read:** legacy `frontend/src/app/shared/orders/ship-confirm-dialog.component.ts` (full — confirm/cancel result shape, prefill from counterparty/site); legacy `manager-desk.page.ts` `onMarkShipped()` wiring (dialog → `ordersService.ship()` → reload); S2 tray (`canMarkShipped`-equivalent gate, `loadShipments()`)
- **Key Constraints:** whole-order ship only; confirm dialog (destructive-safe per PO-CANON); no cancel button in hub (registry-only, TZ-SHIP-433); reload shipments summary after success; `data-test="order-ship-button"` (documented choice per TZ step 1)
- **Planned Deliverable:** `pages/orders/ship-confirm-dialog.component.ts` (+spec) + tray wiring (`canMarkShipped()`, `openShipConfirm()`, button) + docs + WAVE/`_NOW` closeout
- **Validation Path:** dialog spec + tray specs; `nx build kppdf-web`; WAVE DONE

## Acceptance

- [x] Operator can ship whole order from hub without leaving `/orders`
- [x] After ship, summary shows shipment; link to registry works (unchanged from S2, still `?orderId=`)
- [x] No cancel button in hub this wave
- [x] Specs + `nx build kppdf-web` PASS; WAVE checklist all DONE

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page enhancement** (existing `/orders` hub tray) + new dialog component
- [x] FIC §A: N/A — no new page/route, existing hub block gains one write action
- [x] page.md / PAGE-TZ-INDEX: `orders.page.md` HUB-304 row + TZ table; `shipping.page.md` Hub expand section
- [x] DOMAIN-MAP: N/A — no new route/page/module contour
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — no new shared status/FK field; reuses `Order.status`/`Shipment.status` already documented
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict)
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web` → 102 suites / 669 passed, 7 pre-existing skipped, 0 failed (3 new `ship-confirm-dialog` tests + 5 new tray tests; fixed missing `PiOrdersService`/`PiToastService` DI providers in 4 pre-existing inline `TestBed` setups in `order-hub-tray.component.spec.ts` — expected consequence of a new injected dependency, not a regression; rewrote the S2 "honest empty" test since a markable order with no shipment now correctly shows the ship button instead of the empty copy — the empty copy now only applies to a cancelled order that was never shipped)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (same 2 pre-existing baseline warnings as S0/S1/S2)

## Executor report

- New `pages/orders/ship-confirm-dialog.component.ts` (+spec) — mirrors legacy `ShipConfirmDialogComponent` (TZ-DESK-430): recipient/address prefilled from `counterpartyId`/`siteId`, optional note, closes with `{recipient?, address?, driverInfo?}` or `undefined` on cancel. No warehouse field (matches legacy — BE `warehouseId` is optional).
- `order-hub-tray.component.ts`: injected `PiOrdersService`/`PiToastService`; added `canMarkShipped()` (mirrors legacy gate: not shipped/delivered/cancelled) and `openShipConfirm()` (open dialog → on truthy result → `PiOrdersService.ship(order._id, {...result})` → toast → `loadShipments()` reuse from S2, no new HTTP call type). Отгрузка block gains a 3rd branch: hasShipment → summary; canMarkShipped → «Отгружено» button (`order-ship-button`); else → honest empty.
- Class doc-comment updated: this is the one deliberate hub-write exception this wave (cancel-shipment still registry-only, per PO lock).
- Docs: `orders.page.md` (HUB-304 row + TZ table), `shipping.page.md` (Hub expand section).
- WAVE-NX-SHIPPING board: S0–S3 all DONE with SHAs; `_NOW.md` Claude → IDLE.
- Known limits: no live-browser/Playwright pass this step (continuous 4-TZ queue, same rationale as S1/S2). S4 (hub cancel) is explicitly a separate prompt/TZ, not touched here.

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous per PROMPT-CLAUDE-NX-SHIPPING)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T04:00:00Z
