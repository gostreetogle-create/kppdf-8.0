# TZ-TEST-REGRESS-414 checklist

> Status: **DONE**
> Spec: `tasks/_backlog/TZ-TEST-REGRESS-414-combine-gantt-jest-pack.md`
> Archive: `tasks/_archive/2026-08/TZ-TEST-REGRESS-414.done.md`

## Claim slot

- agent_id: deepseek/deepseek-v4-pro (Freebuff)
- claimed_at: 2026-08-16T15:32:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no
- closed_at: 2026-08-16T15:34:00+03:00

## AC

- [x] Все 4 команды EXIT 0 (BE jest 62, FE jest 122, BE tsc, FE tsc)
- [x] archive + push

## Gates (факт)

```text
cd backend && pnpm exec jest --testPathPattern="order.service|order.controller" --coverage=false
→ PASS — 2 suites / 62 tests

cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="dashboard.page|orders.service|production-cockpit|gantt" --no-coverage
→ PASS — 6 suites / 122 tests

cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit
→ PASS

cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
→ PASS
```
