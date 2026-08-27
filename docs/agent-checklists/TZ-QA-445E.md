# TZ-QA-445E checklist

> Status: **DONE**
> Marker: archived — `tasks/_archive/2026-08/TZ-QA-445E.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: freebuff-2
- claimed_at: 2026-08-27T18:18:25Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable — Team Room не в этой сессии; claim в marker/checklist

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — keys не пересекаются с 444C
- [x] TZ прочитан
- [x] Claim slot заполнен
- [x] `tasks/_active/TZ-QA-445E.md` на месте (removed on archive)

### Preflight Check Output
- **Context read:** `docs/PO-CANON.md`, `docs/ui-rules.md`, `docs/AI-UI-CONTRACT.md`, `docs/pages/production-cockpit.page.md`, `docs/FEATURE-INTEGRATION-CHECKLIST.md` (§G Integrity), `tasks/TZ-QA-445E-gantt-calendar-button.md`, `frontend/.../production-cockpit.page.ts`, `frontend/.../gantt-bars.component.ts`
- **Key Constraints:** Claim freebuff-2; conflict keys only cockpit + gantt-bars (not 444C product/material/status-banner); UI pulse via existing marker, no new overlay primitive
- **Planned Deliverable:** pulse on Сегодня scroll path; tests; archive
- **Validation Path:** FIC §G Integrity + focused Jest/tsc/eslint

## Acceptance

- [x] Кнопка календаря Ганта: scroll + pulse ack (не тихий no-op); enabled с title «Прокрутить к сегодня»
- [x] Focused gates по зоне

## Integrity slot (до READY / archive)

- [x] Тип изменения: other (UI bugfix — visible feedback)
- [x] FIC §A–E N/A (нет нового route/permission/module/MCP); §F N/A
- [x] `docs/pages/production-cockpit.page.md` обновлён (Сегодня + pulse)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map N/A
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates / Executor report

- FE tsc: PASS
- Jest: `production-cockpit.page` + `gantt-bars.component` — 90 PASS
- ESLint owned: PASS (1 pre-existing OnInit warning)
- Button behavior now: chrome `today` → pad range if needed → recenter marker → brief `.gantt-today-pulse`
- Archive: `tasks/_archive/2026-08/TZ-QA-445E.done.md`
- Lock: `.mimocode/locks/TZ-QA-445E-gantt-calendar-button.lock`
- Deploy: NO
