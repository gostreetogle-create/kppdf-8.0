═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-301: Design verification flow (S3)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S3 / §7 #3

РОЛЬ АГЕНТА: Backend + UI lite
ЗАВИСИМОСТИ: TZ-ORDERS-301
LAYER: 4

CONFLICT KEYS:
backend design-task / production modules (NEW or extend);
frontend/src/app/pages/ (design tasks page NEW);
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/agent-checklists/TZ-PRODUCTION-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

После Заказа нужен авто DesignTask: проектировщик verify modules/materials,
выход — Specification snapshot + approve. Early-exit если
Product.isReadyForProduction (PRODUCTS-306).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — DesignTask entity + create on Order (из ORDERS-301 hook).
ШАГ 2 — Approve → Specification snapshot (immutable) + flags.
ШАГ 3 — Skip path если isReadyForProduction === true → S4/S5 без UI bottleneck.
ШАГ 4 — Thin UI: список задач проектировщика + approve action.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Designer can approve; Specification snapshot сохраняется.
2. Skip S3 работает при ready-flag.
3. Snapshot не меняется при правке ProductModule после approve.
4. Executor report.

known_limitation: No Gantt. No full CAD. PRODUCTS-306 может идти schema-first parallel.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
