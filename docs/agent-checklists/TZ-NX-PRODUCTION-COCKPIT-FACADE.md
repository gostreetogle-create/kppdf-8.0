# TZ-NX-PRODUCTION-COCKPIT-FACADE checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-PRODUCTION-COCKPIT-FACADE.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot (ОБЯЗАТЕЛЬНО до кода)

- agent_id: claude
- claimed_at: 2026-09-15T02:53:25Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI configured in this workspace)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — пусто до claim (A1+A2 archived)
- [x] TZ / канон / deps прочитаны (`TZ-NX-PRODUCTION-COCKPIT-FACADE.md`, depends on A2 archived `94c4adb8`)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-PRODUCTION-COCKPIT-FACADE.md` на месте

## What changed

Created `production-cockpit.facade.ts` (`@Injectable()`, component-scoped via
`providers: [ProductionCockpitContext, ProductionCockpitFacade]`, not root).
Moved from `production-cockpit.page.ts` **as-is** (same property/method
names, same DI token names, verbatim bodies — a mechanical cut, not a
rewrite):

- State: `orders`, `bars`, `unassignedGanttWork`, `rangeStart`, `rangeEnd`,
  `usedTodayFallback`, `readOnly`, `groupBy`, `workerLabels`,
  `workerCandidates`, `workerAssignmentSaving`, `orderThumbs`,
  `orderIdHint`, `fromDesk`/`returnOrderId`/`returnLink`, `scrollRequest`,
  `scrollNonce`, `ganttWriteInFlight`, `leftTool` + `lastToolButton`.
- Computed: `canEditOrder`, `canEditCatalog`, `metaHighlightOrderId`,
  `noGanttOrderIds`, `orderMetaView`.
- Methods: all write handlers (`onEstimateDaysCommit`,
  `onPlannedDateMoveCommit`, `onStartOffsetCommit`,
  `onWorkerAssignmentCommit`, `onOrderMetaCommit`), optimistic
  apply/restore/persist (`beginGanttOptimistic`, `restoreGanttSnapshot`,
  `persistGanttPatch`), left-tool flyout (`toggleLeftTool`, `closeFlyouts`,
  `rememberToolButton`), selection (`onSelect`, `onSelectAll`,
  `onOrderLabelClick`, `onMainClick`, `onDismissCanvas`, `onToggleExpand`,
  `onToggleWorkDetail`), refresh/load orchestration (`bootstrap`,
  `loadThumbs`, `applyInitialOrderId`, `warnIfIneligible`,
  `reloadOrdersKeepingSelection`, `applyFilteredActive`, `applyBars`,
  `onRefresh`, `onToday`, `onFitHorizon`, `requestTimelineScroll`,
  `refitRangeAfterShift`, `handleBarsAfterShift`), plus the 6 pure top-level
  date helpers (`addDays`, `dayDiffDateOnly`, `minDate`, `maxDate`,
  `defaultRangeStart`, `defaultRangeEnd`, `toDateInput`) and the
  `ProductionLeftTool` type (now exported from the facade).
- Constructor: `queryParamMap` subscribe (deep-link `fromDesk`/`returnOrderId`)
  + `destroyRef.onDestroy(() => facade.clearCaches())` + `bootstrap()` call —
  moved verbatim; `inject(DestroyRef)` inside a component-scoped
  `@Injectable()` resolves to the same component lifecycle (same pattern as
  `GanttBarsFacade` from A1), so teardown timing is unchanged.

Kept on the page (chrome-only, per TZ: "ShellToolRail wiring stays on page
calling facade"):
- `ctx = inject(ProductionCockpitContext)` (unchanged — not merged/mirrored,
  it's a separate SoT the facade also injects and calls).
- `facade = inject(ProductionReadFacade)` (unchanged, still used directly in
  the template for `facade.state().error`/`.loading`).
- `cockpit = inject(ProductionCockpitFacade)` (new) + thin readonly aliases
  for every facade-owned signal/computed the template or specs read
  directly (e.g. `protected readonly bars = this.cockpit.bars;`) — same
  object references, so `.set()` calls already in the template
  (`groupBy.set($event)`) keep working unchanged.
- `syncShellTools()` (uses `ShellToolRailService`, a page/chrome concern) and
  the `effect()` that drives it.
- `@HostListener('document:keydown.escape') onEscape()` (decorators only
  work on the component class) — body now calls `this.cockpit.closeFlyouts()`.
- All template-bound handler methods stayed as same-named `protected`
  one-line delegates to `this.cockpit.xxx(...)` (matches the A1
  `GanttBarsComponent` convention) — template markup itself is **byte-for-byte
  unchanged**.

Not moved / not merged: `ProductionReadFacade` (read-only contract intact,
per hard rule); `ProductionCockpitContext` (kept as-is — it does not mirror
facade signals, it owns a genuinely separate concern, so TZ's "prefer facade
as SoT if context only mirrors" branch didn't apply; no drive-by rewrite).

Page: 909 → 422 LOC (includes the unchanged ~230-line template+styles
block). New facade: 615 LOC.

## Acceptance

- [x] Page thin; cockpit facade owns write queue/optimistic paths that lived on page
- [x] Specs: `production-cockpit.page.spec.ts`, `production-cockpit.page.write.spec.ts`, `production-read.facade.spec.ts`, gantt* still green
- [x] nx build last 0

## Integrity slot (до READY / archive)

- [x] Тип изменения определён: **other** (internal refactor, no route/permission/UI-behavior change)
- [x] FIC §A–E — N/A (no new page/permission/module/MCP surface; template markup unchanged)
- [x] page.md / PAGE-TZ-INDEX — N/A (no UI/route change, `/production` page external behavior unaffected)
- [x] DOMAIN-MAP — N/A (no module/route/page contour change)
- [x] SECTION-READINESS — N/A
- [x] Чужой WIP не в коммите; conflict keys соблюдены (staged only: production-cockpit.page.ts, production-cockpit.facade.ts (new) + this checklist/tracker/task marker)
- [x] Coupling map — N/A (no shared status/FK field touched)
- [x] Канон: docs/DOCS-INTEGRITY.md — reviewed, N/A items justified above

## Build integrity (обязательно для frontend-nx / kppdf-web)

- [x] Baseline до кода: build green from A2 closure (no code changed in A2, A1 build confirmed green)
- [x] Нет другого `tasks/_active/*` с `apps/kppdf-web/src/**` — verified empty before claim
- [x] Закрытие: `nx build kppdf-web` → exit 0 (last gate below)

## Gates (факт)

- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` → PASS (0 errors)
- `cd frontend-nx && pnpm exec nx test kppdf-web --testPathPattern="production|gantt"` → PASS (pattern matched broadly per nx/jest quirk; full run: 117/117 suites, 840/847 passed, 7 skipped, 0 failed — incl. `production-cockpit.page.spec.ts`, `production-read.facade.spec.ts`, gantt*)
- `npx jest --config apps/kppdf-web/jest.config.ts production-cockpit.page.write.spec.ts` → PASS (isolated re-run: 8/8 tests, confirms the write-path delegate wiring explicitly)
- `cd frontend-nx && pnpm exec nx build kppdf-web` → PASS (exit 0; pre-existing unrelated budget/NG8102 warnings only)

## Executor report

Что сделано: механически вынес весь write/UI-оркестрационный код
`ProductionCockpitPage` в новый `ProductionCockpitFacade` (Signals,
optimistic PATCH-пути, left-tool flyout state, bootstrap/refresh) — без
изменения поведения, без изменения template markup, без слияния с
`ProductionReadFacade` и без переписывания `ProductionCockpitContext`.
Страница осталась тонким host: chrome (ShellToolRail, Escape) + one-line
delegate-методы для каждого template-bound обработчика + readonly-алиасы
на facade-сигналы для шаблона и для write-spec, читающего
`fixture.componentInstance.bars()`/`.rangeEnd()`/`.scrollRequest()` напрямую.

Conflict disclosure: не относящиеся к этому TZ uncommitted файлы в дереве
(studio/docs/audits/data) не трогал.

Known limits: `production-cockpit.facade.ts` пока живёт в
`apps/kppdf-web/.../pages/production/` (не в `libs/features`) — перенос в
`@kppdf/features/production` запланирован в A4
(`TZ-NX-PRODUCTION-TO-FEATURES`), не здесь.

## Review handoff

- [x] READY FOR REVIEW — N/A (DoD = gates green, no separate review gate)

## Closeout (после PASS)

- [x] archive + lock + progress + удалить `_active`
- [x] Status = DONE
- closed_at: 2026-09-15
