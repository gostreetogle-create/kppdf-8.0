# TZ-COMBINE-403 checklist

> Status: **DONE**
> Spec: `tasks/TZ-COMBINE-403-patch-lane-rollup.md`
> Archive: `tasks/_archive/2026-08/TZ-COMBINE-403.done.md`

## Claim slot

- agent_id: cursor-composer-executor
- claimed_at: 2026-08-16T11:48:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable
- closed_at: 2026-08-16T14:50:30+03:00

## Preflight

- [x] Claim + `_active` + conflict keys clear

## AC

- [x] PATCH `/orders/:id/lines/:lineId/lane` body `{ lane }`
- [x] Derive `item.status` from lane; `rollupOrderStatus` after change
- [x] Reject `lane=shipped` via PATCH (BadRequestException RU)
- [x] Forbid line remove when `boardLane !== 'prep'` (update items shrink)
- [x] Unit tests: rollup cases + reject shipped lane
- [x] BE tsc + order.service jest PASS (58/58)
- [x] archive + lock + progress + push

## Integrity slot

- [x] Тип: other (BE API)
- [x] Coupling map stamped TZ-COMBINE-403
- [x] design-combine.page.md API row → live
- [x] SECTION-READINESS: N/A (no FE)
- [x] Чужой WIP не в коммите

## Gates (факт)

- `cd backend && pnpm exec tsc -p tsconfig.build.json --noEmit` → PASS
- `cd backend && pnpm exec jest --testPathPattern=order.service --coverage=false` → PASS 58/58

## Executor report

PATCH lane + rollup + delete-prep guard landed. No FE/deploy.
