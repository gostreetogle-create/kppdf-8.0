# WAVE-DOCSTUDIO-S47-S48 — сопоставление полей таблицы

**Audit:** `docs/audits/2026-09-08-docstudio-table-field-binding-audit.md`  
**Промпт:** `tasks/PROMPT-CLAUDE-DOCSTUDIO-S47-S48-FIELD-MAP.md`  
**Исполнитель:** `agent_id: claude`  
**Статус:** READY

| # | SIZE | TZ | Path | Status |
|---|------|-----|------|--------|
| 0 | S | Re-audit (no code) | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK.md` | DONE — PASS, see `docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md` |
| 1 | L | Column map parity + re-hydrate | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md` | DONE — alias parity + LineItem enrichment + rehydrate-on-column-change + BUG-5 hidden-column fix |
| 2 | L | Photo cells on canvas + PDF | `tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS.md` | DONE — `<img>`/«Нет фото» on canvas + backend PDF/preview, key-based detection |

**WAVE DONE** — 2026-09-08. Все три строки закрыты; `_NOW` Claude → IDLE.
**Правило:** без PASS файла re-audit → **не** начинать S47 fix.  
**Не в волне:** Chrome IA C*; `/desk`; shipping; Excel; wipe; legacy Create КП rewrite.
