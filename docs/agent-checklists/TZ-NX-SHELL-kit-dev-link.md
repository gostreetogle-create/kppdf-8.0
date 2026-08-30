# TZ-NX-SHELL-kit-dev-link checklist

> Status: **DONE**
> Marker: archived as `tasks/_archive/2026-08/TZ-NX-SHELL-kit-dev-link.done.md`

## Claim slot
- agent_id: freebuff-nx-shell
- claimed_at: 2026-08-29T11:31:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable

## Acceptance
- [x] Dev UI Kit link visible.
- [x] Production config hides link by environment flag contract.
- [x] Build and lint pass.
- [x] Legacy frontend unchanged.

## Integrity slot
- [x] Type: page/navigation.
- [x] FIC: N/A — development-only navigation affordance.
- [x] Page docs: N/A.
- [x] Section readiness: N/A.
- [x] Conflict key limited to Nx kit shell.
- [x] Coupling map: N/A.
- [x] Canon: docs/DOCS-INTEGRITY.md.

## Gates
- `pnpm exec nx build kppdf-web`: PASS.
- `pnpm exec nx run-many -t lint --all`: PASS, 0 errors.

## Executor report
- Added environment-gated `UI Kit` link.
- Existing build budget and UI lint warnings remain non-blocking.
- Archive created; no commit/push.

## Closeout
- [x] Archive created.
- [x] Active marker removed.
- closed_at: 2026-08-29T11:31:09+03:00
