# TZ-NX-GANTT-SORT-MANUAL checklist

> Status: **DONE**
> Marker: archived from `tasks/_active/TZ-NX-GANTT-SORT-MANUAL.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T04:34:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] Branch `main`; prior commits `ccc89114`, `e1b6e2d9`; no competing active task.
- [x] Sort TZ, production page doc, model/context/facade/Gantt controls and specs read.
- [x] Baseline inherited: `nx build kppdf-web` PASS.
- [x] Claim slot filled before code.

### Preflight Check Output
- **Context read:** `tasks/_ready/2026-09-15-gantt-workers-dark/TZ-NX-GANTT-SORT-MANUAL.md`, `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`, `frontend-nx/libs/features/src/lib/production/production-cockpit.context.ts`, `frontend-nx/libs/features/src/lib/production/production-cockpit.facade.ts`, `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.ts`, `docs/pages/production-cockpit.page.md`
- **Key Constraints:** default № заказа; date sort opt-in; compact control in legend row; no BE sort, priority sort, drag reorder, wash/token changes.
- **Planned Deliverable:** sort signal, order-tree rank, compact select, regression specs/docs, gates.
- **Validation Path:** model/Gantt tests, app typecheck, features lint baseline, final app build.

## Acceptance

- [x] Default order groups sort by `orderNumber` with stable `orderId` tie-break.
- [x] Date sorting remains available as opt-in and preserves the former order.
- [x] Compact `data-test="gantt-sort-mode"` control appears beside the legend in orders mode and emits changes without reload.
- [x] Worker grouping and backend/API behavior unchanged.

## Integrity slot

- [x] Type: page/UI behavior.
- [x] `docs/pages/production-cockpit.page.md` updated with the new default and opt-in mode.
- [x] PAGE-TZ-INDEX not staged: it contains unrelated pre-existing dirty WIP in the same production row.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no route, permission, section-status, or shared-domain field change.
- [x] Foreign WIP excluded; only owned sort paths staged.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Gates (fact)

- `cd frontend-nx && pnpm exec jest --config libs/features/jest.config.ts --runInBand libs/features/src/lib/production/util/gantt-bar.model.spec.ts libs/features/src/lib/production/ui/gantt-bars.component.spec.ts libs/features/src/lib/production/util/gantt-workers-view.spec.ts` — PASS, 3 suites / 66 tests.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `cd frontend-nx && pnpm exec nx lint features` — baseline FAIL: existing intra-library boundary errors (28 errors / 212 warnings); no new owned error.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; final gate, existing Angular/budget warnings only.

## Executor report

Added stable order-number sorting as the default, retained plan-date sorting as an opt-in mode, wired it through context/facade/page, and added a compact legend-adjacent select plus model/UI regression coverage. No BE/API or dark palette changes.

## Closeout

- [x] Archive + lock + live state + active-marker removal completed.
- [x] Status DONE.
- closed_at: 2026-09-16T04:40:00Z
