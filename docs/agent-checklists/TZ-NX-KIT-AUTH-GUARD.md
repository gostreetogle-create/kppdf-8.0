# TZ-NX-KIT-AUTH-GUARD checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-KIT-AUTH-GUARD.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:45:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)
- PO decision: Да — protect `/kit` with existing `authGuard`.

## Preflight
- [x] `_NOW.md` and `_active/` checked; no conflicting claim.
- [x] Kit TZ, app routes, route-path tests, auth platform, and RBAC contract read.
- [x] Claim created before product edits.

## Acceptance
- [x] `/kit` parent and children require authentication.
- [x] No new permission/page key or kit redesign.
- [x] Focused checks and final NX build pass.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `frontend-nx/apps/kppdf-web/src/app/layout/route-paths.spec.ts`, `frontend-nx/libs/data-access/src/lib/auth/auth.guard.ts`.
- Constraints: reuse existing `authGuard`; route-only change.
- Validation: focused route test/lint/typecheck, then NX build last.

## Integrity slot
- [x] Type = auth/route guard.
- [x] Auth platform and RBAC docs reviewed; no permission catalog change.
- [x] DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP = N/A.
- [x] Foreign WIP excluded.

## Gates
- Focused route test: PASS — `route-paths.spec.ts`, 5/5.
- Focused ESLint: PASS — 0 errors, 2 existing warnings.
- App typecheck: PASS.
- `nx build kppdf-web`: PASS; final gate.
- Full `nx test kppdf-web --testPathPattern=route-paths`: baseline FAIL in unrelated `app-shell.component.spec.ts` (nav count 8/7 expected, 9/8 received); direct focused Jest passed.
