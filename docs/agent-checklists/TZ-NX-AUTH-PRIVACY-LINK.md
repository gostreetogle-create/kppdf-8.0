# TZ-NX-AUTH-PRIVACY-LINK checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-AUTH-PRIVACY-LINK.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:15:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)

## Preflight
- [x] `_NOW.md` and `_active/` checked; no conflicting claim.
- [x] Privacy TZ, login/enroll templates, routes, and audit evidence read.
- [x] Claim created before product edits.

## Acceptance
- [x] Remove dead `/legal/privacy` links from login/enroll surfaces.
- [x] Do not invent legal content or add a stub route.
- [x] Focused checks and final NX build pass.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts`, `frontend-nx/apps/kppdf-web/src/app/pages/enroll/enroll.page.ts`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `docs/pages/login.page.md`.
- Constraints: minimal template cleanup; route map unchanged.
- Validation: source search, lint/typecheck, NX build last.

## Integrity slot
- [x] Type = page/link cleanup.
- [x] Page docs reviewed; no page contract change, so N/A.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP = N/A.
- [x] Foreign WIP excluded.

## Gates
- `git grep -n /legal/privacy -- frontend-nx`: PASS — no references.
- Focused ESLint on login/enroll: PASS.
- `tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: PASS.
- `nx lint kppdf-web`: baseline FAIL — 12 pre-existing errors / 104 warnings outside this scope.
- `nx build kppdf-web`: PASS; final gate.

## Executor report
- Removed dead privacy links from login and enroll; RouterLink imports were removed. No legal text or route stub added.
