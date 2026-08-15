# TZ-PRODUCTION-311 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-executor-311
- claimed_at: 2026-08-15T15:40:35Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Get-Location + git rev-parse → D:\kppdf-8.0
- [x] 309 DONE: `tasks/_archive/2026-08/TZ-PRODUCTION-309.done.md` exists
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на production gantt keys
- [x] TZ `tasks/TZ-PRODUCTION-311-gantt-estimate-resize.md` прочитан
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-311.md` на месте

## Acceptance

- [x] Right-edge resize → PATCH estimate-days (order override only)
- [x] Cascade within order after commit
- [x] noTerm / readOnly — no handles
- [x] Gates FE tsc + jest gantt-bars
- [x] Docs + PAGE-TZ-INDEX + progress

## Integrity slot

- [x] Тип: page
- [x] FIC или N/A — N/A (estimate UI on existing page)
- [x] page.md / PAGE-TZ-INDEX
- [x] Чужой WIP не в коммите

## Gates (факт)

- FE tsc PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- FE jest gantt-bars + production-cockpit **17 PASS**

## Executor report (auto)

- Outcome: DONE
- Workspace: D:\kppdf-8.0 (main)
- Dep SHA: 9b24c0f1498c12daa996500ccfd760cfca1a0bd6
- Feature: right-edge resize → patchEstimateDays → reload bars
- Archive: tasks/_archive/2026-08/TZ-PRODUCTION-311.done.md
- Lock: .mimocode/locks/TZ-PRODUCTION-311-gantt-estimate-resize.lock
- Commit SHA: 85329247650db938cb80039b458c3e05cb363a7a
- Team Room: unavailable (task not synced)
- Out: left/move, catalog writes, 304–307
- Gates: FE tsc PASS; jest gantt-bars+cockpit 17 PASS

## Closeout

- [x] archive + lock + remove `_active`
- closed_at: 2026-08-15T15:55:00Z
