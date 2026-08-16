# TZ-NAV-303.done — Комбайн → Проект; home = stats

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T13:55:00+03:00
closed_by: cursor-composer (unattended land + S1 fix)
TZ: TZ-NAV-303
WAVE: WAVE-HOME-STATS-COMBINE-TO-DESIGN
DEP: none
Cursor_verdict: PASS (PO-authorized finish-all)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (app-layout + deals-group-chips; 3 suites / 20 tests)
  - S1 fix: `destructive: false` on non-overdue statCards (strictTemplates)
  - lint: N/A (focused tsc + jest)
  - checklist: UPDATED DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (orchestrator deploys later)

COMMIT: bb852fbb44fd2701a89a9104cfafae6df503f96f
CLOSEOUT_COMMIT: bb852fbb44fd2701a89a9104cfafae6df503f96f

## Spec (body)

# TZ-NAV-303: Комбайн → Проект; home = stats route

> Волна: `WAVE-HOME-STATS-COMBINE-TO-DESIGN`.  
> PO: Комбайн — зона проектирования; первая страница — статистика.

РОЛЬ АГЕНТА: Frontend (shell + routes)

ЗАВИСИМОСТИ: нет (перед DASHBOARD-401)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/layout/app-layout.component.ts` ; `frontend/src/app/layout/app-layout.component.spec.ts` ; `frontend/src/app/layout/app-layout.nav-order.spec.ts` ; `frontend/src/app/app.routes.ts` ; deals TOC / group-chips если держат chip «Комбайн» ; `docs/pages/dashboard.page.md` ; `docs/pages/page-chrome.md` ; `docs/pages/PAGE-TZ-INDEX.md`

## Delivered

- `/` + `/dashboard` → `DashboardStatsPage` stub «Обзор» (cheap GET /orders counters)
- `/design/combine` → `DashboardPage` канбан (pageKey `orders` preserved)
- Nav Проект: Очередь + Комбайн; brand «Обзор — главная»
- Deals: no `/dashboard` alias; no Комбайн chip
- Docs: dashboard / design-combine / design / page-chrome / PAGE-TZ-INDEX / orders
- S1: `statCards` all have `destructive` boolean under `as const`

## Out of scope

- Full BI widgets → TZ-DASHBOARD-401
- PHOTO-304 / photos/**
- deploy.ps1
