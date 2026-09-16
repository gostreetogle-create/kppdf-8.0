# TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND checklist

> Status: **DONE**
> Marker: archived from `tasks/_active/TZ-NX-GANTT-UNASSIGNED-AUTOEXPAND.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T04:27:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] Branch `main`; active directory was empty before claim.
- [x] Prompt, wave map, both audits, TZ, `_NOW.md`, executor/context instructions read.
- [x] Baseline `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS.
- [x] Claim slot filled before product code.

### Preflight Check Output
- **Context read:** `docs/audits/2026-09-15-gantt-workers-unassigned-void.md`, `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`, `frontend-nx/libs/features/src/lib/production/production-cockpit.context.ts`, `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.ts`, `docs/pages/production-cockpit.page.md`
- **Key Constraints:** workers mode only; auto-expand unassigned only; named workers remain collapsed; no dark token changes.
- **Planned Deliverable:** expand unassigned on workers-mode entry/appearance; clarify banner; regression coverage; close with gates.
- **Validation Path:** focused worker/tree specs, app typecheck, features lint, final app build.

## Acceptance

- [x] In workers mode with unassigned work, the unassigned group is auto-expanded on entry or when work appears, exposing module rows without manual toggle.
- [x] Named worker groups remain collapsed by default.
- [x] Banner names the expanded «Не назначен» context and retains the People link.
- [x] Focused tests, typecheck, and final build pass.

## Integrity slot

- [x] Type: page/UI behavior.
- [x] FIC/UI docs: `docs/pages/production-cockpit.page.md` updated; no route or permission change.
- [x] `docs/pages/PAGE-TZ-INDEX.md` updated for the active wave.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no route, permission, section-status, or shared-domain field change.
- [x] Foreign WIP excluded; only owned production Gantt paths staged.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Gates (fact)

- `cd frontend-nx && pnpm exec jest --config libs/features/jest.config.ts --runInBand libs/features/src/lib/production/util/gantt-workers-view.spec.ts libs/features/src/lib/production/ui/gantt-bars.component.spec.ts` — PASS, 2 suites / 15 tests.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `cd frontend-nx && pnpm exec nx lint features` — baseline FAIL: existing intra-library boundary errors (28 errors / 209 warnings); no new errors in owned behavior.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; final gate, with existing Angular/budget warnings.

## Executor report

Implemented signal-safe one-time auto-expansion in `ProductionCockpitFacade`, added a context setter, clarified Russian banner copy, added worker-tree regression coverage, and updated production page/index docs. Dark tokens, React/Pro assets, backend, and unrelated WIP were untouched.

## Closeout

- [x] Archive + lock + progress/live state + active-marker removal completed.
- [x] Status DONE.
- closed_at: 2026-09-16T04:29:00Z
