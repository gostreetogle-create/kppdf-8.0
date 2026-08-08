# TZD-29 checklist

> Status: **DONE** · Source: `tasks/_backlog/desktop/TZD-29-manager-import-todos.md`

## Claim slot
- agent_id: buffy-desktop-ex (deepseek-v4-flash / Freebuff desktop)
- claimed_at: 2026-08-08T10:45:56Z
- workspace: D:\kppdf-8.0 (worktree .freebuff/worktrees/da8930bf-102b-490e-875d-990cb1567610)
- team_room_claim: unavailable (CLI registry OrchestratorKit-scoped)

## Preflight
- [x] Conflict keys vs `_active/` — empty, no conflict
- [x] TZD-23…28 archived + on main; TZD-28 doc-draft protocol готов
- [x] Claim + `_active/TZD-29.md` before code

## Acceptance
- [x] BE import_todos CRUD (schema+DTO+service+controller+module, RBAC admin|manager, org-scope)
- [x] MCP create/list/set_status (`import-todo-tools.ts` + tools.ts + tests)
- [x] FE /import-todos list (thin page, PiGroupWorkspace, filters, «Готово», href)
- [x] PAGE-TZ-INDEX + page.md (import-todos.page.md created)
- [x] Gates PASS → archive · wave checkpoint idle

## Executor report (auto)
- **Done:** 2026-08-08 · wave #7 (last of WAVE-DESKTOP-BULK-IMPORT)
- **Changes:** backend module `import-todo/**` + seed pages; MCP 3 tools; FE thin
  page + route + nav; docs (page.md, PAGE-TZ-INDEX, MCP.md, FEATURE checklist,
  WAVE checkpoint, park README).
- **Gates:**
  - backend tsc ✅
  - backend `pnpm test -- import-todo` → 3/3 ✅
  - desktop/mcp `pnpm test` → 62/62 ✅
  - frontend `tsc -p tsconfig.app.json --noEmit` ✅
- **Archive:** `tasks/_archive/2026-08/TZD-29.done.md` + lock
- **Wave:** WAVE-DESKTOP-BULK-IMPORT.md → STATUS DONE + checkpoint 2026-08-08
- **NEXT:** idle (все 7 TZ закрыты; deploy — только по команде PO)
