# TZD-26 checklist

> Status: **DONE** (archived 2026-08-08) · Source: `tasks/_backlog/desktop/TZD-26-column-ready-reshape.md`

## Claim slot
- agent_id: buffy-desktop-ex (deepseek-v4-flash / Freebuff desktop)
- claimed_at: 2026-08-08T10:26:39Z
- workspace: D:\kppdf-8.0 (worktree .freebuff/worktrees/da8930bf-102b-490e-875d-990cb1567610)
- team_room_claim: unavailable (CLI registry OrchestratorKit-scoped)

## Preflight
- [x] Conflict keys vs `_active/` — empty, no conflict
- [x] TZD-23 archived + on main
- [x] Claim + `_active/TZD-26.md` before code

## Acceptance
- [x] classify ready/unfit (canonical|unknown|conflict + mapping + sampleRows; 0 journal)
- [x] reshape PATCH rows (pre-apply статусы; сброс aiReport → re-match), 0 journal
- [x] MCP.md protocol Column ready/reshape (запрет EAV-полей)
- [x] Gates PASS → archive (BE tsc; jest import-task 12/12; MCP 44/44; MCP tsc)

## Executor report

- classifyColumns/reshapeRowByMap в `desktop/mcp/src/inbox.ts`; `kppdf_inbox_classify_columns`;
  BE `PATCH /api/import-tasks/:id/rows` + `kppdf_import_task_reshape`.
- Conflict disclosure: `_active/` empty; только свои CONFLICT KEYS.
- Known limits: канон material-only; product columns → TZD-27.
