═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-307: Product / Order productionComplete state
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — plug-in after 306; handoff to shipping from cockpit.
CANON: TZ-PRODUCTION-300 Lego.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5→S6 / §7 #12

РОЛЬ АГЕНТА: Backend (+ completion cue on cockpit)
ЗАВИСИМОСТИ: TZ-PRODUCTION-306
LAYER: 4

CONFLICT KEYS:
backend product/order production flags;
shipping queue handoff;
frontend/src/app/pages/production/** (completion badge optional);
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
