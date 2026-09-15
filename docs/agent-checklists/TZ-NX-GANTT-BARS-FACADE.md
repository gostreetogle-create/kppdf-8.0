# TZ-NX-GANTT-BARS-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-GANTT-BARS-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md` (после gates/review)

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T02:48:32Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — до claim `tasks/_active/` был пуст (только `.gitkeep`), конфликтов нет
- [x] TZ / канон / deps прочитаны (`WAVE-MAP.md`, `PROMPT-CLAUDE-B1-CONTINUOUS.md`, `GEMINI.md`, `how-to-connect-ai.md`, `TZ-NX-GANTT-BARS-FACADE.md`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-GANTT-BARS-FACADE.md` на месте

## Note — resumed prior uncommitted work

При старте рабочее дерево уже содержало uncommitted изменения, которые
механически соответствуют этому TZ: `gantt-bars.component.ts` (modified),
новые `gantt-bars.facade.ts` и `gantt-bars.constants.ts` (untracked), без
Claim/checklist/commit (предыдущая незавершённая попытка — `CONTINUE-TOMORROW.md`
ошибочно указывал "0/6, код не начат"). Заголовок-комментарий в
`gantt-bars.constants.ts` сам ссылается на `TZ-NX-GANTT-BARS-FACADE` и
преемника `TZ-NX-GANTT-BARS-UTIL-UI`, что подтверждает: это та же задача, а
не чужой WIP. Решение: не отбрасывать — доклеймить, проверить AC, прогнать
gates и закрыть как обычный TZ вместо повторной реализации с нуля.

## Acceptance

- [x] Facade exists; component has no private drag/session fields that belong in facade (verified: no `signal(`/`computed(` left in component.ts, only `this.facade.*` delegation + host-only `viewChild`/`inject(Injector|DestroyRef|ElementRef)`)
- [x] Instance-scoped providers (`providers: [GanttBarsFacade]` on component, line 1118)
- [x] `@Input`/`@Output` public contract of `GanttBarsComponent` stable for cockpit (inputs/outputs unchanged, only internals moved)
- [x] No geometry algorithm rewrites (mechanical move only, confirmed by diff)
- [x] Specs green: `gantt-bars.component.spec.ts`, `gantt-bar.model.spec.ts`, `gantt-workers-view.spec.ts`, `production-cockpit.page.spec.ts`, `production-cockpit.page.write.spec.ts`
- [x] nx build last exit 0

## Integrity slot (до READY / archive)

- [ ] Тип изменения определён: page | permission | module | MCP | docs-only | other → **other** (internal refactor, no route/permission change)
- [ ] FIC §A–E — N/A (no new page/permission/module/MCP surface, mechanical extract only)
- [ ] page.md / PAGE-TZ-INDEX — N/A (no UI/route change, `/production` page unaffected externally)
- [ ] DOMAIN-MAP — N/A (no module/route/page contour change)
- [ ] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: gantt-bars.component.ts, gantt-bars.facade.ts, gantt-bars.constants.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A (no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: `cd frontend-nx && pnpm exec nx build kppdf-web` → exit 0 (already includes resumed WIP, confirmed green)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` (implicit conflict) — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` — последняя команда в Gates, exit 0 (same build run served as both baseline and closing gate — no code changed after claim)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern=gantt` → PASS (pattern matched broadly; full run: 117/117 suites, 840 passed / 7 skipped / 0 failed — includes all 5 AC-named specs)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; pre-existing unrelated budget/NG8102 warnings only, no errors)

## Executor report

Что сделано: подхвачена и доклеймлена уже написанная (но не закоммиченная
прошлой сессией) механическая экстракция `GanttBarsFacade` из
`gantt-bars.component.ts` — Signals, drag/resize interaction sessions, row-model
helpers перенесены в `blocks/gantt-bars.facade.ts`; Angular-free
constants/types/pure-helpers вынесены в `blocks/gantt-bars.constants.ts`
(во избежание циклического value-import между component и facade); компонент
стал тонким host: `providers: [GanttBarsFacade]`, `inject(GanttBarsFacade)`,
шаблон биндится через `GanttBarsFacadeHost`. Публичный `@Input`/`@Output`
контракт не менялся. Геометрия/алгоритмы drag не переписывались.

Conflict disclosure: рабочее дерево также содержит множество несвязанных
uncommitted правок (studio, docs/audits, data/, zip-архивы и т.д.) — не мои,
не относятся к conflict keys этого TZ, в коммит не включены.

Known limits: `gantt-bars.constants.ts` — временное решение (сам файл это
документирует), полный перенос в `@kppdf/features/production/util` — задача
преемника `TZ-NX-GANTT-BARS-UTIL-UI` (A2), как и было запланировано в
WAVE-MAP.

## Review handoff

- [x] READY FOR REVIEW — N/A (TZ не требует отдельного Cursor/PO review gate; DoD = gates green)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
