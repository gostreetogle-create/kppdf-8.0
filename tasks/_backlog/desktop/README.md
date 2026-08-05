# Desktop backlog (`TZD-*`)

Канон: `docs/superpowers/specs/2026-08-05-desktop-mcp-agent-vision.md`  
Мастер-контекст (архив): `tasks/_archive/2026-08/TZD-00.done.md`  
Код: `desktop/`

## Streams

| Stream | IDs | Status |
|--------|-----|--------|
| Import / AI pipeline (from TZD-00) | TZD-01…04, 06…10 | PARKED until PO resumes |
| **Web pairing (parallel OK)** | **TZD-05** | READY — no conflict with MCP |
| **MCP agent socket** | **TZD-11…15** | TZD-11–12 DONE; TZD-13…15 READY |

## Parallel hint

- **TZD-05** (web pairing button) ∥ safe vs MCP (`desktop/mcp` only for TZD-13).
- TZD-13 waits for PO «делай».

## MCP order

1. TZD-11 foundation ✅ DONE  
2. TZD-12 reads ✅ DONE  
3. TZD-13 writes + mutation journal  
4. TZD-14 desktop host autostart  
5. TZD-15 inbox workspace  

Do not start without PO «делай TZD-NN». Empty `_active` ≠ auto-start.
