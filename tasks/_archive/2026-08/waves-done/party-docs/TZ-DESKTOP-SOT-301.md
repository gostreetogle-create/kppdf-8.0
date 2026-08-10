═══════════════════════════════════════════════════════════════
TZ-DESKTOP-SOT-301: Desktop MCP SoT (mcp vs mcp-runtime)
═══════════════════════════════════════════════════════════════

STATUS: BLOCKED_UNTIL_ASSETS302 · WAVE-PARTY-DOCS #7
DEPENDS ON: после #6 (или конец волны) → READY; **до** любых новых MCP tools
LAYER: 2–3
CHECKLIST: docs/agent-checklists/TZ-DESKTOP-SOT-301.md
PAGES: n/a (desktop)

РОЛЬ: Desktop maintainer

CONFLICT KEYS:
desktop/mcp/**;
desktop/mcp-runtime/**;
desktop/package.json;
docs/agent-checklists/TZ-DESKTOP-SOT-301.md;

---

## ИСХОДНОЕ

На диске часто untracked `desktop/mcp-runtime/**` рядом с `desktop/mcp`.  
TZD-30 уже закрыт в mcp. Peers: решить SoT до W6 новых tools.

## ЧТО ДЕЛАТЬ

1. Audit: что в `mcp` vs `mcp-runtime` (дубли, deps, entry).  
2. Решение в docs: **одна** SoT-папка; вторая — archive/delete/README redirect.  
3. package scripts указывают на SoT.  
4. Не ломать TZD-30 tools.  
5. Короткий ADR в `docs/audits/` или desktop README.

## НЕ

- Новые MCP tools (тексты уже есть)  
- Party FE  
- deploy  

## AC

1. Одна каноническая MCP runtime path.  
2. Build/test desktop MCP зелёный.  
3. Archive + push; deploy NO.
