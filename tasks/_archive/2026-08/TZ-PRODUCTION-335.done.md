# TZ-PRODUCTION-335.done — Gantt sort by start + clean order-meta strip

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-15
closed_by: cursor-grok-4.6-executor
TZ: TZ-PRODUCTION-335
WAVE: WAVE-PRODUCTION-COCKPIT-POLISH successor (sort + meta)
DEP: TZ-PRODUCTION-333

verification:
  - acceptance criteria: PASS
  - typecheck: PASS
  - tests: PASS (FE gantt-bar.model + gantt-bars + production-cockpit + orders-rail)
  - lint: PASS (owned files; pre-existing OnInit warning)
  - checklist: ADDED
  - progress.md: UPDATED
  - status synchronization: PASS

## Outcome

- `buildGanttTreeBars` sorts order groups by summary `startDate` ascending, tie-break `orderNumber` (not priority). After optimistic plannedDate drag (333), vertical order updates without reload.
- Rail uses the same order via `compareOrdersByPlanStart` at the end of `filterOrdersForRail`.
- Meta strip: `Статус заказа` / `Важность` / `Начало плана`; removed «После сохранения Гант обновится» and «Сохранить заказ»; auto-save on change; silent optimistic PATCH like 333; keep «Открыть в списке заказов».
- Plan-vs-fact catalog prompts not implemented (parked in page.md known_limitation).

## Verification

- `frontend` `tsc -p tsconfig.app.json --noEmit`: PASS
- `frontend` jest gantt-bar.model + gantt-bars + production-cockpit + orders-rail: PASS — 85 tests
- eslint owned files: PASS (1 pre-existing OnInit warning)
- deploy: NOT RUN (PO: no deploy)

## Files

- `frontend/src/app/pages/production/gantt-bar.model.ts`
- `frontend/src/app/pages/production/gantt-bar.model.spec.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend/src/app/pages/production/production-cockpit.page.ts`
- `frontend/src/app/pages/production/production-cockpit.page.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/PAGE-TZ-INDEX.md`

## Lock

`.mimocode/locks/TZ-PRODUCTION-335-gantt-sort-meta-clean.lock`
