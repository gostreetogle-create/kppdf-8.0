# TZ-NX-AUTH-DEMO-PASSWORD-TITLE

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff

## Result

Added one `DEMO_PASSWORD` constant in `LoginPage`; the dev autofill and button title now use the same `admin123` value. Backend seed/password files were not changed.

## Verification

- acceptance criteria: PASS
- focused ESLint: PASS
- app typecheck: PASS
- `nx build kppdf-web`: PASS, final gate
- checklist: `docs/agent-checklists/TZ-NX-AUTH-DEMO-PASSWORD-TITLE.md`
- backend credential scope: untouched
