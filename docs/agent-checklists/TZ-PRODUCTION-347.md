# TZ-PRODUCTION-347 checklist

> Status: **DONE**
> Marker: archived → `tasks/_archive/2026-08/TZ-PRODUCTION-347.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: composer-executor-347
- claimed_at: 2026-08-16T21:42:25+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на gantt-bar.model*
- [x] TZ / deps (342 DONE) прочитаны
- [x] Claim slot заполнен
- [x] `_active` claimed then archived

## Acceptance

- [x] `isGanttShopFloorNoiseName` hides сборк/упаков module + WT names (case-insensitive)
- [x] Рама/полка/резка/сварка/покраска/гибка/Крепёжный remain
- [x] Empty-after-filter → orderHasGanttEstimate false (existing skip)
- [x] FE tsc + jest gantt-bar.model PASS (37/37)
- [x] No Mongo wipe, no catalog delete, no gantt-bars CSS (346), no peer seed WIP staged

## Integrity slot

- [x] Тип: page (Gantt estimate filter UX)
- [x] FIC N/A — estimate model filter only; no new route/permission
- [x] page.md one-line note + TZ table row
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `cd frontend && pnpm test -- --testPathPattern=gantt-bar.model --no-coverage` → PASS 37/37

## Executor report

- Helper + filter in `buildGanttBars`; unit tests positive/negative + only-noise ineligible.
- Seeds skipped; 346 CSS not touched.

## Closeout

- [x] archive + lock + progress + удалить `_active` + root task
- [x] Status = DONE
- closed_at: 2026-08-16T21:45:00+03:00
