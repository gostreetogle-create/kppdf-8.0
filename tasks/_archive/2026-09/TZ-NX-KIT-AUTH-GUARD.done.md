# TZ-NX-KIT-AUTH-GUARD

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff

## Result

Added the existing `authGuard` to the top-level `/kit` route. All kit children now inherit the authentication gate; no permission key, page ACL, or kit UI was added.

## Verification

- acceptance criteria: PASS
- focused route test: PASS — `route-paths.spec.ts`, 5/5
- focused ESLint: PASS — 0 errors / 2 existing warnings
- app typecheck: PASS
- `nx build kppdf-web`: PASS, final gate
- full Nx test attempt: baseline unrelated `app-shell.component.spec.ts` nav-count failures; direct focused Jest passed
- checklist: `docs/agent-checklists/TZ-NX-KIT-AUTH-GUARD.md`
