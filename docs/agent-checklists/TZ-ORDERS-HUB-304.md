# TZ-ORDERS-HUB-304 checklist

> Status: **READY FOR REVIEW**
> Prep: shipping stub contract + reservation SoT note written 2026-08-15
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (заполнить при старте FE)

- agent_id: Buffy (Cursor Product Executor)
- claimed_at: 2026-08-15T14:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: local-main HUB-304

## Prep done (без orders.page)

- [x] `docs/pages/shipping.page.md` — hub stub copy + no shipment counts
- [x] TZ file `tasks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.md`
- [x] SoT склад: `GET /api/reservations?orderId=<Order.number>` (не `reservationIds[]`)
- [x] `docs/audits/2026-08-15-reservations-hub-read-contract.md` — type sketch + service contract
- [x] `PAGE-TZ-INDEX` — supply / production / shipping hub refs


## Acceptance (FE)

- [x] Блок Готовность: X/Y + линии; write только через `/orders/:id`
- [x] Thin `pi-reservations.service` read-only
- [x] Блок Склад: lazy by **number**; empty/error isolation
- [x] Блок Отгрузка: stub text → `/shipping`; no GET /shipments
- [x] Gates: tsc + jest orders.page|pi-reservations
- [x] Quality score ≥97

## Review handoff

- [x] CLAIM после HUB-303 DONE on main
- [ ] Archive + lock after green gates (PO authorized self-close ≥98)
