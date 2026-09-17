# TZ-NX-AUTH-POSTLOGIN-HOME checklist

> Status: **DONE**
> Marker: `tasks/_active/TZ-NX-AUTH-POSTLOGIN-HOME.md`

## Claim slot
- agent_id: freebuff
- claimed_at: 2026-09-17T06:00:00+03:00
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no Team Room CLI)

## Preflight
- [x] `_NOW.md` and `_active/` checked; no conflicting claim.
- [x] Prompt, TZ, route, login, guard, and page docs read.
- [x] Claim created before product edits.

## Acceptance
- [x] Login success → `/home`.
- [x] Authenticated `/login` → `/home`.
- [x] Stale comments corrected.
- [x] Focused checks and final NX build pass.

## Preflight Check Output
- Context: `frontend-nx/apps/kppdf-web/src/app/pages/login/login.page.ts`, `frontend-nx/libs/data-access/src/lib/auth/auth.guard.ts`, `frontend-nx/apps/kppdf-web/src/app/app.routes.ts`, `docs/pages/login.page.md`, `docs/pages/home.page.md`.
- Constraints: route/auth scope only; no admin/RBAC/backend changes.
- Validation: targeted source assertions/lint if configured, then `pnpm exec nx build kppdf-web` last.

## Integrity slot
- [x] Type = route/auth behavior.
- [x] `docs/architecture/nx-auth-platform.md` and `docs/RBAC-CONTRACT.md` reviewed; no contract change required.
- [x] `docs/pages/login.page.md` updated; DOMAIN-MAP / SECTION-READINESS / COUPLING-MAP N/A (route path unchanged, no shared field).
- [x] Foreign WIP excluded from commit.

## Gates
- `pnpm exec nx test data-access --skip-nx-cache`: PASS — 25 suites / 137 tests.
- `pnpm exec nx lint data-access`: PASS — 0 errors, 1 pre-existing warning.
- `pnpm exec tsc -p apps/kppdf-web/tsconfig.app.json --noEmit`: PASS.
- `pnpm exec nx build kppdf-web`: PASS; final gate, existing Angular/budget warnings only.

## Executor report
- Login success and authenticated-login redirects now target `/home`; stale comments and login page docs updated.
- Admin/RBAC/backend/dark-theme scopes untouched.
