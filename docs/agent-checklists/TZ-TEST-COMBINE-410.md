# TZ-TEST-COMBINE-410 checklist

> Status: **DONE**
> Spec: `tasks/_backlog/TZ-TEST-COMBINE-410-lane-controller-spec.md`
> Archive: `tasks/_archive/2026-08/TZ-TEST-COMBINE-410.done.md`

## Claim slot

- agent_id: deepseek/deepseek-v4-pro (Freebuff)
- claimed_at: 2026-08-16T15:12:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no
- closed_at: 2026-08-16T15:14:00+03:00

## Preflight

- [x] Claim + conflict keys clear (order.controller.spec новый; order.service.spec расширен)

## AC

- [x] ≥3 новых теста: controller happy shop / shipped→400 / unknown lineId→404 + service unknown lineId 404
- [x] BE tsc + jest `order.controller|order.service` PASS (2 suites / 62)
- [x] archive + push

## Gates

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- `cd backend && pnpm exec jest --testPathPattern="order.controller|order.service" --coverage=false` PASS — 2 suites / 62 tests
