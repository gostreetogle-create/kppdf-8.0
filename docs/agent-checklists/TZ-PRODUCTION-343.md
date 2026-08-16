# TZ-PRODUCTION-343 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-343.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: local-executor-composer
- claimed_at: 2026-08-16T21:18:27+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)
- closed_at: 2026-08-16T21:20:45+03:00

## Preflight

- [x] Claim + `_active` before code
- [x] Conflict keys free (344 archived; 345 not claimed)

## Acceptance

- [x] RU aria/title for product/module (and order) expand distinct
- [x] Label header `Заказ · изделие`; «По заказам» unchanged
- [x] Product/module group frames readable inside order frame
- [x] Product label = name (+qty); module = module name; WT unchanged
- [x] Tree structure (342) and worker IA (344) unchanged
- [x] FE tsc + jest gantt-bars PASS (45/45)
- [x] Archive + commit/push; page.md note

## Integrity slot

- [x] Тип: page (`/production`)
- [x] FIC: N/A — labels/frames polish only
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="gantt-bars.component.spec"` → PASS 45/45

## Executor report

- Polish only: kind-aware expand copy + nested product/module frames; no tree/worker/estimate changes.
- Deploy not run. Did not claim 345 while holding gantt-bars.

## Closeout

- [x] archive + lock + progress + `_active` removed
- Status = DONE
- closed_at: 2026-08-16T21:20:45+03:00
