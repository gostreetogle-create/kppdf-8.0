# TZ-COMBINE-413.done — Комбайн: DnD без двойника + модуль в диалоге

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T23:20:00+03:00
closed_by: gemini-executor-combine-413 (kppdf-executor-loop)
TZ: TZ-COMBINE-413
WAVE: WAVE-COMBINE-PRODUCT-ROWS
DEP: COMBINE-414 DONE
Cursor_verdict: N/A (TZ does not require review gate)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm exec jest dashboard.page.spec + dashboard-dialog.service.spec` — 33/33)
  - checklist: DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (forbidden)

## Outcome

- Module + «целиком» chips: solid opaque CDK preview (`combine-chip-drag-preview`), `.cdk-drag-placeholder { opacity: 0 }`, softened drop animating.
- Lane PATCH / freeze / ship gates unchanged.
- Module pencil → `DashboardDialogService.openModuleEdit` (ModuleFormDialog); stay on `/design/combine`; afterClose reloads orders.
- Page + method docs updated; known_limitation: CDK always uses preview+placeholder.

## Critical files

- `frontend/src/app/pages/dashboard/dashboard.page.ts`
- `frontend/src/app/pages/dashboard/dashboard.page.spec.ts`
- `frontend/src/app/shared/services/dashboard-dialog.service.ts`
- `frontend/src/app/shared/services/dashboard-dialog.service.spec.ts`
- `docs/pages/design-combine.page.md`
- `docs/methods/combine-product-row-kanban.md`

## Lock

`.mimocode/locks/TZ-COMBINE-413-combine-dnd-no-jump.lock`
