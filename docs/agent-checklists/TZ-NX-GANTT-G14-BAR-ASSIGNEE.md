# TZ-NX-GANTT-G14-BAR-ASSIGNEE checklist

> Status: **DONE** (scope: G14-FE only; G14-BE already DONE)
> Marker: `tasks/_active/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md`
> Commit/push: continuous executor on `main`, per `docs/GIT-POLICY.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-05T11:54:47+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI in this session)

## Preflight

- [x] Read `docs/how-to-connect-ai.md`, `GEMINI.md`, `docs/PROJECT-MEMORY.md`, `docs/PO-CANON.md`
- [x] Read `docs/agent-checklists/_NOW.md` and all active tasks; only Claude G14 BE marker existed, with disjoint backend keys
- [x] Read FE TZ, `WAVE-NX-GANTT-ASSIGN.md`, `docs/pages/production-cockpit.page.md`, FIC, and DOCS-INTEGRITY
- [x] Claim slot filled; Status = CLAIMED / IN PROGRESS
- [x] FE marker is present in `tasks/_active/`

### Preflight Check Output

- **Context read:** `frontend-nx/apps/kppdf-web/src/app/pages/production/production-read.facade.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/production/gantt-bar.model.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/production/blocks/gantt-bars.component.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/production/production-cockpit.page.ts`, `frontend-nx/libs/data-access/src/lib/sales/order.types.ts`, `frontend-nx/libs/data-access/src/lib/sales/pi-orders.service.ts`, `frontend-nx/libs/data-access/src/lib/people/person.types.ts`, `frontend-nx/libs/data-access/src/lib/people/pi-people.service.ts`
- **Key Constraints:** FE-only; skills are `Worker.workTypeIds`; empty override is `Не назначен`; no auto-assign, drag-between-workers, backend edits, Studio/Data IA, Deals, or legacy delete
- **Planned Deliverable:** typed order override client; override-derived facade labels; skill-filtered worker multi-select/save/refresh; worker grouping; `/registries/workers` CTA; production docs
- **Validation Path:** FE focused Jest/DOM tests, app typecheck, changed-file lint, diff check, final `pnpm exec nx build kppdf-web`; fill Integrity slot, archive and lock

## Acceptance

- [x] `estimateWorkerOverrides[]` is typed and `PATCH /orders/:id/estimate-worker` is available in NX data-access
- [x] Facade label uses override worker names and otherwise returns `Не назначен`
- [x] Work-detail shows active skill candidates, supports multi-select, saves once via PATCH, and refreshes bars
- [x] Assignment is order/item/module/work-type scoped; another order without override remains unassigned
- [x] `По рабочим` reflects the saved override-derived label after refresh
- [x] Unassigned banner and work-detail people link to `/registries/workers`
- [x] No backend or Studio files changed

## Integrity slot (before READY/archive)

- [x] Type: module/API-client + page behavior (FE only)
- [x] FIC §A–E: N/A for new route/permission/module/MCP; existing `/production` and `/registries/workers` routes reused
- [x] `docs/pages/production-cockpit.page.md` updated with skill vs assignment contract
- [x] `SECTION-READINESS.md`: N/A; no user contour/route/capability change
- [x] Foreign WIP excluded; conflict keys remain FE-only
- [x] `docs/COUPLING-MAP.md`: N/A; assignment is an existing Order field and no status/filter meaning changes
- [x] Canon: `docs/DOCS-INTEGRITY.md`

## Build integrity

- [ ] Baseline `pnpm exec nx build kppdf-web` before code: not run in this claim; existing recent G14/R3 builds were green
- [x] No other active task claims `frontend-nx/apps/kppdf-web/src/**` after FE handoff
- [x] Closing `pnpm exec nx build kppdf-web` was the last gate command, exit 0

## Gates (fact)

- Focused tests: PASS (`4 app suites / 35 tests`; `data-access` target 18 suites / 89 tests, exit 0)
- Typecheck: PASS (`pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`, exit 0)
- Lint: PASS on changed FE files, 0 errors (43 existing warnings)
- Diff check: PASS (exit 0)
- Final NX build: PASS (`pnpm exec nx build kppdf-web`, exit 0; known Studio nullish-coalescing and Gantt style-budget warnings only)

## Executor report

- G14-FE complete; final commit SHA is recorded in the archive after amend (`b7846193`).
- Conflict disclosure: Claude’s G14-BE and Studio/Data IA work are excluded; dirty workspace files are not owned by this task.

## Closeout

- [x] Integrity slot complete
- [x] Archive + lock + live wave status update
- [x] Remove `tasks/_active/TZ-NX-GANTT-G14-BAR-ASSIGNEE.md`
- [x] Selective commit + push
- [x] Record final SHA
