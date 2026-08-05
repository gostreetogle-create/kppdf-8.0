═══════════════════════════════════════════════════════════════
TZD-12: MCP read tools — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor / Auto
acceptance_status: PASS
verification:
  - 6 read tools + kppdf_ping: PASS
  - desktop/docs/MCP.md tool table: PASS
  - pnpm typecheck: PASS
  - pnpm test: 7/7 PASS
  - no Nest schema changes: PASS
checklist: docs/agent-checklists/TZD-12.md
lock: .mimocode/locks/TZD-12-mcp-reads.lock
source: tasks/_backlog/desktop/TZD-12-mcp-read-tools.md

---

## Summary

Registered read-only MCP tools forwarding pairing JWT to existing GETs:
materials list/get, products list/get (minimal fields), storage-items,
warehouses. Query helper + tool result helpers covered by unit tests.

Next: TZD-13 writes + mutation journal. Parallel: TZD-05 web pairing.
