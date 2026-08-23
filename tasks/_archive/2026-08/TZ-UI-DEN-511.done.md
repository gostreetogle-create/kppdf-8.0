ARCHIVE_MARKER
task_id: TZ-UI-DEN-511
outcome: DONE
closed_at: 2026-08-23T15:32:00+03:00
agent_id: executor-subagent
spec: tasks/_backlog/ui-density/TZ-UI-DEN-511-page-chrome-density.md

verification:
  - typecheck: PASS
  - lint: PASS (scoped)
  - tests: PASS (pi-page-chrome.component.spec.ts)

## Density applied

- Chrome block: `pi-edge-bleed py-2 hairline-b mb-2`
- Breadcrumbs: `text-xs` (12px meta)
- H1: `text-lg` max (18px)
- Description: `text-xs`

## Files changed

- `frontend/src/app/shared/page/pi-page-chrome.component.ts`
- `frontend/src/app/shared/page/pi-page-chrome.component.spec.ts` (new)
- `docs/pages/page-chrome.md`

## Out of scope (honored)

- KP workspace chrome (DEN-552)
- Gantt header inside production
