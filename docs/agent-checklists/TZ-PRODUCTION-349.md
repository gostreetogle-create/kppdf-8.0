# TZ-PRODUCTION-349 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-349.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: composer-executor-349
- claimed_at: 2026-08-16T22:24:48+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- closed_at: 2026-08-16T22:28:00+03:00

## Acceptance

- [x] CSS vars `--gantt-level-order|product|module` (+ dark) on host
- [x] Row washes distinct; order-expanded !important does not flatten children
- [x] barFill: order/product/module summaries distinct; WT accent unchanged
- [x] Timeline row wash parity with label column
- [x] Spec asserts distinct fills / CSS vars
- [x] Gates FE tsc + jest gantt-bars PASS (52/52)
- [x] Archive + lock + commit + push; deploy forbidden

## Integrity slot

- [x] Тип: page (production cockpit Gantt chrome)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A (visual palette only)
- [x] Чужой WIP не в коммите
- [x] Coupling map N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm test -- --testPathPattern="gantt-bars.component" --no-coverage` → PASS 52/52

## Executor report

Milk palette CSS vars + distinct summary barFill; removed beige flatten from gantt-order-expanded; WT accents preserved.
