# TZ-NX-GANTT-WORKERS-EMPTY-STATE checklist

> Status: **DONE**
> Marker: archived from `tasks/_active/TZ-NX-GANTT-WORKERS-EMPTY-STATE.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T04:31:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] Branch `main`; prior TZ `ccc89114` committed; no competing active task.
- [x] Empty-state TZ, audit, production page doc, current Gantt component/facade/specs read.
- [x] Baseline inherited and final build passed.
- [x] Claim slot filled before code.

### Preflight Check Output
- **Context read:** `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.ts`, `frontend-nx/libs/features/src/lib/production/gantt-bars.facade.ts`, `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.spec.ts`, `docs/audits/2026-09-15-gantt-workers-unassigned-void.md`, `docs/pages/production-cockpit.page.md`
- **Key Constraints:** workers-only hint; honest state; no fake rows; preserve range/zoom; no palette changes.
- **Planned Deliverable:** derive named-worker presence; render hint; stretch calendar track; add focused coverage; close gates.
- **Validation Path:** Gantt component/worker specs, app typecheck, features lint baseline, final app build.

## Acceptance

- [x] Workers-only-unassigned state shows `data-test="gantt-workers-empty-hint"` with a truthful People route hint.
- [x] Calendar track and pane have viewport min-height so the day-grid wash continues below short trees.
- [x] No fake worker rows; zoom/fit behavior unchanged.

## Integrity slot

- [x] Type: page/UI behavior.
- [x] `docs/pages/production-cockpit.page.md` updated; `PAGE-TZ-INDEX` was already dirty from prior WIP and was not staged.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no route, permission, section-status, or shared-domain field change.
- [x] Foreign WIP excluded; only owned Gantt component/facade/spec/docs staged.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Gates (fact)

- `cd frontend-nx && pnpm exec jest --config libs/features/jest.config.ts --runInBand libs/features/src/lib/production/ui/gantt-bars.component.spec.ts libs/features/src/lib/production/util/gantt-workers-view.spec.ts` — PASS, 2 suites / 16 tests.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `cd frontend-nx && pnpm exec nx lint features` — baseline FAIL: existing intra-library boundary errors (28 errors / 209 warnings); no new owned error.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; final gate, existing Angular/budget warnings only.

## Executor report

Added a computed named-worker presence signal, an honest workers empty hint, and viewport-stretch CSS for the calendar wash. Updated production page docs and focused component coverage. No fake rows, palette changes, React/Pro assets, backend, or unrelated WIP touched.

## Closeout

- [x] Archive + lock + live state + active-marker removal completed.
- [x] Status DONE.
- closed_at: 2026-09-16T04:32:00Z
