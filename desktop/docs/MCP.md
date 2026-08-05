# KPPDF Desktop MCP socket

> TZD-11 foundation. Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`

Local MCP host so **any** MCP-capable client (not only Cursor) can call KPPDF tools
using the same **pairing JWT** as the desktop app.

## Requirements

- Node 18+
- Backend kppdf reachable
- Pairing packet fields → env (see below)

## Env

| Variable | Required | Default | Meaning |
|----------|----------|---------|---------|
| `KPPDF_API_BASE_URL` | yes | — | e.g. `http://127.0.0.1:3000` |
| `KPPDF_API_KEY` | yes | — | pairing JWT (`apiKey` from pairing JSON) |
| `KPPDF_MCP_PORT` | no | `9743` | listen port |
| `KPPDF_MCP_HOST` | no | `127.0.0.1` | bind address |
| `KPPDF_MCP_ALLOW_LAN` | no | off | if `1`/`true`, may bind `0.0.0.0` |

## Start

```bash
cd desktop/mcp
pnpm install
# HTTP (recommended for LAN/local IP clients)
set KPPDF_API_BASE_URL=http://127.0.0.1:3000
set KPPDF_API_KEY=<pairing-jwt>
pnpm start

# Stdio (process-spawned clients)
pnpm start:stdio
```

- MCP endpoint: `POST http://127.0.0.1:9743/mcp`
- Health: `GET http://127.0.0.1:9743/healthz`
- Every MCP HTTP request must send: `Authorization: Bearer <same pairing JWT>`

## Tools (TZD-11)

| Tool | Access | Description |
|------|--------|-------------|
| `kppdf_ping` | read | `GET /api/auth/me` (fallback `/api/health`) with pairing token |

Read catalog tools → **TZD-12**. Writes / journal → **TZD-13**. Desktop autostart → **TZD-14**.

## Security

- Default bind **loopback only**.
- LAN bind is opt-in and warned.
- No tool runs without configured pairing key; HTTP rejects mismatched Bearer.
- Server never bypasses backend RBAC — it only forwards the user JWT.
