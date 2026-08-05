# TZD-12 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-12.done.md`
> Source: `tasks/_backlog/desktop/TZD-12-mcp-read-tools.md`

## Claim slot

- agent_id: Cursor / Auto
- claimed_at: 2026-08-05T20:50:00Z
- closed_at: 2026-08-05T21:00:00Z
- workspace: D:\kppdf-8.0

## Acceptance

- [x] ≥5 read tools registered and documented (6 reads + ping)
- [x] Invalid token → fail; valid → list or empty (no crash) — same Bearer gate as TZD-11 + BackendError mapping
- [x] No schema migrations
- [x] TZD-11 gates still green (typecheck + tests)

## Gates (fact)

- [x] `cd desktop/mcp && pnpm typecheck` — PASS
- [x] `pnpm test` — 7/7 PASS
- [x] MCP.md tool table updated

## Executor report

- Added `read-tools.ts`, `query.ts`, `tool-result.ts`.
- Tools: list/get materials, list/get products (slim), list storage-items, list warehouses.
- Docs + archive for TZD-12.
