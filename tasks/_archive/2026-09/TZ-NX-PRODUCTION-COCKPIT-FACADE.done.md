# TZ-NX-PRODUCTION-COCKPIT-FACADE: Cockpit write/UI facade (keep ReadFacade)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-15
closed_by: claude
verification:
  - acceptance criteria: PASS (3/3)
  - typecheck: PASS
  - tests: PASS (kppdf-web full run 117/117 suites, 840/847, 7 skipped, 0 failed; production-cockpit.page.write.spec.ts re-verified in isolation 8/8)
  - nx build kppdf-web: PASS (last gate, exit 0)
  - checklist: docs/agent-checklists/TZ-NX-PRODUCTION-COCKPIT-FACADE.md
  - commit: d8a4aeff
  - status synchronization: PASS (tracker + _NOW.md updated)

## Root cause

`production-cockpit.page.ts` (~910 LOC) owned selection/expand delegation,
all optimistic Gantt writes, left-tool flyout state, and initial-load/refresh
orchestration directly on the component — same god-component pattern as A1's
`gantt-bars.component.ts`, blocking the eventual `libs/features` move (A4).

## Fix

Mechanical extract, no behavior change: created
`production-cockpit.facade.ts` (`@Injectable()`, component-scoped via
`providers: [ProductionCockpitContext, ProductionCockpitFacade]`) and moved
every write handler, the optimistic apply/restore/persist trio, left-tool
flyout state, and bootstrap/refresh orchestration into it verbatim (same
property/method names — a cut, not a rewrite). `ProductionReadFacade` stays
untouched as the separate read-only model; `ProductionCockpitContext` stays
untouched as the separate selection/expand/filter SoT (it does not mirror
facade state, so the TZ's "prefer facade as SoT if context mirrors it"
branch did not apply — kept, no drive-by rewrite).

The page keeps only chrome: `ShellToolRailService` wiring (`syncShellTools`),
the `@HostListener` Escape handler, and thin one-line delegate methods for
every template-bound handler (matching the A1 `GanttBarsComponent`
convention) plus readonly aliases for facade signals so the template and the
write-spec's direct `fixture.componentInstance.bars()` /
`.rangeEnd()` / `.scrollRequest()` reads keep working unchanged. Page
909 → 422 LOC (includes an unchanged ~230-line template+styles block).

## Files changed

- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts` (909 → 422 LOC, thin host)
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.facade.ts` (new, 615 LOC)
- `docs/agent-checklists/TZ-NX-PRODUCTION-COCKPIT-FACADE.md` (new)

## Successor

`TZ-NX-PRODUCTION-TO-FEATURES` (A4) — relocate the Stream A files
(`gantt-bars.component.ts` + facade + constants, `production-cockpit.facade.ts`
+ optionally `production-read.facade.ts`) into `libs/features/src/lib/production/`.
