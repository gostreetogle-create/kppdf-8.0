# TZ-PRODUCTION-312 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md`

## Claim slot

- agent_id: gemini-executor-312
- claimed_at: 2026-08-15T15:52:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Preflight

- [x] Workspace D:\kppdf-8.0
- [x] 309+311 DONE
- [x] TZ-PRODUCTION-312 прочитан
- [x] Prefer after 313 if same cockpit files — 313 DONE @ 4cd045c66c88b7a37208a4dfcf8ffd71864d5e73

## Acceptance

- [x] Body-drag → plannedDate ±N; whole chain moves
- [x] Resize handle still days-only
- [x] FE tsc + jest PASS
- [x] Docs + archive

## Integrity slot

- [x] Тип: page
- [x] FIC или N/A — N/A (gesture on existing page)
- [x] page.md / PAGE-TZ-INDEX
- [x] Чужой WIP не в коммите

## Gates (факт)

- FE tsc PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
- FE jest production-cockpit|gantt-bar **31 PASS**

## Executor report (auto)

- Outcome: DONE
- Workspace: D:\kppdf-8.0 (main)
- Feature: body-drag → plannedDate; 311 resize intact
- Archive: tasks/_archive/2026-08/TZ-PRODUCTION-312.done.md
- Lock: .mimocode/locks/TZ-PRODUCTION-312-gantt-body-drag-planned-date.lock
- Commit SHA: _(filled after commit)_
- Team Room: unavailable
- Out: left-edge, per-bar lag, 304–307
- Gates: FE tsc PASS; jest 31 PASS

## Closeout

- [x] archive + lock + remove `_active`
- closed_at: 2026-08-15T16:05:00Z
