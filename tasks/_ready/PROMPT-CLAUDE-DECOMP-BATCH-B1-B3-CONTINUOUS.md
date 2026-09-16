# PROMPT — Claude continuous — FULL DECOMP BATCH B1→B2→B3

> Используй, когда Studio editor-decomp **не** в `_active` и нужен один AFK прогон всех трёх блоков.
> Parent: `tasks/_ready/2026-09-14-DECOMP-BATCH-README.md`

Ты executor `agent_id: claude`. D:\kppdf-8.0.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — без «продолжать?». Deploy/wipe — STOP.

## Старт
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) GEMINI.md + how-to-connect-ai.md
3) `tasks/_active/` пуст; нет чужого CLAIM на kppdf-web
4) Baseline: `cd frontend-nx && pnpm exec nx build kppdf-web` → 0

## Порядок блоков (жёстко)
1. Выполни целиком pack B1 по его PROMPT-CLAUDE-B1-CONTINUOUS.md / WAVE-MAP
2. Затем B2 (PROMPT-CLAUDE-B2-CONTINUOUS.md)
3. Затем B3 (PROMPT-CLAUDE-B3-CONTINUOUS.md)

Trackers:
- docs/agent-checklists/WAVE-DECOMP-B1-PRODUCTION-ORDERHUB.md
- docs/agent-checklists/WAVE-DECOMP-B2-SUPPLY-WAREHOUSE.md
- docs/agent-checklists/WAVE-DECOMP-B3-PROPOSALS.md

На каждую TZ: claim → implement (no behavior change) → gates + nx build LAST → archive → next.

Инварианты эталона Studio: Signals Facade; page в app; features ui; providers не root; ProductionReadFacade не сливать с write.

Конец: все три WAVE-MAP DONE, _NOW IDLE, отчёт всех SHA, STOP.
Не трогай: Studio editor pack (если уже DONE — ok), role-form, registry fat forms, Phase 5 studio split.
