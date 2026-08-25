# PROMPT — Freebuff WAVE UX-HYGIENE-440

> PO: вставить **один раз** в новый чат Freebuff. Дальше — QUEUE-LIVE без копипаста TZ.

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md + docs/UX-FORM-CANON.md

Очередь: tasks/QUEUE-LIVE.md → WAVE UX-HYGIENE-440

Порядок (или параллель ≤2 Freebuff с разными conflict keys):
1) TZ-DESK-440-tray-honest-cta.md
2) TZ-SHIP-440-warehouse-select.md
3) TZ-UX-440-ru-labels-kp-dirty.md

CLAIM первым (до кода) на каждую:
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/<TASK-ID>.md + checklist docs/agent-checklists/_TEMPLATE.md
3) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
4) _active-map + чужие _active keys → конфликт = STOP
Затем: прочитай TZ и выполни. Archive + commit/push после gates.
НЕ deploy / wipe.

Аудит-контекст: docs/audits/2026-08-25-ux-hygiene-sweep.md
```
