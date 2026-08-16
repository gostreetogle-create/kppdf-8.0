# TZ-COMBINE-405 checklist

> Status: **DONE**
> Spec: `tasks/TZ-COMBINE-405-combine-item-dnd.md`
> Archive: `tasks/_archive/2026-08/TZ-COMBINE-405.done.md`

## Claim slot

- agent_id: cursor-composer-executor
- claimed_at: 2026-08-16T14:53:00+03:00
- closed_at: 2026-08-16T14:57:07+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## AC

- [x] CDK DnD → `OrdersService.patchLane`
- [x] freeze modal on first shop (RU; Cancel aborts)
- [x] ship-whole drop gate (toast N / confirmShip → POST ship)
- [x] optimistic + rollback
- [x] FE tsc + dashboard specs PASS

## Integrity slot

- [x] Тип: page (`/design/combine`)
- [x] `docs/pages/design-combine.page.md` updated (DnD write-path)
- [x] COUPLING-MAP N/A (canon already had freeze + ship-whole)
- [x] Freebuff WIP (production/**, GANTT-401) not in commit

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern="dashboard.page" --coverage=false` → PASS (14)

## Executor report

DnD on item cards; freeze AlertDialog; ship gate + confirmShip mirror SWEEP-401.
orders.service.ts unchanged (patchLane already from 404). Deploy НЕ.
