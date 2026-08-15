# TZ-PRODUCTION-309 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-15T18:35:27+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: no (Unknown task — sync not available; best-effort join OK)

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ `tasks/TZ-PRODUCTION-309-safe-estimate-order-days.md` прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-309.md` на месте

## Acceptance

- [x] PATCH estimate-days round-trip + clear
- [x] Facade/bars use override; catalog path confirm remains
- [x] WorkType mutate → production:write
- [x] Gates tsc/jest PASS
- [x] Docs + PAGE-TZ-INDEX + progress

## Integrity slot

- [x] Тип: module + page
- [x] FIC §A–E или N/A (N/A — estimate override + ACL; no new entity module)
- [x] page.md / PAGE-TZ-INDEX
- [x] Чужой WIP не в коммите (excluded gantt-bars/orders-rail pre-existing dirty)

## Gates (факт)

- BE `pnpm exec tsc -p tsconfig.build.json --noEmit` PASS
- BE `pnpm exec jest --testPathPattern=order` 25 PASS
- FE `pnpm exec tsc -p tsconfig.app.json --noEmit` PASS
- FE `pnpm exec jest --testPathPattern=gantt-bar|production-read|order-inspector` 17 PASS

## Executor report (auto)

- Outcome: DONE
- Archive: tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md
- Lock: .mimocode/locks/TZ-PRODUCTION-309-safe-estimate-order-days.lock
- SHA: 9b24c0f1498c12daa996500ccfd760cfca1a0bd6
- Team Room claim: unavailable (Unknown task)
- Drag/resize: not implemented (311)
- Blockers: none
- Push: origin/main (claimed executor per GIT-POLICY)

## Closeout

- [x] archive + lock + remove `_active`
- closed_at: 2026-08-15T18:40:00+03:00
