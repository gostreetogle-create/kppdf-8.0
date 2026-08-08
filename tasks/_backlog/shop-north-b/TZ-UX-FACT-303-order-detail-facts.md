═══════════════════════════════════════════════════════════════
TZ-UX-FACT-303: Order-detail passport → FactCard / FactStack
═══════════════════════════════════════════════════════════════

STATUS: READY · WAVE-SHOP-NORTH-B #5
DEPENDS ON: FACT-301/302 DONE; ORDERS-304/305 DONE (wave order — facts after ready/materials UI)
LAYER: 3
CHECKLIST: docs/agent-checklists/TZ-UX-FACT-303.md
AUDIT: docs/audits/2026-08-09-fact-card-adoption.md
PAGES: /orders/:id

РОЛЬ: Frontend only

CONFLICT KEYS:
frontend/src/app/pages/orders/**;
frontend/src/app/shared/ui/fact-card/**;
docs/pages/ui-fact-card.md;
docs/agent-checklists/TZ-UX-FACT-303.md;

---

## ИСХОДНОЕ

order-detail side meta / dense dl — FAIL в FactCard adoption audit.

## ЧТО ДЕЛАТЬ

1. Боковой/верхний passport заказа: FactStack (номер, клиент, объект, статус, materialsSource, даты).  
2. Деньги сделки на заказе **не** возвращать (strip KP остаётся) — не FactCard прайса КП.  
3. Reuse PiFactCard; русские captions.  
4. Не трогать composition-tree / BomPanel.

## НЕ

desktop; Gantt; SALES-304; table-cell FactCards.

## AC

1. Visible FactStack на order-detail; нет сырого dl-каша в той зоне.  
2. FE tsc + существующие order specs зелёные.  
3. ui-fact-card.md: order ADOPTED.
