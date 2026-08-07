# SESSION QUEUE — 2026-08-08 · quiet boot TZ + desktop

**Updated:** 2026-08-08 · TZ-OPS-301 READY (quiet Nest boot)

## Ops / DX

| Item | Status |
|------|--------|
| **TZ-OPS-301** quiet local boot logs | **READY** — `tasks/_backlog/ops/TZ-OPS-301-quiet-dev-boot-logs.md` · checklist `docs/agent-checklists/TZ-OPS-301.md` |

## Desktop / MCP

| Item | Status |
|------|--------|
| **TZD-17** semantic domain layer | **DONE** — `tasks/_archive/2026-08/TZD-17.done.md` |
| **TZD-20** mcp.json copy for Cursor/LM Studio | **READY** — `tasks/_backlog/desktop/TZD-20-mcp-client-json-copy.md` |
| **TZD-18** batch scale | PARK — не без PO |
| **TZD-19** graph + integrity | PARK |

## Checkpoint
- NEXT (DX): PO «делай TZ-OPS-301» — тихий boot (Nest DI + proxy race)
- NEXT (desktop): «делай TZD-20» или «делай TZD-18»
- CONFLICT OPS-301: `backend/src/main.ts`, `start.mjs`, `.env.example` (+ optional quiet-logger)
- Deploy: NO
