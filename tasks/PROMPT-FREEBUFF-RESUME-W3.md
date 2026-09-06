# PROMPT — Freebuff RESUME W3 (loop crash mid-impl)

Скопируй целиком. **Не с нуля** — WIP уже на диске. W2 DONE (`f7b9242a`).

```
Ты executor kppdf-8.0 (agent_id: freebuff). GEMINI.md + docs/how-to-connect-ai.md.

═══ СОСТОЯНИЕ ═══
W2 archived+pushed: f7b9242a. Не трогай W2 balances files.
W3 CLAIMED: tasks/_active/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md
Checklist: docs/agent-checklists/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md (AC/gates ещё пустые; сессия умерла после page/dialog + typecheck fix)
TZ: tasks/_ready/nx-warehouse/TZ-NX-WAREHOUSE-W3-MOVEMENTS.md

WIP uncommitted (читай и доведи, НЕ переписывай с нуля):
- frontend-nx/libs/data-access/src/lib/warehouse/stock-movement.types.ts
- frontend-nx/libs/data-access/src/lib/warehouse/pi-stock-movements.service.ts
- frontend-nx/libs/data-access/src/lib/warehouse/index.ts
- frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movements.page.ts
- frontend-nx/apps/kppdf-web/src/app/pages/warehouse/stock-movement-form-dialog.component.ts

Канон W3:
- Журнал + фильтры type/warehouse
- +Приход / +Расход: material XOR product, warehouse, qty>0; note→documentRef; orderId отдельно
- POST /stock-movements; НЕТ transfer create UI
- Не backend, не /supply, не desktop, не W2 files

═══ СДЕЛАТЬ ═══
1) git status + прочитай WIP. Обнови claimed_at. Не снимай claim.
2) Доведи compile/UX до AC; добавь focused specs (page/dialog/service) если ещё нет.
3) Обнови docs/pages/stock-movements.page.md
4) Gates: focused jest → tsc app → eslint W3 paths → architecture (чужие FAIL = N/A) → git diff --check → LAST nx build kppdf-web
5) Commit/push только W3 paths → archive 2026-09 + lock + снять _active
6) Сразу W4-CLOSEOUT. Не спрашивай «продолжать?»

S1 supply = Claude after W3 archive (не бери сам).
```
