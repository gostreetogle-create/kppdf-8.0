# TZ-COMBINE-409 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-409.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: composer-executor-combine-409
- claimed_at: 2026-08-16T19:40:39Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI: Unknown task TZ-COMBINE-409)
- closed_at: 2026-08-16T22:50:00+03:00

## Preflight

- [x] Claim + `_active` + no conflict

## Acceptance

- [x] Product-row list UI (not column kanban)
- [x] Sticky 5 stage headers equal width
- [x] Collapsed: order · name · qty · 5 indicators
- [x] Expand → mini 5-cell; module chips; CDK scoped to line
- [x] PATCH / freeze / ship reuse; no BE change
- [x] KPI + order filter intact
- [x] Specs 23/23; tsc PASS
- [x] design-combine.page.md updated (PAGE-TZ-INDEX already had 409–410)
- [x] Archive + lock + push

## Integrity slot

- [x] Тип: page
- [x] page.md updated; PAGE-TZ-INDEX already lists WAVE 409–410
- [x] SECTION-READINESS N/A
- [x] Conflict keys only in commit
- [x] Coupling N/A (semantics unchanged)

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` → PASS 23/23

## Executor report

- Layout rewritten in `dashboard.page.ts`; drop lists `${key}::lane`; helpers for indicators / modulesInLane / whole-product chip.
- known_limitation: polish → 410; deploy forbidden; 410 not taken.
