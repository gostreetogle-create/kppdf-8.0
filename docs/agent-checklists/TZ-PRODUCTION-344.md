# TZ-PRODUCTION-344 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-344.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: local-executor-composer
- claimed_at: 2026-08-16T21:12:30+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)
- closed_at: 2026-08-16T21:15:49+03:00

## Preflight

- [x] Claim + `_active` before code
- [x] Conflict keys free (343 not claimed; gantt-bars held here)

## Acceptance

- [x] Worker ▸ → module rows with order·product·module context (not raw WT)
- [x] Module ▸ → work types + cascade read-only
- [x] Worker groups expandable; default collapsed
- [x] No drag/resize in worker mode (GANTT-401)
- [x] Order lens from 342 unchanged
- [x] FE tsc + jest model|bars|cockpit PASS (100)
- [x] Archive + commit/push; page.md note

## Integrity slot

- [x] Тип: page (`/production`)
- [x] FIC: N/A — worker IA rematerialize
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS: N/A
- [x] Чужой WIP не в коммите
- [x] Coupling map: N/A

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="gantt-bar.model.spec|gantt-bars.component.spec|production-cockpit.page.spec"` → PASS 3/100

## Executor report

- Worker lens rematerialized Worker→Module(context)→WT; ▸ + default collapsed; order lens intact; RO preserved.
- Deploy not run.

## Closeout

- [x] archive + lock + progress + `_active` removed
- Status = DONE
- closed_at: 2026-08-16T21:15:49+03:00
