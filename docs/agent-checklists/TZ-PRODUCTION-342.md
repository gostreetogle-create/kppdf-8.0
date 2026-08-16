# TZ-PRODUCTION-342 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-342.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: local-executor-composer
- claimed_at: 2026-08-16T21:06:12+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)
- closed_at: 2026-08-16T21:10:43Z

## Preflight

- [x] Claim + `_active` before code
- [x] Conflict keys free

## Acceptance

- [x] Expand order → product summaries (not WT)
- [x] Expand product → modules; expand module → WT + cascade/drag
- [x] Order summary span still min…max children
- [x] Product/module summaries not resizable; WT resize/drag OK
- [x] Worker lens path unchanged (344)
- [x] FE tsc + jest gantt-bar.model + gantt-bars + cockpit PASS (97)
- [x] Archive + commit/push own files; PAGE-TZ-INDEX + wave DoD partial

## Integrity slot

- [x] Тип: page (`/production`)
- [x] FIC: N/A — IA tree rematerialize
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec|production-cockpit.page.spec"` → PASS 3/97

## Executor report

- Tree rematerialized Order→Product→Module→WT; expand sets + UI labels; worker path untouched.
- Deploy not run.

## Closeout

- [x] archive + lock + progress + `_active` removed
- Status = DONE
- closed_at: 2026-08-16T21:10:43Z
