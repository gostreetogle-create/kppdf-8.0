# PROMPT — Freebuff: запушить leftover CORE-302 (deletedAt)

> На диске незакоммиченные `deletedAt` (~44 schema) + spec. Origin без них.
> Cursor коммитит доки отдельно. Deploy нет.

**PO:** новый чат Freebuff, блок ниже.

---

```text
Ты — executor kppdf-8.0. Репо: D:\kppdf-8.0
GEMINI.md + kppdf-executor-loop.
TZ: tasks/TZ-CORE-304-land-core-302-group-b.md

НЕ git add -A. НЕ трогать docs/PO-*.md, CLAUDE.md, .agents/skills, frontend, desktop.
Только CONFLICT KEYS из TZ (схемы + soft-delete-coverage.spec.ts).

CLAIM до кода: tasks/_active/TZ-CORE-304.md; checklist; agent_id=freebuff.

Суть: CORE-302 Group B (deletedAt) остался локальным WIP. Закоммить как есть,
если nested _id:false — без deletedAt. Gates: backend tsc + jest spec 1/1.
Commit + push. Archive 2026-08/TZ-CORE-304.done.md. Без деплоя.
```
