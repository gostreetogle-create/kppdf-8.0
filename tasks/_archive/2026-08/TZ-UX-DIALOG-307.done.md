# TZ-UX-DIALOG-307 — DONE

- Status: DONE
- Agent: Buffy/freebuff-259639d6
- Claimed at: 2026-08-10T17:56:01.3657604Z
- Closed at: 2026-08-10T18:03:51.7524650Z
- Workspace: `D:\\kppdf-8.0`

## Delivered

- Shared `isSaveAndContinueKey` and `focusDialogField` helpers for catalog dialogs.
- Product, Module, Material, Color reference, and QuickCreate create dialogs now support Ctrl+Enter / Cmd+Enter save-and-continue.
- Create success resets defaults, clears transient photo state, focuses the first required field, and shows `Ctrl+Enter — сохранить и создать ещё`.
- Edit hotkey saves and stays open; ordinary Save/Create close behavior is preserved.
- Canonical `docs/pages/ui-add-and-continue.md` and `docs/DIALOG-COOKBOOK.md` updated.
- Added focused helper coverage.

## Gates

- FE TypeScript: PASS.
- Focused Jest: PASS, 6 suites / 92 tests.
- ESLint: PASS.
- Prettier: PASS.
- FE development build: PASS.
- `git diff --check`: PASS; CRLF normalization warnings only.

## Scope / limits

- No backend, MCP, Excel, `desktop/**`, `mcp-runtime/**`, or deploy changes.
- No change to composition picker Add & continue; it remains TZ-UX-DIALOG-306.

Deploy: NO.
