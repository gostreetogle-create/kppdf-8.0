═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-307: Product / Order productionComplete state
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5→S6 / §7 #12

РОЛЬ АГЕНТА: Backend
ЗАВИСИМОСТИ: TZ-PRODUCTION-306
LAYER: 4

CONFLICT KEYS:
backend product/order production flags;
shipping queue handoff;
docs/agent-checklists/TZ-PRODUCTION-307.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Все modules done → productionComplete → очередь S6 shipping warehouse.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Aggregate modules productionDone.
ШАГ 2 — Set Order/Product productionComplete once.
ШАГ 3 — Trigger SHIPPING-301 queue / event.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. State set once (idempotent).
2. Shipping queue receives signal.
3. Executor report.

known_limitation: Shipping board UI — SHIPPING-301.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
