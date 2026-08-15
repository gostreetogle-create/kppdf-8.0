# TZ-PRODUCTION-332 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-332.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T19:35:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ not in kit room registry; Claim slot filled)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys (active empty)
- [x] TZ / канон / deps прочитаны (330/331 DONE; GEMINI + PO-CANON)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-332.md` на месте (removed after archive)

## Acceptance

- [x] Zoom День: под DD.MM виден RU weekday abbr (ПН…ВС), UTC как остальные gantt helpers
- [x] Header taller (`h-10`); sticky «Заказ» той же высоты, что scale
- [x] Zoom Месяц: RU month names only (330 regression, без weekday spam)
- [x] `pnpm exec tsc -p tsconfig.app.json --noEmit` + jest gantt-bars PASS
- [x] page.md + PAGE-TZ-INDEX + archive + lock

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (UX polish `/production` Gantt scale)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP; обновлены page.md + PAGE-TZ-INDEX
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A — статус раздела не менялся
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` `jest --testPathPattern=gantt-bars.component.spec`: PASS — 36 tests
- eslint owned gantt-bars files: PASS
- deploy: NOT RUN

Primary signal: day ticks show DD.MM + weekday; headers h-10 — met
Secondary: tsc + jest + lint — PASS

## Executor report

Day zoom ticks are two lines (`dateLabel` + `weekdayLabel` via `ganttWeekdayShortRu`). Month ticks keep `label` month names and empty `weekdayLabel`. Headers `h-7` → `h-10` on scale and «Заказ». No pxPerDay / BE / month layout change.

## Review handoff

- [x] TZ не требует Cursor Verdict перед archive (PO: implement + commit/push)
- [x] READY FOR REVIEW N/A — PO issued executor closeout

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T19:45:00Z
