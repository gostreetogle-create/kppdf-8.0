# TZ-COMBINE-410 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-COMBINE-410.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: composer-executor-combine-410
- claimed_at: 2026-08-16T22:46:25Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (CLI: Unknown task TZ-COMBINE-410)
- closed_at: 2026-08-16T23:05:00+03:00

## Preflight

- [x] Claim + `_active` + no conflict on dashboard.page.*
- [x] COMBINE-409 archived DONE

## Acceptance

- [x] Без модулей: чип «целиком» + drag → PATCH line lane
- [x] Индикаторы свёрнутого ряда (prefetch / empty → effective lane)
- [x] a11y expand: aria-expanded + aria-controls + focus-ring
- [x] Light order group header
- [x] boardLane semantics unchanged; no MIG/Desktop; no deploy
- [x] FE tsc PASS; jest dashboard.page 25/25
- [x] design-combine.page.md updated
- [x] Archive + lock + push

## Integrity slot

- [x] Тип: page
- [x] page.md updated
- [x] SECTION-READINESS N/A
- [x] Conflict keys only in commit
- [x] Coupling N/A (semantics unchanged)

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm exec jest src/app/pages/dashboard/dashboard.page.spec.ts` → PASS 25/25

## Executor report

- Prefetch modules for collapsed indicators; whole-product chip; a11y; order group headers.
- known_limitation: deploy forbidden; multi-expand park.
