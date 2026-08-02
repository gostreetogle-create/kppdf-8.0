═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-302: WorkType.days config (calendar days)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5 / §7 #7
MODE A: Q3 → WorkType.days first; Q8 → calendar days

РОЛЬ АГЕНТА: Backend + work-types UI
ЗАВИСИМОСТИ: TZ-WORKTYPES-* (catalog exists); before Gantt
LAYER: 4

CONFLICT KEYS:
backend work-type schema/DTO;
frontend work-types page / dialog;
docs/agent-checklists/TZ-PRODUCTION-302.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Gantt нужен days estimation. Default: поле WorkType.days (calendar).
Module.totalDays — successor optional TZ, не этот.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Field days на WorkType (+ migration/DTO).
ШАГ 2 — UI edit на work-types.
ШАГ 3 — Validation: >0 или null (= stuck later in PRODUCTION-304).

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. days сохраняется round-trip.
2. Null допустим (stuck path).
3. Executor report.

known_limitation: Module.totalDays не в scope. Work-day calendar later.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
