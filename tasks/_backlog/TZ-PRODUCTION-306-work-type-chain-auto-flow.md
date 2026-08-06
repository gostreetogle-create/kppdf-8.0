═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-306: WorkType chain auto-flow (✅ → next)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — plug-in after 305; feeds gantt/auto bars in cockpit.
CANON: TZ-PRODUCTION-300 Lego.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5 / §7 #11
MODE A: Q7 → configurable order per module

РОЛЬ АГЕНТА: Backend production (+ thin cockpit refresh)
ЗАВИСИМОСТИ: TZ-WORKTYPES-*; TZ-PRODUCTION-305
LAYER: 4

CONFLICT KEYS:
backend module work-type order / production state;
frontend/src/app/pages/production/** (optional auto-chain cues);
docs/agent-checklists/TZ-PRODUCTION-306.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Цепочка операций на модуле (сварка → покраска → …) должна быть
configurable; ✅ на check-in двигает следующую операцию.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Ordered workTypes на module (admin/designer config).
ШАГ 2 — On day_done / ✅ → advance next WorkType.
ШАГ 3 — Last done → module.productionDone signal для 307.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Chain advances on ✅.
2. Manual override / reorder possible for admin.
3. Executor report.

known_limitation: —
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
