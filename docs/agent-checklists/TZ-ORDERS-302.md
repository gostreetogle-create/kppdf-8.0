# TZ-ORDERS-302 — Order detail composition-tree

**TZ:** `tasks/_archive/2026-08/TZ-ORDERS-302.done.md`  
**Status:** DONE  
**Canon:** rails-check D1 + sales-to-shop D1/D2

## Claim slot

- agent_id: agent-3e757640b7 (cursor-composer-orders302)
- claimed_at: 2026-08-08T07:27:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; send logged)
- closed_at: 2026-08-08T07:40:00Z

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] keys clean before claim
- [x] Claim slot filled

## Acceptance

- [x] Open order with ≥1 line → cascade like product tree
- [x] Expand shows live modules/materials/product-child
- [x] No deal/КП prices in tree
- [x] FE tsc + relevant jest PASS
- [x] Docs + archive + lock

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="order-detail.page|orders.page"` → 10/10 PASS

## Executor report

- Added `OrderDetailPage` + route `/orders/:id`
- Forest of line roots → `ProductModulesService.getProductTree`
- Reused `app-composition-tree` (no CSS fork, no second tree)
- List number → detail link
- Conflict disclosure: staged only orders/** + route + docs; peer chrome WIP on other pages NOT committed

## Closeout

- [x] archive + lock + progress + remove `_active`
- closed_at: 2026-08-08T07:40:00Z
