# TZ-NX-GANTT-UNASSIGNED-DARK-WASH checklist

> Status: **DONE**
> Marker: archived from `tasks/_active/TZ-NX-GANTT-UNASSIGNED-DARK-WASH.md`

## Claim slot

- agent_id: freebuff
- claimed_at: 2026-09-16T04:42:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no team-room CLI exposed)

## Preflight

- [x] Branch `main`; prior commits `ccc89114`, `e1b6e2d9`, `51e6172a`; no competing active task.
- [x] Dark-wash TZ, unassigned audit, current Gantt model/facade/component/specs and CSS conventions read.
- [x] Baseline inherited: `nx build kppdf-web` PASS.
- [x] Claim slot filled before code.

### Preflight Check Output
- **Context read:** `tasks/_ready/2026-09-15-gantt-workers-dark/TZ-NX-GANTT-UNASSIGNED-DARK-WASH.md`, `docs/audits/2026-09-15-gantt-workers-unassigned-void.md`, `frontend-nx/libs/features/src/lib/production/util/gantt-bar.model.ts`, `frontend-nx/libs/features/src/lib/production/gantt-bars.facade.ts`, `frontend-nx/libs/features/src/lib/production/ui/gantt-bars.component.ts`, `frontend-nx/libs/ui/paper-and-ink/src/styles/global.css`
- **Key Constraints:** dark-only readable fills; preserve light; project token names; no text-white on amber; no global palette redesign.
- **Planned Deliverable:** theme-aware unassigned CSS vars; wire bar/label/chip; focused proof; gates.
- **Validation Path:** Gantt/model specs, app typecheck, feature lint baseline, final app build.

## Acceptance

- [x] Dark unassigned label/bar/chip use dark amber variables and readable ink/on-gold fallback.
- [x] Light warning values remain the existing constants.
- [x] No `text-white`, no global palette changes, and no WT catalog changes.
- [x] Focused tests and final build pass.

## Integrity slot

- [x] Type: page/UI behavior.
- [x] `docs/pages/production-cockpit.page.md` already documents the worker/dark wave; no route/index change required for this sub-TZ.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP: N/A — no route, permission, section-status, or shared-domain field change.
- [x] Foreign WIP excluded; only owned production Gantt paths staged.
- [x] `docs/DOCS-INTEGRITY.md` followed.

## Gates (fact)

- `cd frontend-nx && pnpm exec jest --config libs/features/jest.config.ts --runInBand libs/features/src/lib/production/ui/gantt-bars.component.spec.ts libs/features/src/lib/production/util/gantt-bar.model.spec.ts libs/features/src/lib/production/util/gantt-workers-view.spec.ts` — PASS, 3 suites / 67 tests.
- `cd frontend-nx && pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit` — PASS.
- `cd frontend-nx && pnpm exec nx lint features` — baseline FAIL: existing intra-library boundary errors (28 errors / 213 warnings); no new owned error.
- `cd frontend-nx && pnpm exec nx build kppdf-web` — PASS, exit 0; final gate, existing Angular/budget warnings only.

## Executor report

Moved unassigned worker wash/bar/chip styling to component-scoped theme variables with dark amber overrides and readable on-gold fallback. Light values remain the existing warning constants; no global palette or WT hue algorithm was changed.

## Closeout

- [x] Archive + lock + live state + active-marker removal completed.
- [x] Status DONE.
- closed_at: 2026-09-16T04:44:00Z
