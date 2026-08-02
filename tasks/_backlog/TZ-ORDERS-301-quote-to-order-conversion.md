═══════════════════════════════════════════════════════════════
TZ-ORDERS-301: КП → Order conversion (strip commerce + snapshot)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S2 / §7 #2

РОЛЬ АГЕНТА: Backend + thin UI
ЗАВИСИМОСТИ: TZ-SALES-301; TZ-CORE-301
LAYER: 4

CONFLICT KEYS:
backend/src/modules/order/;
backend proposal/quotation module (read-only convert source);
frontend/src/app/pages/proposals/ (кнопка «В заказ»);
frontend/src/app/pages/orders/ (если показ результата);
docs/agent-checklists/TZ-ORDERS-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

КП подтвердили → нужен Заказ. Сейчас нет convert API с strip commerce.
Q1/Q2 defaults: strip price/discount/total/tax; copy qty + inline
productSnapshot {name, sku, photoUrl, keyProps}.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — API convert(proposalId) → Order (идемпотентность / статус КП).
ШАГ 2 — Strip commerce fields; copy qty + product identity.
ШАГ 3 — Inline productSnapshot per item (CORE-301 pattern).
ШАГ 4 — Hook/stub auto DesignTask (PRODUCTION-301) после create.
ШАГ 5 — UI: кнопка на КП «В заказ» (enabled когда статус позволяет).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Convert создаёт Order без price/discount/total на позициях.
2. Rename Product в каталоге не меняет snapshot в Order.
3. Кнопка на КП работает для happy-path.
4. Executor report в checklist.

known_limitation: Deep PDF/КП editor out of scope. Full DesignTask UI — PRODUCTION-301.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
