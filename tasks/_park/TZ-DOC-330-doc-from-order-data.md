═══════════════════════════════════════════════════════════════
TZ-DOC-330: Doc generation from order / shipment data (glue)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S6 / §7 #14
NOTE: Proposed ID TZ-DOC-322 occupied by text-block archive. This file = DOC-330.

РОЛЬ АГЕНТА: Frontend DocConstructor glue
ЗАВИСИМОСТИ: DocConstructor ready (DOC-308+); TZ-SHIPPING-301 parallel OK
LAYER: 3

CONFLICT KEYS:
doc-constructor generate paths;
order/shipment payload mapping;
docs/agent-checklists/TZ-DOC-330.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Шаблоны DocConstructor есть; нет glue «заполнить из order/shipment
snapshot» без ручного перетирания полей.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — API generateFromOrder (или shipment) с snapshot payload.
ШАГ 2 — Map snapshot fields → template blocks.
ШАГ 3 — Save to generated documents; handoff SHIPPING-301.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Doc generated without manual retype of order fields.
2. Uses immutable snapshot, не live catalog FK-only.
3. Executor report.

known_limitation: No new block types. DOC-322 text-block history не трогать.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
