# TZ-TEST-COMBINE-412 checklist

> Status: **DONE**
> Spec: `tasks/_backlog/TZ-TEST-COMBINE-412-dashboard-extra-cases.md`
> Archive: `tasks/_archive/2026-08/TZ-TEST-COMBINE-412.done.md`

## Claim slot

- agent_id: deepseek/deepseek-v4-pro (Freebuff)
- claimed_at: 2026-08-16T15:20:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no
- closed_at: 2026-08-16T15:22:00+03:00

## Preflight

- [x] Claim + conflict keys clear (dashboard.page.spec расширен)

## AC

- [x] ≥3 новых теста: design→prep reverse patchLane; карточка без lineId → toast без PATCH; prep→shop при уже-shop без freeze modal
- [x] FE tsc + jest `dashboard.page` PASS (17)

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="dashboard.page" --no-coverage` PASS — 2 suites / 17 tests
