# TZ-NX-SUPPLY-TASK-UNCONFIRM: откат случайного «Подтвердить»

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-13
closed_by: claude
verification:
  - acceptance criteria: PASS (5/5)
  - typecheck: PASS (BE + FE tsc)
  - tests: PASS (BE 136/1357 was 1353; FE kppdf-web 125/900+7skip/907 was 904; FE data-access 25/134 was 133)
  - lint: PASS (0 problems, 6 scoped files)
  - architecture:check: PASS
  - nx build kppdf-web: PASS (last gate)
  - live browser/curl evidence: PASS (full UI round-trip; 400 rejection via curl)
  - checklist: `docs/agent-checklists/TZ-NX-SUPPLY-TASK-UNCONFIRM.md` + evidence/
  - status synchronization: PASS (WAVE-2026-09-13-SUCCESSORS.md updated)

## Root cause / finding

`SupplyTask` status transitions (`draft→confirmed→ordered→received`) were
strictly one-way — an accidental «Подтвердить» click had no path back before
placing an order with a supplier.

## Fix

`STATUS_FLOW['confirmed']` gained a `'draft'` edge; new
`SupplyTaskService.unconfirm()` reuses the existing `assertTransition` guard,
clears `confirmedBy`/`confirmedAt`; new `POST /supply-tasks/:id/unconfirm`
route. FE: new "В черновик" button on `confirmed` rows
(`data-test="supply-unconfirm-…"`); "Подтвердить" now opens the existing
`AlertDialogComponent` (same pattern as `confirmDirtyClose`) instead of
calling the API directly on click.

## Files changed

- `backend/src/modules/supply/supply-task.service.ts` (+ `.spec.ts`)
- `backend/src/modules/supply/supply-task.controller.ts`
- `frontend-nx/libs/data-access/src/lib/supply/pi-supply-tasks.service.ts` (+ `.spec.ts`)
- `frontend-nx/apps/kppdf-web/src/app/pages/supply/supply.page.ts` (+ `.spec.ts`)
- `docs/pages/supply.page.md`
- `docs/agent-checklists/TZ-NX-SUPPLY-TASK-UNCONFIRM.md` + `evidence/TZ-NX-SUPPLY-TASK-UNCONFIRM.txt` (new)
