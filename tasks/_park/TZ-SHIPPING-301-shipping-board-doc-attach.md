═══════════════════════════════════════════════════════════════
TZ-SHIPPING-301: Shipping board + doc attach (S6)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
HARD BAN (2026-08-07 stabilize): не стартовать до DONE 303.1 + стабильного показа Ганта;
  deps на PRODUCTION-307 остаются; не смешивать с Gantt CONFLICT KEYS.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S6 / §7 #13;
  docs/audits/2026-08-07-first-look-project-audit.md

РОЛЬ АГЕНТА: Frontend + backend shipping
ЗАВИСИМОСТИ: TZ-PRODUCTION-307; TZ-DOC-330 (parallel OK for glue)
LAYER: 3

CONFLICT KEYS:
frontend shipping UI;
backend shipment module;
docs/agent-checklists/TZ-SHIPPING-301.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

S6 board: ready / waiting / shipped + prepare docs + print/ship.
Partial shipment UI may exist — нужен board + attach filled doc.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Shipping board page (status chips).
ШАГ 2 — Attach filled doc (from DOC-330 generate).
ШАГ 3 — Dispatch → ARCHIVE-301 (Z-001 transactions for dispatch).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Board usable for ready→shipped happy-path.
2. Doc attach + dispatch works.
3. Executor report.

known_limitation: Z-001 transactions for dispatch. No carrier tracking API.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
