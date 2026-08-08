# TZ-NAV-301 — Lifecycle menu + stubs

**TZ:** `tasks/_archive/2026-08/TZ-NAV-301.done.md`  
**Status:** DONE  
**Canon:** `docs/audits/2026-08-08-nav-ia-lifecycle-audit.md`

## Claim slot

- agent_id: cursor-composer-nav301
- claimed_at: 2026-08-08T07:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; checklist slot filled)
- closed_at: 2026-08-08T07:45:00Z

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] ORDERS-303 CLAIMED — keys disjoint
- [x] Audit + TZ read; claim before code

## Acceptance

- [x] Top nav L→R per TZ
- [x] People not in Catalog; Organizations in Admin
- [x] Stubs counterparties/design/supply/shipping open (routes + chrome)
- [x] Deals КП→Договоры→Заказы; entry `/proposals`
- [x] FE tsc PASS; BE tsc PASS (PAGE_KEYS)
- [x] Unit nav order PASS
- [x] Archive + lock; map NEXT

## Gates (факт)

- `frontend`: `pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `backend`: `pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `frontend`: `pnpm test -- --testPathPattern=app-layout.nav-order` → PASS 1/1

## Executor report

- Menu rewritten to lifecycle L→R; stubs + thin counterparties list via existing CounterpartyService (no service edit — ORDERS-303 owns pi-counterpart*).
- PAGE_KEYS + system-role seed merge for ACL visibility.
- Conflict disclosure: ∥ ORDERS-303; did not touch orders/**, composition-tree, dictionaries WIP, deploy.
- known_limitation: stub empties; Sites UI deferred to ORDERS-303.

## Closeout

- [x] archive + lock + progress + removed `_active/TZ-NAV-301.md`
- Status = DONE
- closed_at: 2026-08-08T07:45:00Z
