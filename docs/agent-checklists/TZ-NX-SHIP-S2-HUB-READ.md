# TZ-NX-SHIP-S2-HUB-READ checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-SHIP-S2-HUB-READ.md` (removed at closeout)
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-08T03:39:06Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI configured in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (S0+S1 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-SHIP-S2-HUB-READ.md` на месте

### Preflight Check Output
- **Context read:** NX `order-hub-tray.component.ts` (full, incl. shipping stub §215-263) + its spec; legacy `frontend/src/app/shared/orders/order-hub-tray.component.ts` shipment block (§537-609, desk-mode wording source: «Отгружен: N · date», «Документ не оформлен», activeShipment/hasShipment/shipmentNumber/shipmentDateLabel/shipmentHasDocs); `docs/pages/orders.page.md` HUB-304 row
- **Key Constraints:** READ only this step — no ship/cancel button in hub (S3/registry); link must carry `?orderId=`; honest empty/error, no fake "success" copy (order-status stub removed)
- **Planned Deliverable:** wire `PiShipmentsService.list({orderId})` into the existing eager-load budget (supply+reservations+shipments), real summary computed methods, updated link, docs
- **Validation Path:** tray specs (new + fix DI-provider gaps in 2 unrelated pre-existing suites); `nx build kppdf-web`

## Acceptance

- [x] Expanding order shows real shipment data or honest empty
- [x] Link opens filtered registry (`/shipping?orderId=<id>`, not bare `/shipping`)
- [x] Specs + `nx build kppdf-web` PASS

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **page enhancement** (existing `/orders` hub tray, no new route)
- [x] FIC §A: N/A — no new page/route, only an existing hub block's data source changed
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/orders.page.md` HUB-304 row + budget line + TZ table row updated
- [x] DOMAIN-MAP: N/A — no new route/page/module contour changed (existing `/orders` already listed)
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A — reuses existing `Shipment.status`/`Order.status` semantics already documented in `COUPLING-MAP.md`, no new shared field
- [x] Канон: docs/DOCS-INTEGRITY.md

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (cached)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict)
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → exit 0
- `cd frontend-nx && pnpm exec nx test kppdf-web` → 101 suites / 662 passed, 7 pre-existing skipped, 0 failed (5 new `order-hub-tray` shipment tests; fixed missing `PiShipmentsService` DI provider in 3 pre-existing inline `TestBed` setups in `order-hub-tray.component.spec.ts` + 1 in `orders-list.page.spec.ts` — direct, expected consequence of adding a new injected dependency, not a regression)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS, exit 0 (same 2 pre-existing baseline warnings as S0/S1)

## Executor report

- `order-hub-tray.component.ts`: injected `PiShipmentsService`; added `shipments`/`shipmentsLoading`/`shipmentsError` signals + `activeShipment()`/`hasShipment()`/`shipmentNumber()`/`shipmentDateLabel()`/`shipmentHasDocs()` (mirrors legacy desk-mode logic incl. TZ-SHIP-433 "cancelled doesn't count as active"); `loadShipments()` called eagerly in `ngOnInit()` alongside supply/reservations (row-expand budget note updated to 3 calls).
- Отгрузка block template: replaced the fake `{{ statusLabel(order().status) }}` stub with real loading/error/hasShipment/empty states, exact legacy wording («Отгружен: N · date», «Документ не оформлен», «Отгрузка не оформлена» for the true-empty case since legacy hub-mode never rendered a status line at all).
- Link: `routerLink="/shipping"` → `[routerLink]="['/shipping']" [queryParams]="{orderId: order()._id}"`.
- Fixed pre-existing DI-provider gaps in 3 inline `TestBed` configs in `order-hub-tray.component.spec.ts` and 1 in `orders-list.page.spec.ts` (they construct their own module config, missing the newly-required `PiShipmentsService` provider) — expected consequence of adding a dependency, not a regression; also updated the shared `setup()` helper + 2 existing assertions (eager-load test, deep-link href).
- Docs: `orders.page.md` HUB-304 row, budget line, TZ table row.
- Known limits: no live-browser/Playwright pass this step (continuous 4-TZ queue) — same rationale as S1.

## Review handoff

- [x] READY FOR REVIEW — N/A, wave не требует Cursor review gate (executor continuous per PROMPT-CLAUDE-NX-SHIPPING)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-08T03:50:00Z
