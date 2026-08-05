═══════════════════════════════════════════════════════════════
TZD-11: MCP server foundation (local socket + auth + tool registry)
═══════════════════════════════════════════════════════════════

> PARKED until PO «делай TZD-11». LAYER 2 · Desktop/MCP.
> CONFLICT: `desktop/**` (new mcp/ package or src); optional `backend/src/modules/desktop/**` for pairing token only if missing.
> Vision: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`

РОЛЬ АГЕНТА: executor (desktop + thin Node MCP host). НЕ ломать web frontend.

ЗАВИСИМОСТИ: pairing JWT usable (desktop v0.2 config / TZD-05 if web button still missing — may use pasted pairing JSON).

Проверено: `desktop/README.md`; `desktop/docs/PAIRING.md`; `desktop/src/core/config.ts`; `desktop/src/core/api.ts`; vision 2026-08-05.

---

## ИСХОДНОЕ

- Desktop Tauri pairs with `{ apiBaseUrl, apiKey, … }` and calls backend with Bearer.
- No MCP server in repo yet (old codebase-memory MCP removed from project).
- Goal: universal MCP socket — not Cursor-specific.

---

## ЧТО ДЕЛАТЬ

1. Add MCP host module (prefer Node `@modelcontextprotocol/sdk` under `desktop/mcp/` or `desktop/src/mcp/`) that:
   - binds **127.0.0.1** by default (optional LAN bind behind explicit flag);
   - authenticates tool calls with the **same pairing JWT** (forward as Bearer to API);
   - exposes MCP initialize + tools/list + tools/call skeleton.
2. Register **health** tool: `kppdf_ping` → `GET {apiBaseUrl}/api/health` or `/api/auth/me`.
3. Document connect string: host, port, auth header/env — in `desktop/docs/MCP.md`.
4. Unit/smoke: server starts, ping tool returns ok with valid token; rejects without token.

---

## НЕ

- Bundle LLM / Ollama install in this TZ.
- Write/mutate business entities (→ TZD-13).
- Bypass RBAC.
- Auto-bind 0.0.0.0 without explicit opt-in.
- Touch Catalog Wave 2 / warehouse UI.

---

## ACCEPTANCE

- [ ] MCP server starts from documented command or desktop hook stub.
- [ ] `kppdf_ping` works with pairing token.
- [ ] Unauthorized call fails closed.
- [ ] `desktop/docs/MCP.md` exists; vision link present.
- [ ] typecheck for touched TS passes.

LAYER: 2  
CONFLICT KEYS: `desktop/mcp/;desktop/docs/MCP.md;desktop/package.json;docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`
