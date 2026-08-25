# PROMPT — Freebuff CATALOG-377 (после closeout 440)

> В новый чат Freebuff **после** `PROMPT-FREEBUFF-CLOSEOUT-440` (или когда `_active` пуст).

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0 на main.
GEMINI.md + .agents/skills/kppdf-executor-loop/SKILL.md + docs/PO-CANON.md
Перед UI: docs/ui-rules.md · docs/CONTEXT.md

Очередь: tasks/QUEUE-LIVE.md → CATALOG-377

CLAIM первым (до кода):
1) Get-Location + git rev-parse → D:\kppdf-8.0
2) tasks/_active/ пуст (нет чужих 440)
3) tasks/_active/TZ-CATALOG-377-*.md + checklist docs/agent-checklists/_TEMPLATE.md
4) Status CLAIMED; Claim slot: agent_id + claimed_at (ISO) + workspace
5) Conflict keys TZ vs чужой WIP → STOP

Затем: прочитай и выполни tasks/TZ-CATALOG-377-category-reference-canon.md
Цель: категории — name-path fullPath + RU pickers (не slug «metals») + write-through + UX /categories.

Gates из TZ. Archive + commit/push после PASS.
НЕ deploy / wipe. Не трогай order-hub-tray / shipping (волна 440 закрыта).
```
