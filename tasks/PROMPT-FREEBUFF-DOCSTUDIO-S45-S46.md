# PROMPT — Freebuff: DocStudio S46 → S45 (строки после drag + клик=Свойства)

Стартовать **только после** archive WAVE-DOCSTUDIO-CHROME-IA C4 и idle Freebuff.
Скопируй целиком.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + .agents/skills/kppdf-executor-loop/SKILL.md.

═══ ЦЕПОЧКА (порядок обязателен) ═══
1) tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S46-LIVE-DATA-HYDRATE.md
   Аудит: docs/audits/2026-09-06-docstudio-live-data-hydrate-audit.md
2) tasks/_ready/doc-studio/TZ-NX-DOCSTUDIO-S45-TABLE-TEXT-LOOK-NORMAL.md
   Аудит UX: docs/audits/2026-09-06-docstudio-table-select-vs-properties-audit.md

PO 2026-09-06:
A) Выбрано→вставить: строки ЕСТЬ; после drag/отпускания строки ПРОПАДАЮТ и кликами не возвращаются.
   Root cause: saveLayouts делает blocks.set(API) и затирает ephemeral settings.liveRows.
B) Клик по таблице = только выделение/drag/resize; Вкл/+Строка убрать с холста → только Свойства справа; авто-открыть Свойства.

═══ ПОРЯДОК ═══
C4 DONE? _active chrome пуст? иначе STOP.
Baseline: cd frontend-nx && pnpm exec nx build kppdf-web

S46 claim → merge preserve liveRows в saveLayouts (+ helpers/tests); safety re-hydrate; smoke drag; build; archive; Executor report (auto).

S45 claim → убрать .table-edit с canvas; строки в studio-table-properties; select→openLayerProperties; token spacing; tests; build; archive.

_NOW Freebuff IDLE.

НЕ: Chrome C* заново; persist liveRows в Mongo; warehouse; desktop; dropDatabase.
Не спрашивай «продолжать?».
```
