# TZ-NX-SHELL-01-IDLE-RAILS: убрать мёртвые L/R rails на страницах без tools

**РОЛЬ АГЕНТА:** Executor (frontend-nx) — claude

Source: `tasks/_ready/nx-shell-hub/TZ-NX-SHELL-01-IDLE-RAILS.md`.
Full checklist: `docs/agent-checklists/TZ-NX-SHELL-01-IDLE-RAILS.md`.

## ЧТО СДЕЛАНО

1. `ShellToolRailService` default → empty (`{owner:null,left:[],right:[]}`), no placeholder fallback.
2. Deleted `tool-rail-definitions.ts` (+spec) — sole purpose was the disabled demo icons.
3. `AppShellComponent`: rails render only `@if (tools.length > 0)`; history ←→ moved to header (single SoT); grid columns computed dynamically (1/2/3 col).
4. Specs rewritten/added; production + studio setTools regression confirmed green.
5. `docs/pages/page-chrome.md` — new NX-specific section (legacy prose left intact).

## Gates

- `nx test kppdf-web` → PASS (105/105, 724 passed, 7 skipped)
- `nx lint kppdf-web` → clean
- `nx build kppdf-web` → PASS, exit 0 (last command)

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-10
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (via nx build)
  - tests: PASS
  - lint: PASS
  - checklist: ADDED
  - progress.md: N/A (redirect file)
  - status synchronization: PASS
