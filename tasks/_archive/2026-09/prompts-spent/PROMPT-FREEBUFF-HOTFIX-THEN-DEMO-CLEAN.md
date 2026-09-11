# PROMPT — Freebuff: hotfix WIP → аккуратная чистка локальных демо-хвостов

Скопируй целиком в Freebuff. Одна сессия, два этапа по порядку.

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + .agents/skills/kppdf-executor-loop/SKILL.md.

PO 2026-09-06: NX с нуля; текущие данные локальной БД — все виртуальные/демо; чистить АККУРАТНО битые хвосты; не dropDatabase; не production.

═══ ЭТАП A — hotfix код (если ещё uncommitted) ═══
TZ: tasks/_ready/nx-warehouse/TZ-NX-HOTFIX-SHELL-WAREHOUSE-POPULATE.md
Prompt-детали: tasks/PROMPT-FREEBUFF-HOTFIX-SHELL-WAREHOUSE.md

Claim → сверить WIP (убрать pi-edge-bleed с app-shell/kit header; populate includeSoftDeleted в stock-movement + storage-item; kit footer Hanken/Inter/JetBrains) →
gates: backend tsc + nx build kppdf-web →
commit/push ТОЛЬКО conflict keys + связанные page.md/audit/checklist → archive hotfix.

Если hotfix уже в main — пропусти A, в отчёте напиши SHA.

═══ ЭТАП B — чистка локальных демо-хвостов ═══
TZ: tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md
Checklist: docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md

1) Claim B (после archive A). Mongo URI только localhost/docker из .env — иначе STOP.
2) Создай scripts/clean-local-demo-orphans.mjs:
   - dry-run по умолчанию; --apply пишет удаления
   - удалить SupplyRequest/SupplyTask с orderId без Order
   - удалить StockMovement где product/material id задан, документа нет даже soft-deleted
   - Doc Studio: снять битые image refs (файла нет на диске), не сносить целые шаблоны
3) Запусти dry-run → в checklist counts → --apply
4) Если экраны дырявые — node scripts/seed-local-demo.mjs
5) Глазом: Закупки без 404-заказа; Движения без мёртвых «—»; Студия без известных 404 картинок
6) Commit script + checklist/audit; push; archive B; _NOW Freebuff IDLE
7) Executor report (auto) с counts + SHA

ЗАПРЕЩЕНО: dropDatabase, deploy wipe, Synology/prod, чужой WIP, правки DocStudio layout, «почистить весь каталог».

Не спрашивай «продолжать?».
```
