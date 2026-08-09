# TZ-UI-THEME-331 — DONE

- Closed: 2026-08-09T02:46:59Z
- Agent: agent-3e757640b7
- Workspace: `D:\\kppdf-8.0`
- Dependency: TZ-UI-LIGHT-330 DONE (`35cfc6e3`)
- Commit: pending closeout commit
- Lock: `.mimocode/locks/TZ-UI-THEME-331-dark-depth-and-on-gold.lock`

## Delivered

- Added invariant `--color-on-gold` and migrated gold active labels/buttons to `text-on-gold`.
- Added matching conditional text class for every active `bg-sunrise-warm` state, including the discovered kit navigation occurrence.
- Evened dark surface ladders, calibrated dark text, removed unused `--color-muted-strong`, and added the dark inset highlight.
- Added light selection styling and moved dark scrollbar idle/hover rules outside `@layer base`.
- Appended the dark-theme depth and gold-label documentation.

## Gates

- Prettier changed files: PASS
- ESLint changed files: PASS
- Frontend TypeScript: PASS
- Focused Jest command: PASS with no matching specs (`--passWithNoTests`)
- Full Jest: 136 suites / 1276 tests PASS; existing Angular/jsdom console warnings remain
- Angular development build: PASS
- `git diff --check`: PASS
- Control search `bg-sunrise-warm text-paper`: 0 matches in `frontend/src`

## Notes

- Browser screenshots / PO visual review were not available in this session.
- Deploy was not run.
