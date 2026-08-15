# TZ-PRODUCTION-322 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-PRODUCTION-322.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: executor-grok-4.6
- claimed_at: 2026-08-15T17:36:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (root TZ; kit CLI unknown task)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на те же keys
- [x] TZ / канон / deps прочитаны (321 archive DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-PRODUCTION-322.md` на месте (removed on archive)

## Acceptance

- [x] На `/production` нет bottom sheet и нет chrome «Карточка»
- [x] Клик номера заказа открывает/закрывает meta strip под summary; ▸ только дерево
- [x] Priority + plannedDate save → PATCH order; полосы/якорь как раньше
- [x] Work-detail (321) жив; dismiss чистит meta+detail+trees
- [x] Gates: FE tsc + jest `src/app/pages/production` (tsc 0; jest 58 PASS)
- [x] Archive `tasks/_archive/2026-08/TZ-PRODUCTION-322.done.md`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page
- [x] FIC §A–E: A page.md + PAGE-TZ-INDEX; B–E N/A (нет нового route/permission/module/MCP)
- [x] page.md / PAGE-TZ-INDEX обновлены
- [x] SECTION-READINESS N/A (статус раздела не меняется)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit` → PASS (exit 0)
- `cd frontend && pnpm exec jest src/app/pages/production --no-coverage` → PASS 58

## Executor report

- Order-meta strip under Gantt summary; sheet/chrome card removed; 321 cascade kept.
- Conflict disclosure: staged only 322 conflict keys + archive/lock/_NOW.
- known_limitations: product/module deep-links from old inspector — backlog.

## Review handoff

- [x] TZ не требует отдельный Cursor Verdict inbox — PO выдал TZ исполнителю

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-15T17:50:00Z
