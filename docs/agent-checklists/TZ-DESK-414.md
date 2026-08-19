# TZ-DESK-414 checklist

> Status: **DONE**
> Marker: archived `tasks/_archive/2026-08/TZ-DESK-414.done.md`
> Commit/push: по `docs/GIT-POLICY.md` (claimed executor: после gates/review обязательно)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: composer-executor-desk-414
- claimed_at: 2026-08-19T05:32:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: yes

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на `manager-desk.page.ts|.spec.ts`
- [x] TZ / канон / deps прочитаны (407+408 DONE)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-DESK-414.md` на месте

## Acceptance

- [x] `RouterLink` в `@Component.imports` (`desk-view-open-studio` компилируется)
- [x] `loadNotes`: `notes.set([])` до GET; drop response если `orderId !== expandedOrder()?._id`
- [x] `[activeId]="view()"` — чип Гант/Комбайн на stub
- [x] jest: `?view=gantt` + expanded order не бросает; href содержит `/production` и `from=desk`
- [x] jest: смена заказа в notebook не оставляет notes предыдущего после flush нового GET
- [x] `cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`
- [x] `cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk`

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: page (hotfix UX/compile на `/desk`)
- [x] FIC §A–E: N/A — нет нового route/permission/module/MCP; bugfix существующего `/desk`
- [x] page.md / PAGE-TZ-INDEX обновлены (строка 414)
- [x] SECTION-READINESS: N/A (не менялся статус раздела)
- [x] Чужой WIP не в коммите; conflict keys соблюдены
- [x] Coupling map: N/A (не трогал общее поле/статус)
- [x] Канон: docs/DOCS-INTEGRITY.md

## Gates (факт)

- `pnpm exec tsc -p tsconfig.app.json --noEmit` — PASS (exit 0)
- `pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk` — PASS 20/20
- `pnpm exec eslint src/app/pages/desk/manager-desk.page.ts src/app/pages/desk/manager-desk.page.spec.ts` — PASS (0 errors)

## Executor report

- RouterLink import fixes ng-build of gantt/combine stub (`desk-view-open-studio`).
- `loadNotes` clears notes immediately and ignores HTTP if expanded order changed (stale race).
- Chip highlight: `[activeId]="view()"` (was hardcoded `"desk"`).
- Spec TestBed uses `provideRouter` so RouterLink href is real; 404 tests spy `Router.navigate`.
- Did not touch `order-hub-tray` (TZ-DESK-416).
- Conflict disclosure: leftover `_active` TZD-* / 415 BE / 416 tray — different keys.
- known_limitation: deploy не.

## Review handoff

- [x] TZ не требует wave inbox / Cursor Verdict — P0 hotfix, archive after gates

## Closeout (после PASS)

- [x] archive + lock + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-08-19T05:40:00+03:00
