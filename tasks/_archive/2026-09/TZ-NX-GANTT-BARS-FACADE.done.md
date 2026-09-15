# TZ-NX-GANTT-BARS-FACADE: Extract GanttBarsFacade in-place

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (6/6)
  - typecheck: PASS
  - tests: PASS (kppdf-web full run 117/117 suites, 840/847, 7 skipped, 0 failed — incl. gantt-bars.component, gantt-bar.model, gantt-workers-view, production-cockpit.page, production-cockpit.page.write)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - checklist: docs/agent-checklists/TZ-NX-GANTT-BARS-FACADE.md
  - commit: 0b05d437
  - status synchronization: PASS (WAVE-MAP.md status unchanged/still tracks whole pack; tracker + _NOW.md updated)

## Root cause

`gantt-bars.component.ts` (~2.5k LOC) mixed thin host concerns (Angular
inputs/outputs/template) with drag/resize interaction sessions, row-model
computed state and Angular-free pure helpers — hard to extend without
touching unrelated geometry/behavior. B1 Stream A target: Facade + dumb UI
pattern, same as the DocStudio Editor Decomp precedent.

## Fix

Mechanical extract, no behavior change:
- `blocks/gantt-bars.facade.ts` (new) — Signals, drag/resize interaction
  sessions, row-model computed helpers, moved as-is from the component class.
- `blocks/gantt-bars.constants.ts` (new) — Angular-free constants/types/pure
  helpers shared by component and facade (split out to avoid a circular
  value-import between them; component still re-exports everything so
  external imports like the spec's `GANTT_PX_PER_DAY` and the cockpit
  page's `Gantt*Commit` types keep resolving unchanged).
- `gantt-bars.component.ts` — thin host: `providers: [GanttBarsFacade]`,
  `protected readonly facade = inject(GanttBarsFacade)`, template wiring via
  a `GanttBarsFacadeHost` bind object. Public `@Input`/`@Output` contract
  stable. `ProductionReadFacade` untouched.

Note: this TZ's code was already written by a prior session that did not
reach Claim/gates/commit before stopping (handoff doc incorrectly reported
"0/6, code not started"). This closure resumed and verified that work rather
than re-implementing it — confirmed no leftover drag/session state in the
component (`signal(`/`computed(` calls only via `this.facade.*`), AC intact,
gates green.

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts` (1288 LOC → thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.facade.ts` (new)
- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.constants.ts` (new, PARK: full move to `@kppdf/features/production/util` is the successor's job)
- `docs/agent-checklists/TZ-NX-GANTT-BARS-FACADE.md` (new)

## Successor

`TZ-NX-GANTT-BARS-UTIL-UI` (A2) — fold `gantt-bars.constants.ts` into
`gantt-bar.model.ts`/util where still duplicated, optional thin
presentational extracts without behavior change.
