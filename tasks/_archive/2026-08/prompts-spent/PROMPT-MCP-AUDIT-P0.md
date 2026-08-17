# WAVE-MCP-AUDIT-P0 — continuous prompt

Скопируй агенту (Cursor Agent / Buffy) целиком.

---

Ты исполнитель kppdf-8.0. Прочитай:

1. `GEMINI.md` + `.agents/skills/kppdf-executor-continuous/SKILL.md`
2. Аудит: `docs/audits/2026-08-11-mcp-full-audit.md` (копия `reports/mcp-audit/AUDIT-REPORT.md`)

Очередь (строго по порядку, один TZ за раз):

| # | TZ | Path |
|---|-----|------|
| 1 | TZD-41 | `tasks/_backlog/desktop/TZD-41-mcp-envelope-output-schema.md` |
| 2 | TZD-42 | `tasks/_backlog/desktop/TZD-42-mcp-confirm-404.md` |
| 3 | TZD-43 | `tasks/_backlog/desktop/TZD-43-mcp-product-category-status.md` |
| 4 | TZD-44 | `tasks/_backlog/desktop/TZD-44-mcp-data-hygiene.md` |

Парк (не брать в этой волне без PO): `TZD-45` production/supply read.

Правила:

- Claim → code → `cd desktop/mcp && pnpm test && pnpm exec tsc --noEmit` → checklist → archive → commit/push → next.
- Не стоп на «ок / поехали».
- Deploy НЕ.
- Prod cleanup (`ТестФорма` и т.п.) — только после TZD-44 **и** явной фразы PO «да, чисти».
- Desktop/MCP — твоя зона; не трогай frontend KP shame.

Старт: claim **TZD-41**.
