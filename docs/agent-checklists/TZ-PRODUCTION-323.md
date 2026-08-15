# TZ-PRODUCTION-323 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-323.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: executor-grok-4.6
- claimed_at: 2026-08-15T17:52:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: yes (id TZ-PRODUCTION-323-gantt-cascade-fullwidth)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (321/322 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-323.md` на месте (removed at archive)

## Acceptance

- [x] Meta only on `row.isSummary` (fix портянка) — label + timeline
- [x] Full-width continuous meta + work-detail panels (no calendar void)
- [x] Jest: one-meta-with-children; full-width evidence
- [x] 321/322 click behavior without regression
- [x] Gates: FE tsc + jest gantt-bars + production-cockpit
- [x] Docs / wave / archive / lock / progress

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP; обновлены page.md + PAGE-TZ-INDEX
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A — статус раздела не менялся (STUDIO ESTIMATE PASS)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `cd frontend && pnpm exec jest src/app/pages/production/blocks/gantt-bars.component.spec.ts src/app/pages/production/production-cockpit.page.spec.ts --no-coverage` — PASS 41/41 (exit 0)

## Executor report

- Meta gated `row.isSummary` on label + timeline (one `[data-test=gantt-order-meta-o1]` with children expanded).
- Full-width: `gantt-cascade-panel` in sticky label column (`width: 100cqw` + `min-width: timelineMinWidth()`), transparent `gantt-cascade-spacer` on timeline for height sync. Dense horizontal fields. 321/322 clicks untouched.
- Conflict: none in `tasks/_active/` on main.
- known_limitation: extra fields in the wide panel not invented here.

## Review handoff

- [x] TZ does not require Cursor Verdict before archive (executor closeout)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T18:00:00Z
