# TZD-18 checklist

> Status: **DONE** (archived 2026-08-08) · Source: `tasks/_backlog/desktop/TZD-18-mcp-batch-scale.md`

## Claim slot
- agent_id: buffy-desktop-ex (deepseek-v4-flash / Freebuff desktop)
- claimed_at: 2026-08-08T10:31:06Z
- workspace: D:\kppdf-8.0 (worktree .freebuff/worktrees/da8930bf-102b-490e-875d-990cb1567610)
- team_room_claim: unavailable (CLI registry OrchestratorKit-scoped)

## Preflight
- [x] Conflict keys vs `_active/` — empty, no conflict
- [x] TZD-23/26 archived + on main
- [x] Claim + `_active/TZD-18.md` before code

## Acceptance
- [x] propose/confirm/cancel batch APIs (all-or-nothing + idempotencyKey)
- [x] MCP batch tools + apply_plan chunks (100)
- [x] ImportTask cap raised 500 → 2000 (+ inbox limit/offset)
- [x] Gates PASS → archive (BE tsc; jest 22/22; MCP 47/47; MCP tsc)

## Executor report

- BE propose-batch/confirm-batch/cancel-batch; MCP 3 batch tools; apply_plan batch chunks;
  cap 2000 в BE/MCP/desktop app.
- Conflict disclosure: `_active/` empty; только свои CONFLICT KEYS.
- Known limits: batch материал-only (product kinds → TZD-27); 10k строк = несколько задач.
