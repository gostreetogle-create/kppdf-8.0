# PROMPT — 2026-08-17 morning / swarm resume

Скопируй в Freebuff **или** дай Cursor: «продолжи с `_NOW.md`».

```text
Репо: D:\kppdf-8.0
GEMINI.md + kppdf-executor-loop
Аудит Ганта: docs/audits/2026-08-16-gantt-workers-tint-assign-audit.md
Очередь: tasks/_backlog/QUEUE.md + docs/agent-checklists/_NOW.md

ПОРЯДОК (строго):
1) TZ-PRODUCTION-352 (tint fallback) — если ещё не DONE
2) TZ-PRODUCTION-353 (unassigned banner) — только после 352
3) TZ-SALES-369 (КП PDF filename) — можно параллельно с 352/353 (другие files)
4) TZD-39 — closeout/archive если код уже на main; не deploy в TZ
5) Дальше drain: TZD-56 → TZD-47 → MIG-302…  (PROMPT-FREEBUFF-TASKS-DRAIN)
_park/** НЕ ТРОГАТЬ

КОМУ ЧТО:
- Freebuff: 352, 353, 369, TZD-39 closeout, тонкий drain
- Cursor Mode A: только новые TZ / выбор hard-block Gantt / wipe
- Deploy: только если PO сказал «деплой»/«кати» → warm WIPE=false
  (VPN должен быть выключен)

СТОП: wipe, _park, параллель двух агентов на gantt-bars.component.ts
```
