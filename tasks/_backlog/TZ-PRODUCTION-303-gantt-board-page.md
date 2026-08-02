═══════════════════════════════════════════════════════════════
TZ-PRODUCTION-303: Gantt board page (S5 visualization)
═══════════════════════════════════════════════════════════════

STATUS: BACKLOG (parked) — не active в tasks/ до PO un-park.
SOURCE: docs/compose/plans/2026-08-02-shop-customer-lifecycle.md §2 S5 / §7 #8
UNPARK: tasks/_backlog/vision/GANT-calendar.md when deps met

РОЛЬ АГЕНТА: Frontend Gantt page
ЗАВИСИМОСТИ: TZ-PRODUCTION-302; People linked (WORKERS-*)
LAYER: 3

CONFLICT KEYS:
frontend/src/app/pages/production/ (or gantt NEW);
frontend/src/app/app.routes.ts;
frontend/src/app/layout/app-layout.component.ts;
docs/pages/ (gantt/production page.md);
docs/agent-checklists/TZ-PRODUCTION-303.md

═══════════════════════════════════════════════════════════════
ИСХОДНОЕ СОСТОЯНИЕ
═══════════════════════════════════════════════════════════════

Нет страницы Ганта. Vision: 🔜 READY_WHEN_DEPS. Нужна lite-визуализация
bars по module/workType/days + слоты работников. Paper & Ink, не MS Project.

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — Route /production/gantt (+ nav + ACCESS page key).
ШАГ 2 — Bars by module / workType / days from PRODUCTION-302.
ШАГ 3 — Worker assignment slots (People).
ШАГ 4 — Paper & Ink lite layout; не overbuild.

═══════════════════════════════════════════════════════════════
КРИТЕРИИ ПРИЁМКИ
═══════════════════════════════════════════════════════════════

1. Page renders schedule for at least one order/module happy-path.
2. Nav visible for Director/Manager (и production role если есть).
3. Executor report.

known_limitation: Not MS Project clone. Stuck/check-in — 304/305.
ПРОМПТ: GEMINI.md + этот файл. Push: по PO.
