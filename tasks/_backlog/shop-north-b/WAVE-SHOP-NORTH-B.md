═══════════════════════════════════════════════════════════════
WAVE-SHOP-NORTH-B — цех/снабжение/UX (параллель Desktop)
═══════════════════════════════════════════════════════════════

STATUS: READY
PARALLEL OK с: Desktop TZD-23…29 (другой агент)
SoT: D:\kppdf-8.0 на main

## Порядок (строго)

| # | ID | Файл |
|---|-----|------|
| 1 | TZ-SUPPLY-302 | TZ-SUPPLY-302-bom-explode-tasks.md |
| 2 | TZ-ORDERS-304 | TZ-ORDERS-304-line-module-ready.md |
| 3 | TZ-ORDERS-305 | TZ-ORDERS-305-soft-materials-gate.md |
| 4 | TZ-SALES-302 | TZ-SALES-302-kp-send-versions.md |
| 5 | TZ-UX-FACT-303 | TZ-UX-FACT-303-order-detail-facts.md |
| 6 | TZ-UX-FACT-304 | TZ-UX-FACT-304-material-detail-facts.md |
| 7 | TZ-UX-FORM-307 | TZ-UX-FORM-307-form-wave-b-batch1.md |

Цикл: CLAIM → код → gates → archive → commit+push → следующий. Без «поехали».
Deploy — только по команде PO.

## Жёсткий BAN (этот агент)

- desktop/** · desktop/mcp/** · TZD-*  
- backend import-task · mutation-journal  
- app.routes.ts (Desktop TZD-29)  
- SALES-304 · SHIPPING-301 · PRODUCTION-308…310 · Gantt drag  
- composition-tree rewrite · deploy.ps1  

## DoD волны

Supply умеет взорвать BOM в задачи; на заказе есть ready + soft materials;
КП версии при отправке; order/material FactCards; batch-1 form sections.
