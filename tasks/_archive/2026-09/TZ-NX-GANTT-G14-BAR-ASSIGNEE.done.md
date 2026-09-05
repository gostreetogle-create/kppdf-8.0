# TZ-NX-GANTT-G14-BAR-ASSIGNEE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: freebuff

## Outcome

G14-FE completes the NX Gantt assignment path on top of the already-landed G14-BE (`73b1a09b`). Order payloads now carry typed `estimateWorkerOverrides[]`, the NX orders client calls `PATCH /orders/:id/estimate-worker`, and the Gantt facade derives assignee labels only from the order-scoped override. Worker `workTypeIds[]` remains a skill/candidate filter and no longer auto-assigns people to every matching order.

The inline work-detail offers active workers with the selected Work Type skill, supports multi-select chips/checkboxes, saves the composite assignment, and refreshes bars and `По рабочим`. Empty assignments render `Не назначен`. The Gantt banner and work-detail people link to `/registries/workers`. The superseded G13 link tail is covered in this FE change; no separate G13 archive was created.

## Acceptance

- AC1: assignment is scoped to order/item/module/work type; another order without an override remains `Не назначен` — PASS (facade regression).
- AC2: assignment save uses the FE client and refreshes orders/bars, including worker grouping — PASS (page write regression and existing worker grouping coverage).
- AC3: candidates default to active workers with the Work Type skill; opening the panel does not auto-write — PASS (facade/component regressions).
- AC4: focused FE tests and NX build gates — PASS.
- Studio/Data IA, Deals, backend, legacy delete, and drag-between-worker behavior were not changed.

## Verification

- focused app tests: PASS (4 suites / 35 tests, exit 0)
- data-access test target: PASS (18 suites / 89 tests, exit 0)
- typecheck: PASS (`cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- lint: PASS on changed FE files, 0 errors; 43 existing warnings
- diff check: PASS (exit 0)
- final build: PASS (`cd frontend-nx && pnpm exec nx build kppdf-web`, exit 0)
- known warnings: existing Studio nullish-coalescing warning and existing Gantt style-budget warning
- page docs: UPDATED (`docs/pages/production-cockpit.page.md`, `docs/pages/people.page.md`)
- checklist: UPDATED with Claim, Preflight, Integrity, gates, and closeout evidence
- wave state: G14-FE and superseded G13 link coverage marked complete in `docs/agent-checklists/WAVE-NX-GANTT-ASSIGN.md`
- integrity: PASS; existing routes/capabilities reused, no new permission or route

## Changed scope

- `frontend-nx/libs/data-access/src/lib/sales/order.types.ts`
- `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`
- `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/gantt-bar.model.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-read.facade.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-read.facade.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.spec.ts`
- `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.write.spec.ts`
- `docs/pages/production-cockpit.page.md`
- `docs/pages/people.page.md`
- `docs/agent-checklists/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md`
- `docs/agent-checklists/WAVE-NX-GANTT-ASSIGN.md`
- `tasks/_archive/2026-09/TZ-NX-GANTT-G14-BAR-ASSIGNEE.done.md`

## Known limits

- Browser smoke was not run; DOM-backed Angular tests and the production build passed.
- Worker candidate list is bounded by the existing `limit: 100` API contract.
- Existing unrelated workspace changes and Claude’s Studio/Data IA work remain outside the commit.

## Commit

f3813dd1
