# TZ-TEST-GANTT-402 checklist

> Status: **DONE**
> Spec: `tasks/_backlog/TZ-TEST-GANTT-402-workers-view-specs.md`
> Archive: `tasks/_archive/2026-08/TZ-TEST-GANTT-402.done.md`

## Claim slot

- agent_id: deepseek/deepseek-v4-pro (Freebuff)
- claimed_at: 2026-08-16T15:24:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: no
- closed_at: 2026-08-16T15:26:00+03:00

## Preflight

- [x] Claim + conflict keys clear (gantt-bar.model.spec + gantt-bars.component.spec усилены)

## AC

- [x] ≥2 новых теста: multi-person label = одна группа; worker work-detail read-only (days disabled, нет catalog)
- [x] «По заказам» default не сломан (93/93 зелёные)
- [x] FE tsc + jest `production-cockpit|gantt` PASS

## Gates

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- `cd frontend && pnpm exec jest --config jest.config.js --testPathPattern="production-cockpit|gantt" --no-coverage` PASS — 3 suites / 93 tests
