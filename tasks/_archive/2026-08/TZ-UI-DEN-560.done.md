ARCHIVE_MARKER
task_id: TZ-UI-DEN-560
outcome: DONE
closed_at: 2026-08-23T15:20:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-560-production-chrome-density.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped changed files)
  - tests: PASS (production-cockpit.page | production-scale-controls | orders-rail | gantt-bars — 96/96)

## Density applied

- Gantt studio header/toolbar: `bg-paper`, hairline bands, `text-[13px]`, compact toolbar buttons `h-8`
- Filters flyout (`orders-rail`): `pi-label` + compact `pi-input` (`h-8`, 13px), compact reset CTA
- Unassigned/warning banners: amber via `text-hint-warn` on paper — no tinted panels, no shadows
- Cockpit flyouts: `bg-paper-raised`, shadow removed
- Status bars (error/hint/desk-return): 13px on paper

## Files changed

- `frontend/src/app/pages/production/blocks/production-scale-controls.component.ts`
- `frontend/src/app/pages/production/blocks/production-scale-controls.component.spec.ts`
- `frontend/src/app/pages/production/blocks/orders-rail.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts` (chrome bands only)
- `frontend/src/app/pages/production/production-cockpit.page.ts`

## Out of scope (honored)

- Gantt bar colors / nest tint ladder (PRODUCTION-349…352)
- Gantt drag/resize behavior
- workspace/**
