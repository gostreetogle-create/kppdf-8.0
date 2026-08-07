═══════════════════════════════════════════════════════════════
TZD-20: Desktop — копирование mcp.json для Cursor / LM Studio — DONE
═══════════════════════════════════════════════════════════════

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-08
closed_by: cursor-composer-tzd20 (Cursor PASS → archive)
acceptance_status: PASS (Cursor PASS 2026-08-08)
verification:
  - buildMcpClientSnippet full + fragment (unit 4/4): PASS
  - UI «Скопировать mcp.json» + «Только фрагмент»; disabled без паринга: PASS
  - Docs Cursor/LM Studio = один JSON; TTL/reload; multi-client: PASS
  - GET /mcp → 405 (mcp ≡ mcp-runtime, no code change this TZ): PASS
  - desktop pnpm typecheck: PASS
  - desktop pnpm check: PASS
checklist: docs/agent-checklists/TZD-20.md
lock: .mimocode/locks/TZD-20-mcp-client-json-copy.lock
source: tasks/_backlog/desktop/TZD-20-mcp-client-json-copy.md

---

## Summary

- `desktop/src/core/mcpClientSnippet.ts` — full mcp.json + fragment builder
- `App.svelte` — clipboard buttons + RU hints; URL copy retained
- Docs: MCP.md connect section; PAIRING.md pairing ≠ mcp.json; FEATURE §E
- Clipboard only — never writes peer `~\.cursor\mcp.json` / LM Studio paths

## Out of scope (successors)

- JWT TTL / refresh — separate auth TZ
- Opt-in write into client mcp.json on disk
- TZD-18 / TZD-19 PARK

## Protects

Managers get one-click valid mcp.json for Cursor and LM Studio without hand-assembling Bearer/port.
