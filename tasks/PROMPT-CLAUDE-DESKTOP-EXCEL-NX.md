# PROMPT — Claude: Desktop Excel NX-align (TZD-68→70)

Скопируй агенту **целиком**. Параллель с Freebuff W2 **ок** (ты только `desktop/**`; он `frontend-nx/**/warehouse/**`). Не трогай `app.routes` / supply.

```
Ты executor kppdf-8.0 (agent_id: claude). Контракт: GEMINI.md + CLAUDE.md + docs/how-to-connect-ai.md.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — не спрашивай «продолжать?».

WAVE: tasks/_backlog/desktop/WAVE-DESKTOP-EXCEL-NX-ALIGN.md
Аудит: docs/audits/2026-09-05-desktop-excel-nx-align-audit.md
Параллель: Freebuff W2 warehouse — НЕ пересекаться (ты desktop only).

Очередь (строго по одной TZ, archive перед следующей):
1) tasks/_ready/desktop/TZD-68-excel-export-with-data.md
2) tasks/_ready/desktop/TZD-69-import-targets-nx-align.md
3) tasks/_ready/desktop/TZD-70-send-ready-ux.md

Правила:
- Claim slot + checklist docs/agent-checklists/TZD-NN.md ДО кода.
- Только desktop/** (+ checklist/docs из TZ). НЕ frontend-nx. НЕ Excel в /registries. НЕ SUPPLY S1.
- Units НЕ добавлять. warehouse.type НЕ убирать. Worker targetKey = worker.
- Gates: cd desktop && npx tsc --noEmit && npx tsx --test (core + importers по TZ).
- Archive tasks/_archive/2026-09/ + lock. После 70 — STOP; отчёт Cursor.
- S1 supply — только после W2 archive (отдельный промпт).

Старт: git status → claim TZD-68 → код.
```
