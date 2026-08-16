# TZ-COMBINE-402: Schema lineId + boardLane — DONE

> Source: `tasks/TZ-COMBINE-402-order-item-lineid-boardlane.md`

## OUTCOME

DONE 2026-08-16. `OrderItem.lineId` (uuid / stable legacy backfill) + `boardLane`
enum with default `prep`. Create path assigns lineId + prep + pending. find/findAll
persist backfill: `legacy-{index}-{orderId}` + status→boardLane map. No PATCH lane
(→ 403). No FE. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- `pnpm exec jest --testPathPattern=order.service --coverage=false` — **1 suite / 48 tests PASS**

## Files

- `backend/src/modules/order/order.schema.ts`
- `backend/src/modules/order/order.service.ts`
- `backend/src/modules/order/order.service.spec.ts`

## known_limitation

- Remove-line guard (boardLane !== prep) deferred — no remove-line path; TODO → 403
- `OrderItem.status` still writable via legacy setItemStatus; 403 will derive status from boardLane

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:46:25+03:00
closed_by: cursor-composer-executor
TZ: TZ-COMBINE-402
WAVE: WAVE-COMBINE-v1
Cursor_verdict: PASS (executor closeout; PO authorized archive+push)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsconfig.build.json --noEmit)
  - tests: PASS (order.service 48/48)
  - lint: N/A focused
  - checklist: docs/agent-checklists/TZ-COMBINE-402.md
  - deploy: NO

conflict_keys:
  - backend/src/modules/order/order.schema.ts
  - backend/src/modules/order/order.service.ts (create/find/backfill only)
