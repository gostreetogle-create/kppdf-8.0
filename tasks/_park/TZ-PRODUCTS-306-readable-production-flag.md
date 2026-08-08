═══════════════════════════════════════════════════════════════
TZ-PRODUCTS-306: Product.isReadyForProduction (+ skip S3)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S3 / §7 #4

РОЛЬ АГЕНТА: Backend + product form
ЗАВИСИМОСТИ: TZ-PRODUCTION-301 (или schema-first parallel с ним)
LAYER: 4

CONFLICT KEYS:
backend/src/modules/product/;
frontend product form dialog;
docs/agent-checklists/TZ-PRODUCTS-306.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Нужен Product.isReadyForProduction (+ optional isSpecificationApproved)
для early-exit S3 на типовых повторных заказах. Q6: Designer auto-set
on Specification approve.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Schema fields + DTO + validation.
ШАГ 2 — Toggle/отображение в product form; auto-set из PRODUCTION-301 approve.
ШАГ 3 — Guard skip в PRODUCTION-301 читает этот флаг.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Fields persist round-trip.
2. Skip S3 when true (интеграция с PRODUCTION-301).
3. Executor report.

known_limitation: No cascade to already-created orders/specs.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
