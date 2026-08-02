═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-304: Stuck products — Gantt inline alarm
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5 / §7 #9
MODE A: Q4 → inline alarm on Gantt (не separate board)

РОЛЬ АГЕНТА: Frontend Gantt alarm
ЗАВИСИМОСТИ: TZ-PRODUCTION-303
LAYER: 3

CONFLICT KEYS:
frontend gantt / production page (same as 303);
docs/agent-checklists/TZ-PRODUCTION-304.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Если WorkType.days null — продукт «stuck» на Ганте. Нужен alarm +
manager fill dialog, без отдельной stuck-страницы.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Detect null/missing days на bars.
ШАГ 2 — Alarm badge + manager fill-days dialog.
ШАГ 3 — On fill → reschedule / refresh bars.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Alarm visible when days missing.
2. Fill clears stuck и обновляет schedule.
3. Executor report.

known_limitation: No separate stuck board page.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
