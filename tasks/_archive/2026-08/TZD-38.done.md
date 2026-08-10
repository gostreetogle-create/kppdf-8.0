# TZD-38 DONE — Specification to BOM composition import

- **Closed:** 2026-08-10T19:01:12Z
- **Executor:** Buffy/canonical-main
- **Workspace:** `D:\kppdf-8.0`
- **Source:** `tasks/TZD-38-spec-bom-composition-import.md`
- **Status:** DONE; commit/push completed

## Delivered

- Hierarchy parser recognizes `level`, `parentArticle`, `article`, `name`, `qty`, `unit`, and `kind`.
- Product → module → material tree preview is rendered before any write.
- Level inference and explicit parent articles are supported.
- Flat files without hierarchy stay on the TZD-37 mapping/validation path.
- Invalid quantity, missing parent, duplicate article/composition link, invalid kind, and invalid root are blocked before confirmation.
- Import Studio uses one explicit HITL action to create missing catalog entities and then call existing Product/Module composition REST endpoints.
- MCP adds draft-only module/composition proposals plus fail-closed `userOk:true` confirmation tools.
- TZD-35 PARK is marked closed/unparked by TZD-38 in the MCP wave note.

## Evidence

- Desktop typecheck: PASS
- Svelte check: PASS, 0 errors / 0 warnings
- Desktop build: PASS
- Specification parser: 4/4 PASS
- MCP typecheck + tests: 93/93 PASS
- `git diff --check`: PASS
- Native Tauri/live catalog smoke was unavailable in the headless executor; no deploy or publish was run.

## Scope guard

No `desktop/mcp-runtime/**`, orders/quotes bulk import, EAV, second database, silent write, deploy script, or ZIP publish was changed.
