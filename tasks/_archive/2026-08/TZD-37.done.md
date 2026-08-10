# TZD-37 — Excel validation and mapping profiles

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy/canonical-main

## Outcome

- Added multi-sheet Excel preview and non-destructive field mapping HITL before row validation.
- Added canonical mapping choices, red unfit/conflict state, explicit ignore, confirmation gating, and canonical row reshape.
- Added organization-scoped `import_mapping_profiles` CRUD with unique names and one ★ default profile.
- Added MCP classify suggestion into the same human-confirmed map UI.
- Added pre-proposal row statuses: `ok_new`, `ok_update`, `skip`, `conflict`, and `error`; proposals remain journal-only until explicit confirmation.
- Updated Desktop README/INSTALL.

## Verification

- acceptance criteria: PASS by source review and automated gates
- desktop typecheck: PASS
- Svelte check: PASS, 0 errors / 0 warnings
- desktop build: PASS
- MCP typecheck/tests: PASS, 91/91 tests
- backend typecheck: PASS
- mapping profile service tests: PASS, 6/6
- diff-check: PASS
- integrity checklist: ADDED (`docs/agent-checklists/TZD-37.md`)
- progress.md: UPDATED
- status synchronization: PASS; active marker removed after archive

## Scope disclosure

Only TZD-37 conflict keys were changed: Desktop mapping/profile UI, Excel parser, thin profile API/module, and shared request helper. No `desktop/mcp-runtime/**`, deploy, ZIP publishing, commercial MCP, BOM composition, Angular web forms, or foreign dirty WIP was included. The existing MCP classify tool is used as a suggestion source; no silent SoT write occurs. Native Tauri smoke was unavailable in the headless session.
