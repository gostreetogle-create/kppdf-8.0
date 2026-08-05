# TZD-11 checklist

> Status: **DONE**
> Archive: `tasks/_archive/2026-08/TZD-11.done.md`
> Source: `tasks/_backlog/desktop/TZD-11-mcp-server-foundation.md`

## Claim slot

- agent_id: Cursor / Auto
- claimed_at: 2026-08-05T20:30:00Z
- closed_at: 2026-08-05T20:45:00Z
- workspace: D:\kppdf-8.0

## Acceptance

- [x] MCP server starts (`cd desktop/mcp && pnpm start`)
- [x] `kppdf_ping` registered (calls `/api/auth/me` or `/api/health` with pairing JWT)
- [x] Unauthorized fail closed (HTTP 401 if Bearer ≠ `KPPDF_API_KEY`)
- [x] `desktop/docs/MCP.md`
- [x] typecheck PASS (`pnpm typecheck`)
- [x] unit tests auth helpers PASS (`pnpm test`)

## Gates (fact)

- [x] `cd desktop/mcp && pnpm exec tsc --noEmit` — PASS
- [x] `pnpm test` — 2/2 PASS
- [x] smoke: `/healthz` ok; `/mcp` without matching Bearer → 401

## Executor report

- Added `desktop/mcp` Node package (`@modelcontextprotocol/sdk` + Express createMcpExpressApp).
- Transports: HTTP Streamable (`pnpm start`) + stdio (`pnpm start:stdio`).
- Default bind `127.0.0.1:9743`; LAN opt-in via `KPPDF_MCP_ALLOW_LAN`.
- Tool: `kppdf_ping` only (TZD-12 adds reads).
- Parallel: TZD-05 web pairing is separate conflict keys for third agent.
