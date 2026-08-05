═══════════════════════════════════════════════════════════════
TZD-13: MCP write tools + mutation journal — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor / Auto (desktop/MCP owner)
acceptance_status: PASS
verification:
  - MutationJournal module propose/confirm/undo Material: PASS
  - unconfirmed propose does not call Material.create: PASS (jest)
  - ring eviction: PASS (jest)
  - MCP write tools registered: PASS
  - backend tsc: PASS
  - journal jest 5/5: PASS
  - desktop/mcp typecheck + tests 8/8: PASS
  - MCP.md safety + connect guide: PASS
checklist: docs/agent-checklists/TZD-13.md
lock: .mimocode/locks/TZD-13-mcp-writes-journal.lock
source: tasks/_backlog/desktop/TZD-13-mcp-write-tools-and-mutation-journal.md

---

## Summary

Backend `mutation-journal`: propose Material create/update (no SoT until confirm),
confirm via existing MaterialService, undo (soft-delete / restore before), ring ~50.
MCP tools: propose/confirm/cancel/undo/list. Default unit `шт` for create UX.
Docs: manager 3-step connect + write rules in `desktop/docs/MCP.md`.

Next owner track: TZD-14 desktop autostart MCP (usability). Parallel FE: TZD-05.
