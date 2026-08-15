# TZ-PRODUCTION-335 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-335.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: cursor-grok-4.6-executor
- claimed_at: 2026-08-15T20:05:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ; Team Room `claim` unknown task)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (333 DONE; park plan-vs-fact)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-335.md` на месте (removed after archive)

Mode: **TZ-exec**. Primary signal: earlier startDate on top after drag; meta labels + silent auto-save.

## Acceptance

- [x] Order starting earlier appears above later ones on Gantt (and rail via filter sort)
- [x] After summary body-drag that swaps relative starts, vertical order updates without full reload
- [x] Meta: no «После сохранения Гант обновится»; RU labels Статус заказа / Важность / Начало плана; auto-save silent/optimistic
- [x] Keep «Открыть в списке заказов»; drop «Сохранить заказ»
- [x] FE tsc + jest gantt-bar.model + gantt-bars + production-cockpit PASS (orders-rail also PASS)
- [x] page.md + known_limitation plan-vs-fact; PAGE-TZ-INDEX
- [x] Do NOT sort Gantt by priority; do NOT implement plan-vs-fact prompts

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: §A page.md + PAGE-TZ-INDEX; §B–E N/A (нет permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (section status unchanged)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `frontend` `pnpm exec tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest gantt-bar.model + gantt-bars + production-cockpit + orders-rail: PASS — 85 tests
- eslint owned files: PASS (1 pre-existing OnInit warning on page.ts)
- prettier: gantt-bar.model.spec.ts formatted

Primary signal: met (sort + silent meta auto-save covered by specs)
Secondary: PASS

## Executor report

- Sort helper `compareOrdersByPlanStart`; `buildGanttTreeBars` by summary startDate; rail via `filterOrdersForRail` sort (orders-rail.component.ts not patched).
- Meta auto-save + `applyOptimisticOrderMeta`; persist via 333 `persistGanttPatch`.
- Parked plan-vs-fact documented in page.md; existing backlog file not committed.
- Conflict disclosure: none parallel in `_active`.

## Review handoff

- [x] TZ does not require Cursor Verdict before archive (executor closeout)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T20:20:00Z
