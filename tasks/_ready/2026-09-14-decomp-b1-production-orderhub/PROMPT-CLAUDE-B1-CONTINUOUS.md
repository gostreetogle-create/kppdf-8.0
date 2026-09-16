# PROMPT — Claude continuous — DECOMP B1 (Production → Order hub)

Скопируй целиком. UNATTENDED. После B1 STOP (не начинай B2 без отдельного промпта / если batch README говорит continuous batch — тогда читай parent).

Ты executor `agent_id: claude`. D:\kppdf-8.0.
UNATTENDED: docs/agents/CLAUDE-UNATTENDED.md — без «продолжать?».

SoT: tasks/_ready/2026-09-14-decomp-b1-production-orderhub/WAVE-MAP.md
Tracker: создай/веди docs/agent-checklists/WAVE-DECOMP-B1-PRODUCTION-ORDERHUB.md (таблица TZ + SHA)

Старт: Get-Location + git rev-parse; tasks/_active пуст; baseline nx build kppdf-web exit 0.
STOP если Studio editor-decomp или другой kppdf-web TZ в _active.

Очередь:
A1 TZ-NX-GANTT-BARS-FACADE
A2 TZ-NX-GANTT-BARS-UTIL-UI
A3 TZ-NX-PRODUCTION-COCKPIT-FACADE
A4 TZ-NX-PRODUCTION-TO-FEATURES
B1 TZ-NX-ORDER-HUB-FACADE
B2 TZ-NX-ORDER-HUB-UI-FEATURES

На каждую: claim (active+checklist+_TEMPLATE) → code per TZ → gates (tsc + testPathPattern from TZ + nx build LAST) → Integrity → Executor report+SHA → archive → next.

Инварианты: ProductionReadFacade не сливать с write facade; page/tray host chrome в app; Signals; providers не root; no behavior change.

Конец B1: WAVE-MAP DONE, tracker DONE, отчёт SHA, STOP (или продолжай B2 только если PO дал batch continuous — см. DECOMP-BATCH-README).
