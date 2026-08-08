═══════════════════════════════════════════════════════════════
TZ-PROCUREMENT-301: Auto PurchaseRequest on shortage (S4b)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S4b / §7 #6

РОЛЬ АГЕНТА: Backend procurement
ЗАВИСИМОСТИ: TZ-INVENTORY-301
LAYER: 4

CONFLICT KEYS:
backend purchase-request / purchase-order modules;
order module (park/resume flags);
docs/agent-checklists/TZ-PROCUREMENT-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

При недостаче материалов на S4 — auto PurchaseRequest per missing material;
заказ parked до fulfill; после прихода — resume INVENTORY-301 reserve.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Auto-create PR per missing material from shortage list.
ШАГ 2 — Owner = procurement role (не designer).
ШАГ 3 — On fulfill → re-eval INVENTORY-301 / resume Order.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. PR создаётся на shortage без ручного клика менеджера.
2. Resume reserve после fulfill работает.
3. Executor report.

known_limitation: No tender UI. No multi-supplier RFQ.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
