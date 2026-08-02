═══════════════════════════════════════════════════════════════
TZ-INVENTORY-301: Availability check + reserve on Order (S4)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S4 / §7 #5

РОЛЬ АГЕНТА: Backend inventory
ЗАВИСИМОСТИ: TZ-PRODUCTION-301 (spec approved); Z-001 transactions
LAYER: 4

CONFLICT KEYS:
backend stock-movement / storage-item / order modules;
docs/agent-checklists/TZ-INVENTORY-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

После Specification: проверка всех материалов спеки; reserve или shortage.
Z-001 уже даёт atomic write paths — reuse SessionRunner.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Aggregate materials from Specification snapshot.
ШАГ 2 — Availability API (enough / missing list).
ШАГ 3 — Reserve via transactional StockMovement + reservation flag на Order.
ШАГ 4 — On shortage emit signal / call-site для PROCUREMENT-301.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Reserve atomic (нет partial deduct без rollback).
2. Shortage list корректна по спеке.
3. Executor report.

known_limitation: No full WMS UI. No barcode.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
