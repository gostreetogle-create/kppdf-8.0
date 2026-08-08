# TZD-19 checklist

> Status: **DONE** (archived 2026-08-08) · Source: `tasks/_backlog/desktop/TZD-19-mcp-graph-integrity.md`

## Claim slot
- agent_id: buffy-desktop-ex (deepseek-v4-flash / Freebuff desktop)
- claimed_at: 2026-08-08T10:36:07Z
- workspace: D:\kppdf-8.0 (worktree .freebuff/worktrees/da8930bf-102b-490e-875d-990cb1567610)
- team_room_claim: unavailable (CLI registry OrchestratorKit-scoped)

## Preflight
- [x] Conflict keys vs `_active/` — empty, no conflict
- [x] Backend endpoints verified: products/modules composition + where-used, materials where-used
- [x] Claim + `_active/TZD-19.md` before code

## Acceptance
- [x] composition/where_used MCP tools (5, живые REST shape) + kppdf_list_modules
- [x] integrity suite read-only (sample ids; не sandbox_reset; не write)
- [x] MCP.md graph protocol (перед product.update / mass material.update)
- [x] Gates PASS → archive (MCP tsc; MCP test 51/51)

## Executor report

- 5 graph tools + kppdf_run_integrity_suite (runIntegritySuite deps-injected) + kppdf_list_modules.
- Conflict disclosure: `_active/` empty; только свои CONFLICT KEYS.
- Known limits: stock consistency deep audit — вне scope (нет тривиального endpoint).
