# TZ-PRODUCTION-329 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-329.done.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: Buffy
- claimed_at: 2026-08-15T21:57:46+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (join OK; CLI unknown task TZ-PRODUCTION-329)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (328 DONE; Counterparty ≠ Organization)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-329.md` на месте

## Acceptance

- [x] Tabs «Заказы | Заказчики» removed from Orders flyout
- [x] Filters flyout: Counterparty `<select>` (все / каждый / Без заказчика)
- [x] Selecting a customer filters Gantt + Orders list immediately
- [x] Сброс фильтров accent when dirty (default activeOnly=true)
- [x] Chrome «Фильтры» active when dirty
- [x] Jest + tsc + lint PASS
- [x] page.md / PAGE-TZ-INDEX / MASTER updated
- [x] archive + lock + commit/push

## Integrity slot (до READY / archive)

- [x] Тип изменения: page
- [x] FIC §A: page.md + PAGE-TZ-INDEX; §B–E N/A (no permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX updated
- [x] SECTION-READINESS N/A (same production estimate-studio readiness)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS
- `cd frontend && pnpm test -- --testPathPattern=pages/production` — PASS 6 suites / 71 tests
- eslint owned files — PASS (1 pre-existing OnInit warning)
- prettier owned TS — PASS
- browser smoke — NOT RUN (no live server)

## Executor report

- Removed Заказы|Заказчики tabs and counterparties list; Orders flyout is search-by-number + order list.
- Filters: Counterparty select + dirty Reset (`pi-btn-ink`) + chrome Filters active while dirty.
- Shared `filterOrdersForRail` still drives Gantt `loadBarsForOrders`.
- `railMode` removed. Search is not part of dirty.
- Next: TZ-PRODUCTION-330.

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T22:10:00+03:00
