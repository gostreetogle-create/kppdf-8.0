# TZ-NX-AUTH-POSTLOGIN-HOME

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff

## Result

Login success and authenticated `/login` now redirect to `/home`; stale dashboard/materials comments were removed and `docs/pages/login.page.md` now documents the home target.

## Verification

- acceptance criteria: PASS
- focused tests: PASS — data-access 25 suites / 137 tests
- lint: PASS — data-access, 0 errors / 1 existing warning
- frontend typecheck: PASS
- `nx build kppdf-web`: PASS, final gate
- checklist: `docs/agent-checklists/TZ-NX-AUTH-POSTLOGIN-HOME.md`
- product scope: only login page, auth guard, and login page docs; no backend/admin/RBAC changes
