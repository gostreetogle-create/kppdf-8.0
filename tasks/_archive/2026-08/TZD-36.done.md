# TZD-36 — Desktop Import Studio shell

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-10
closed_by: Buffy/canonical-main

## Outcome

Implemented the Desktop Import Studio shell:

- default «Импорт Excel» tab with large dropzone and primary parsed preview table;
- separate «MCP» tab containing pairing, connected account, host status, Start/Stop, URL, port/LAN controls, and mcp.json copy actions;
- pairing and MCP state remain in the Svelte app state while switching tabs;
- connected-user chip remains visible in the shell header;
- Tauri window changed to `1280×800` default and `1080×720` minimum;
- README and INSTALL now document the tabs and the TZD-37/38 boundaries.

## Verification

- acceptance criteria: PASS by source review and production build
- desktop typecheck: PASS (`pnpm --dir desktop typecheck`)
- Svelte check: PASS, 0 errors / 0 warnings (`pnpm --dir desktop check`)
- desktop build: PASS (`pnpm --dir desktop build`)
- MCP typecheck/tests: PASS, 91/91 tests (`pnpm --dir desktop mcp:check`)
- diff-check: PASS
- integrity checklist: ADDED (`docs/agent-checklists/TZD-36.md`)
- progress.md: UPDATED
- status synchronization: PASS; active marker removed after archive

## Scope disclosure

Only TZD-36 desktop shell keys were changed. `desktop/mcp/**`, `desktop/mcp-runtime/**`, backend schemas, deploy scripts, desktop ZIP publishing, WAVE-MCP-GAP implementation, and foreign dirty docs/WIP were excluded. Native Tauri window smoke was not available in the headless session; the shell passed typecheck, Svelte diagnostics, and production build.
