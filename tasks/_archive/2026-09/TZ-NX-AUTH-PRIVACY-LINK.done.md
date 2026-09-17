# TZ-NX-AUTH-PRIVACY-LINK

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff

## Result

Removed dead `/legal/privacy` links from the login and device-enrollment templates, removed now-unused `RouterLink` imports, and added no invented legal text or stub route.

## Verification

- acceptance criteria: PASS
- `git grep -n /legal/privacy -- frontend-nx`: PASS — no references
- focused ESLint: PASS
- app typecheck: PASS
- `nx lint kppdf-web`: baseline FAIL outside scope (12 existing errors / 104 warnings)
- `nx build kppdf-web`: PASS, final gate
- checklist: `docs/agent-checklists/TZ-NX-AUTH-PRIVACY-LINK.md`
- product scope: login/enroll templates only; no backend/legal route added
