# TZ-ORDERS-303 — Order party + site + line owner

**TZ:** `tasks/_archive/2026-08/TZ-ORDERS-303.done.md`  
**Status:** DONE  
**Canon:** sales-to-shop D18/D20

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-08T07:42:00Z
- closed_at: 2026-08-08T08:00:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (send logged)

## Acceptance

- [x] Cannot save order without counterparty + site
- [x] Quick-create name+phone+address → counterparty+site
- [x] Line ownerUserId + visible on detail
- [x] plannedShipDate on line persists
- [x] BE+FE tsc/tests PASS; archive

## Gates (факт)

- BE tsc PASS; jest site|order|quotation|counterparty 36/36
- FE tsc PASS; jest order-detail|orders.page|pi-site 12/12

## Closeout

- [x] archive + lock + progress + remove `_active`
