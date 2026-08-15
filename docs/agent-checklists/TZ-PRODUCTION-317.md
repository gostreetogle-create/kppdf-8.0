# TZ-PRODUCTION-317 checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-PRODUCTION-317.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: agent-3e757640b7
- claimed_at: 2026-08-15T16:29:08Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (Unknown task; sync tasks first)

## Preflight

- [x] cwd + git root `D:\kppdf-8.0`
- [x] Claim slot filled

## Acceptance

- [x] Select does not filter Gantt to one order
- [x] Expand shows children under summary; others shift down
- [x] Gates + archive

## Integrity slot

- [x] Тип изменения: page
- [x] page.md + PAGE-TZ-INDEX + WAVE updated
- [x] Чужой WIP не в коммите
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS
- `pnpm exec jest --testPathPattern="production-cockpit.page.spec|gantt-bars.component.spec"` → **28 PASS**

## Executor report

Root bug: `onSelect` → `applyBars([order])`. Fixed all select/reload/fit paths to `applyFilteredActive()` + expand selected.
