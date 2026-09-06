# PROMPT — Freebuff: local demo orphan clean (B only)

Скопируй целиком. Hotfix A уже в origin (`c413bef7` под `b2080859`).

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md + kppdf-executor-loop.
Не спрашивай «продолжать?».

═══ ФАКТ ═══
Hotfix A DONE+pushed: c413bef7 (shell bleed + includeSoftDeleted). Не трогать.
Сессия зависла на metadata — код A не переоткрывать.

═══ ЗАДАЧА B ═══
TZ: tasks/_ready/ops/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md
Checklist: docs/agent-checklists/TZ-OPS-LOCAL-DEMO-ORPHAN-CLEAN.md
Аудит: docs/audits/2026-09-06-qa-shell-warehouse-populate-audit.md
PO: локальные данные виртуальные — чистить АККУРАТНО битые хвосты.

1) Claim B. Mongo URI только localhost/docker из .env — иначе STOP.
2) Создай scripts/clean-local-demo-orphans.mjs (dry-run default; --apply):
   - SupplyRequest/SupplyTask с orderId без Order
   - StockMovement с product/material id без документа (даже soft-deleted)
   - Doc Studio: снять image refs где файла нет на диске
3) dry-run → counts в checklist → --apply
4) Если экраны дырявые — node scripts/seed-local-demo.mjs
5) Commit только script + checklist/audit/archive; push; lock; очисти _active
6) _NOW: Freebuff IDLE (следующее = Chrome IA — НЕ начинай в этой сессии)
7) Executor report (auto) с counts + SHA

ЗАПРЕЩЕНО: dropDatabase; prod/Synology; правки app-shell/warehouse/DocStudio layout; Chrome C*; чужой WIP.
```
