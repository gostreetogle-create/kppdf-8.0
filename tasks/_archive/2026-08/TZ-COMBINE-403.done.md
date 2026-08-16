# TZ-COMBINE-403: PATCH boardLane + Order.status rollup — DONE

> Source: `tasks/TZ-COMBINE-403-patch-lane-rollup.md`

## OUTCOME

DONE 2026-08-16. `PATCH /orders/:id/lines/:lineId/lane` writes `boardLane` +
derived `OrderItem.status` (prep|design→pending, shop→in_production, to_ship→ready).
Rejects `lane=shipped` (RU; ship only via POST /ship). `rollupOrderStatus` after
lane/status writes: shop→in_production, all to_ship→ready, leave prep→confirmed,
all prep keeps draft / monotonic confirmed (never draft-down). Never sets
`Order.status=shipped` via rollup. Update items shrink forbidden unless dropped
lines are `prep`. No FE. No Gantt. Deploy НЕ.

## Gates

- `pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- `pnpm exec jest --testPathPattern=order.service --coverage=false` — **1 suite / 58 tests PASS**

## Files

- `backend/src/modules/order/dto/patch-line-board-lane.dto.ts`
- `backend/src/modules/order/order.controller.ts`
- `backend/src/modules/order/order.service.ts`
- `backend/src/modules/order/order.service.spec.ts`
- `docs/COUPLING-MAP.md` (stamp 403)
- `docs/pages/design-combine.page.md` (API live)

## known_limitation

- Legacy `PATCH .../items/:i/status` still exists; also triggers rollup for consistency
- Partial ship / moduleLanes out of scope (COMBINE-406+)

---

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:50:30+03:00
closed_by: cursor-composer-executor
TZ: TZ-COMBINE-403
WAVE: WAVE-COMBINE-v1
Cursor_verdict: PASS (executor closeout; PO authorized archive+push)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (backend tsconfig.build.json --noEmit)
  - tests: PASS (order.service 58/58)
  - lint: N/A focused
  - checklist: docs/agent-checklists/TZ-COMBINE-403.md
  - deploy: NO

conflict_keys:
  - backend/src/modules/order/order.service.ts
  - backend/src/modules/order/order.controller.ts
  - backend/src/modules/order/dto/patch-line-board-lane.dto.ts
  - backend/src/modules/order/order.service.spec.ts
