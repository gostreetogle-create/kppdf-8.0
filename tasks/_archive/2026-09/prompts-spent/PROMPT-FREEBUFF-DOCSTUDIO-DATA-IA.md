# PROMPT — Freebuff: Doc Studio Data IA (D50–D54)

Выдать **после** WAVE-NX-GANTT-POLISH P5 (не параллелить с другим Freebuff на `kppdf-web`).

```
═══ START ═══

Continuous executor · D:\kppdf-8.0 · main · agent_id: freebuff

Прочитай: GEMINI.md · kppdf-executor-loop · docs/PO-CANON.md · docs/PO-SHARED-UNDERSTANDING.md

WAVE: docs/agent-checklists/WAVE-DOCSTUDIO-DATA-IA.md
INDEX: tasks/_ready/docstudio-data-ia/INDEX.md
Audit: docs/audits/2026-09-05-docstudio-data-panel-ia-audit.md

Начни с первой [ ] в WAVE. Не останавливайся между D50–D54.
STOP: все [x] · blocker · чужой active на тех же conflict keys.

Gates каждой: LAST = cd frontend-nx && pnpm exec nx build kppdf-web

Порядок:
 D50 …/TZ-NX-DOCSTUDIO-D50-DATA-IA-SHELL.md
 D51 …/TZ-NX-DOCSTUDIO-D51-SELECTED-BUFFER.md
 D52 …/TZ-NX-DOCSTUDIO-D52-INSERT-SUGGEST.md
 D53 …/TZ-NX-DOCSTUDIO-D53-PARTY-COPY.md
 D54 …/TZ-NX-DOCSTUDIO-D54-DOCS-SMOKE.md

ЗАПРЕТЫ: auto-insert без клика; новые BE endpoints; Gantt; legacy frontend delete; второй write-path.

ФИНАЛ: WAVE [x] · _active пуст · push · краткий отчёт PO

═══ END ═══
```
