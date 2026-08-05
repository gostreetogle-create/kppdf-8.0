═══════════════════════════════════════════════════════════════
TZD-11: MCP server foundation — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-05
closed_by: Cursor / Auto
acceptance_status: PASS
verification:
  - package desktop/mcp (@kppdf/desktop-mcp) in desktop pnpm workspace: PASS
  - HTTP host 127.0.0.1 default + LAN opt-in: PASS
  - stdio host entry: PASS
  - tool kppdf_ping registered: PASS
  - unauthorized HTTP Bearer mismatch → 401: PASS (smoke)
  - /healthz ok: PASS (smoke)
  - desktop/docs/MCP.md: PASS
  - pnpm typecheck: PASS
  - pnpm test (auth helpers): 2/2 PASS
checklist: docs/agent-checklists/TZD-11.md
lock: .mimocode/locks/TZD-11-mcp-foundation.lock
source: tasks/_backlog/desktop/TZD-11-mcp-server-foundation.md

---

## Summary

Local MCP socket under `desktop/mcp/`: Streamable HTTP (`pnpm start`) and
stdio (`pnpm start:stdio`). Auth = pairing JWT via `KPPDF_API_KEY`; HTTP
requires matching `Authorization: Bearer`. Single read tool `kppdf_ping`
forwards to `/api/auth/me` (fallback `/api/health`). Docs: `desktop/docs/MCP.md`.

Next: TZD-12 read tools (after this on main). Parallel-safe: TZD-05 web pairing.
