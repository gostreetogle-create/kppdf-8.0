# TZ-ORDERS-HUB-304 checklist

> Status: **DONE**
> Prep: shipping stub contract + reservation SoT note written 2026-08-15
> Commit/push: РїРѕ `docs/GIT-POLICY.md`
> implementation_sha: cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1
> closeout_sha: d08f61f4f2126228d8ae6384b48e052c78cfc200

## Claim slot (Р·Р°РїРѕР»РЅРёС‚СЊ РїСЂРё СЃС‚Р°СЂС‚Рµ FE)

- agent_id: Buffy (Cursor Product Executor)
- claimed_at: 2026-08-15T14:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: local-main HUB-304

## Prep done (Р±РµР· orders.page)

- [x] `docs/pages/shipping.page.md` вЂ” hub stub copy + no shipment counts
- [x] TZ file `tasks/TZ-ORDERS-HUB-304-readiness-warehouse-shipping.md`
- [x] SoT СЃРєР»Р°Рґ: `GET /api/reservations?orderId=<Order.number>` (РЅРµ `reservationIds[]`)
- [x] `docs/audits/2026-08-15-reservations-hub-read-contract.md` вЂ” type sketch + service contract
- [x] `PAGE-TZ-INDEX` вЂ” supply / production / shipping hub refs


## Acceptance (FE)

- [x] Р‘Р»РѕРє Р“РѕС‚РѕРІРЅРѕСЃС‚СЊ: X/Y + Р»РёРЅРёРё; write С‚РѕР»СЊРєРѕ С‡РµСЂРµР· `/orders/:id`
- [x] Thin `pi-reservations.service` read-only
- [x] Р‘Р»РѕРє РЎРєР»Р°Рґ: lazy by **number**; empty/error isolation
- [x] Р‘Р»РѕРє РћС‚РіСЂСѓР·РєР°: stub text в†’ `/shipping`; no GET /shipments
- [x] Gates: tsc + jest orders.page|pi-reservations
- [x] Quality score в‰Ґ97

## Review handoff

- [x] CLAIM РїРѕСЃР»Рµ HUB-303 DONE on main
- [x] Cursor Verdict: **PASS** (2026-08-15) вЂ” readiness/warehouse/shipping stub + reservations read OK
- [x] Archive + lock after closeout

## Executor report (auto)

- outcome: DONE
- quality_score: 98
- implementation_sha: cd0cd867554a4b7621dc6b0f5b56fdcb5124bab1
- gates:
  - `pnpm exec tsc -p tsconfig.app.json --noEmit` вЂ” PASS
  - `pnpm exec jest --config jest.config.js --runInBand --testPathPattern="orders.page|pi-reservations"` вЂ” PASS (19/19)
- delivered:
  - Expand В«Р“РѕС‚РѕРІРЅРѕСЃС‚СЊВ» 0 HTTP (X/Y + lines; link `/orders/:id`; no ready toggle)
  - `pi-reservations.service.ts` read-only `list(orderNumber?)` в†’ `GET /api/reservations?orderId=`
  - Expand В«РЎРєР»Р°РґВ» lazy by Order.number; active/total; empty/error; stale guard
  - Expand В«РћС‚РіСЂСѓР·РєР°В» stub в†’ `/shipping`; no GET /shipments
  - Budget: supply(1)+reservations(1) в‰¤4 on expand
- deploy: NOT EXECUTED
- foreign_WIP: left untouched (UX-321/AUTH/products/layout)
