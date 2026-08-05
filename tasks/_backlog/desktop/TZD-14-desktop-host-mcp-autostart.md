═══════════════════════════════════════════════════════════════
TZD-14: Desktop hosts MCP (autostart + status UI)
═══════════════════════════════════════════════════════════════

> PARKED. After TZD-11. LAYER 2 · `desktop/` UI + process.
> CONFLICT: `desktop/src/**`; `desktop/src-tauri/**` (sidecar/command); `desktop/docs/MCP.md`
> Vision §1–2.

РОЛЬ АГЕНТА: executor (Tauri + Svelte).

ЗАВИСИМОСТИ: TZD-11 (server binary/script exists).

Проверено: `desktop/src/App.svelte`; Tauri 2 capabilities; vision TZD-14.

---

## ЧТО ДЕЛАТЬ

1. On desktop launch (when paired): start MCP host on 127.0.0.1:configurable port.
2. UI status: Running / Stopped / Error; show **URL + port** (copy button); LAN bind toggle default OFF.
3. Stop MCP on quit; restart button.
4. Persist port/bind prefs in existing config.ts (versioned).
5. Docs: manager-facing «как подключить любого MCP-клиента» without Cursor brand requirement.

---

## НЕ

- Implement TZD-13 writes here.
- Force cloud model download.
- Change web app except optional deep-link later (out of scope).

---

## ACCEPTANCE

- [ ] Paired desktop → MCP up without terminal.
- [ ] Unpaired → MCP not started (or clearly disabled).
- [ ] Copy connect info works.
- [ ] `pnpm typecheck` / svelte-check PASS for desktop.

CONFLICT KEYS: `desktop/src/;desktop/src-tauri/;desktop/docs/MCP.md;desktop/src/core/config.ts`
