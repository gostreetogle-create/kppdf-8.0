# TZ-NX-SHELL-QUICKNAV-COUNT-PIN

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-17
closed_by: freebuff

## Result

Pinned the shell quick-navigation tests to the live filtered category set without changing `NAV_CATEGORIES` or product navigation. All-role count is 9 (`home`, `clients`, `deals`, `supply`, `production`, `warehouse`, `docs`, `registries`, `admin`); role-gated count is 8 (admin removed, registries remains via `skipPageAcl`).

## Verification

- focused `app-shell.component.spec.ts`: PASS — 29/29
- focused ESLint: PASS — 0 errors / 19 existing warnings
- `nx build kppdf-web`: PASS, final gate
- product nav source changed: 0 files
- checklist: `docs/agent-checklists/TZ-NX-SHELL-QUICKNAV-COUNT-PIN.md`
