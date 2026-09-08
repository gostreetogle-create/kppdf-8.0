# PROMPT — Claude: DocStudio S47–S48 field map (AUDIT → FIX)

Скопируй целиком. Сначала аудит, потом код.

```
Ты executor kppdf-8.0 (agent_id: claude). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-S47-S48.md
Cursor audit (обязательно прочитай): docs/audits/2026-09-08-docstudio-table-field-binding-audit.md
Канон колонок КП (скрин PO): Артикул | Фото | Наименование | Описание | Ед.Изм. | Цена — маппинг по column.key, не по индексу.

═══ ОЧЕРЕДЬ ═══
0) tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S47-AUDIT-RECHECK.md
   ТОЛЬКО аудит. Открой файлы сам. Напиши docs/audits/2026-09-08-docstudio-table-field-binding-audit-claude-recheck.md
   Verdict PASS или BLOCK. Код продукта ЗАПРЕЩЁН.
   Если BLOCK → STOP + Executor report. Не начинай S47.

1) Только при PASS: tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S47-COLUMN-MAP-PARITY.md
   alias parity + LineItem + re-hydrate при смене шаблона/колонок + тесты.

2) tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S48-TABLE-PHOTO-CELLS.md
   thumbnail / «Нет фото» в колонке Фото + PDF path.

Цикл: Claim → (0: docs only) → gates → archive → next.
После 2: WAVE DONE, _NOW Claude IDLE, Executor report все SHA.

НЕ: Chrome C*; /desk; shipping; Excel; wipe; document-template mega-refactor; паузы.
Не спрашивай «продолжать?».
```
