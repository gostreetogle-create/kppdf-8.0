═══════════════════════════════════════════════════════════════
WAVE-SHOP-NORTH-B — цех/снабжение/UX (параллель Desktop)
═══════════════════════════════════════════════════════════════

STATUS: DONE — #1–#7 DONE; idle (deploy только по команде PO)
PARALLEL OK с: idle Desktop (SoT `desktop/mcp`); не параллелить с живым claim на те же CONFLICT KEYS
SoT: D:\kppdf-8.0 на main

## Порядок (строго)

| # | ID | Файл | Статус |
|---|-----|------|--------|
| 1 | TZ-SUPPLY-302 | TZ-SUPPLY-302-bom-explode-tasks.md | ✅ DONE → `tasks/_archive/2026-08/TZ-SUPPLY-302.done.md` |
| 2 | TZ-ORDERS-304 | TZ-ORDERS-304-line-module-ready.md | ✅ DONE → `tasks/_archive/2026-08/TZ-ORDERS-304.done.md` |
| 3 | TZ-ORDERS-305 | TZ-ORDERS-305-soft-materials-gate.md | ✅ DONE → `tasks/_archive/2026-08/TZ-ORDERS-305.done.md` |
| 4 | TZ-SALES-302 | TZ-SALES-302-kp-send-versions.md | ✅ DONE → `tasks/_archive/2026-08/TZ-SALES-302.done.md` |
| 5 | TZ-UX-FACT-303 | TZ-UX-FACT-303-order-detail-facts.md | ✅ DONE → `tasks/_archive/2026-08/TZ-UX-FACT-303.done.md` |
| 6 | TZ-UX-FACT-304 | TZ-UX-FACT-304-material-detail-facts.md | ✅ DONE → `tasks/_archive/2026-08/TZ-UX-FACT-304.done.md` |
| 7 | TZ-UX-FORM-307 | TZ-UX-FORM-307-form-wave-b-batch1.md | ✅ DONE → `tasks/_archive/2026-08/TZ-UX-FORM-307.done.md` |

Цикл: CLAIM → код → gates → archive → commit+push → следующий. Без «поехали».
После #7 → волна DONE → idle; деплой только по команде PO.

## Жёсткий BAN (этот агент)

- desktop/** · desktop/mcp/** · TZD-*  
- backend import-task · mutation-journal  
- app.routes.ts (Desktop TZD-29)  
- SALES-304 · SHIPPING-301 · PRODUCTION-308…310 · Gantt drag  
- composition-tree rewrite · deploy.ps1  
- claim INN-301 · воскрешение #1–#6  

## DoD волны

Supply умеет взорвать BOM в задачи; на заказе есть ready + soft materials;
КП версии при отправке; order/material FactCards; batch-1 form sections.
