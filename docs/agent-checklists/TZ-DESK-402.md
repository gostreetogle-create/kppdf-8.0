# TZ-DESK-402 checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-DESK-402.md` (до archive)

## Claim slot

- agent_id: buffy-desktop
- claimed_at: 2026-08-18T21:12:28+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session; slot filled here)

## Preflight

- [x] 406 archive на origin (SHA `5e83932c`)
- [x] `_active/TZ-DESK-402.md`

## Acceptance

- [x] один OrdersService write-path — `order-form-panel` shared dialog + desk flyout
- [x] после create заказ выбран на /desk (expand + `?orderId=` + scroll)
- [x] COUPLING-MAP строка стола (`Стол менеджера /desk → Order.status`, уже есть — N/A)
- [x] focused tsc + specs PASS

## Gates

- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- [x] Jest `manager-desk|desk-order|order-form-panel|order-form-dialog|orders.page` — 4 suites / 36 tests PASS
- [x] ESLint changed files PASS

## Executor report (auto)

- Extracted `order-form-panel.component.ts` from `order-form-dialog`; dialog = thin shell over panel (same OrdersService create/update, same validation).
- Desk queue = live `GET /orders` (httpResource) + counterparty lookup; fixture removed.
- Invalid `?orderId=` → RU toast «Заказ не найден» + query cleared (no crash); reload-deferred validation avoids false "not found" on fresh create.
- Create/edit flyout hosts the shared panel; after saved → close flyout, expand new order, scroll into view.
- Tray (`desk-order-tray`) now renders live `Order` (statuses draft…cancelled, items) — 412 will replace with shared hub tray.
- Docs: manager-desk.page.md + PAGE-TZ-INDEX.md updated.

## Closeout

- [x] archive + lock
- closed_at: 2026-08-18T21:1x:xx+03:00 (commit time)
