# TZ-NX-PRODUCTION-TO-FEATURES checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PRODUCTION-TO-FEATURES.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T03:06:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (A1+A2+A3 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-PRODUCTION-TO-FEATURES.md`, depends on A3 archived `d8a4aeff`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-PRODUCTION-TO-FEATURES.md` на месте

## What changed

Moved (via `git mv`, zero logic change) into `libs/features/src/lib/production/`:

- `util/gantt-bar.model.ts` (+ spec) — pure estimate/tree model
- `util/gantt-bars.constants.ts` — pure px/layout constants + `Gantt*Commit` DTOs
  (was PARKed in A2 as "fold into util in the successor" — this is that successor)
- `util/gantt-workers-view.spec.ts` — targets `gantt-bar.model`, moved alongside it
- `ui/gantt-bars.component.ts` (+ spec), `ui/orders-rail.component.ts`,
  `ui/production-scale-controls.component.ts` (+ spec) — dumb UI
- `production-cockpit.context.ts` (lib root) — **not explicitly named in the TZ's
  move list**, but `orders-rail.component.ts` does `inject(ProductionCockpitContext)`
  directly (not via `@Input`), so leaving it in the app would create a
  lib→app import the moment `orders-rail` moved. Moved it too; same
  reasoning as A1's unlisted-but-necessary `gantt-bars.constants.ts`.
- `production-read.facade.ts` (+ spec), `production-cockpit.facade.ts`,
  `gantt-bars.facade.ts` (lib root, per WAVE-MAP target layout)

New barrels: `util/index.ts`, `ui/index.ts`, `production/index.ts` (matches
the `doc-studio` barrel pattern exactly). New tsconfig path
`@kppdf/features/production` → `libs/features/src/lib/production/index.ts`.

Stayed in app (per TZ item 3, "page stays in app"): `production-cockpit.page.ts`
+ its 2 specs — imports switched to the new barrel; `ShellToolRailService`
wiring untouched.

`app.routes.ts` updated: `ProductionReadFacade` import switched from the old
relative path to `@kppdf/features/production`.

### Bundle-size regression found and fixed mid-TZ

First build after the move showed the initial bundle jump from 503 kB to
650 kB (+147 kB over the pre-existing 3 kB-over-budget baseline). Root cause:
`app.routes.ts`'s `providers: [ProductionReadFacade]` on the `/production`
route requires an **eager** (non-lazy) import for that class — but importing
it via the `@kppdf/features/production` barrel also eagerly pulled in
`export * from './ui'` (the whole Gantt component tree, meant to load only
with the lazy page). Confirmed via the built output: `main-*.js` had a
static `import` of the chunk containing `gantt-bars.component.ts`'s markup.

Fix: added a second, narrow tsconfig path
`@kppdf/features/production/production-read.facade` →
`libs/features/src/lib/production/production-read.facade.ts` (same
multi-subpath-per-file pattern `@kppdf/data-access` already uses for
`/auth`, `/capabilities`, `/admin`) and pointed `app.routes.ts` at it
instead of the full barrel. Rebuilt: bundle back to the original 503.37 kB /
3.37 kB-over-budget baseline — confirmed byte-for-byte the same warning as
before this TZ.

Also confirmed `ProductionReadFacade` could **not** move to
`production-cockpit.page.ts`'s own `@Component({ providers: [...] })` (the
more obvious fix): both page specs override it via a fake at the **TestBed
module level**, which only works because the component itself does not
declare it as an own provider — a component-level provider would shadow the
module-level test override and break both specs' fakes.

## Acceptance

- [x] Specs green (production + gantt patterns)
- [x] `rg apps/kppdf-web libs/features/src/lib/production` → 0 (verified: no stale relative imports left in the app referencing old production paths)
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal relocation, no route/permission/behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; `/production` route path and capability unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change)
- [x] DOMAIN-MAP — N/A (module boundary moved, not the domain/route/page contour — `/production` still resolves to the same page)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: libs/features/src/lib/production/**, frontend-nx/tsconfig.base.json, apps/kppdf-web/src/app/pages/production/**, apps/kppdf-web/src/app/app.routes.ts + this checklist/tracker/task marker)
- [x] Coupling map — N/A
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from A3 closure
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0, initial bundle back to the pre-existing 503.37 kB baseline (last gate below)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec tsc -p libs/features/tsconfig.lib.json --noEmit` → PASS (0 errors)
- `pnpm architecture:check` → PASS (1499 files; baseline 17; 2 resolved since baseline)
- `cd frontend-nx && pnpm exec nx test features` → PASS (19/19 suites, 226/226 tests — incl. all 5 moved production specs)
- `cd frontend-nx && pnpm exec nx test kppdf-web` → PASS (2 consecutive clean runs: 112/112 suites, 766/773 tests, 7 skipped, 0 failed; one earlier run reported a transient 3-test shortfall with no FAIL line — not reproduced across 2 reruns, treated as environment flake, not a regression)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; initial bundle 503.37 kB, 3.37 kB over the pre-existing budget — same as before this TZ, confirming the bundle-size regression was fully fixed)

## Executor report

Что сделано: перенёс весь Stream A production-код (facades, context, pure
util, dumb UI, специфицированные и не специфицированные, но обязательные —
`production-cockpit.context.ts` — зависимости) в
`libs/features/src/lib/production/` по образцу DocStudio Editor Decomp
(util/ui/root-facades + barrel `index.ts` на каждом уровне). Страница
осталась в app, импортирует всё через новый barrel
`@kppdf/features/production`.

По ходу нашёл и исправил регресс объёма initial-бандла (+147 kB), вызванный
eager-импортом всего barrel'а в `app.routes.ts` ради одного класса
(`ProductionReadFacade`, обязан жить вне компонента ради testbed-override) —
решение: узкий доп. tsconfig path `@kppdf/features/production/production-read.facade`
по тому же паттерну, что уже применён у `@kppdf/data-access/*`.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: нет.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
