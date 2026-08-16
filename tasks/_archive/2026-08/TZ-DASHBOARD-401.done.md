# TZ-DASHBOARD-401.done — Home stats виджеты обзора

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-08-16T14:04:17.355Z
closed_by: composer-executor-dashboard-401
TZ: TZ-DASHBOARD-401
WAVE: WAVE-HOME-STATS-COMBINE-TO-DESIGN
DEP: TZ-NAV-303 DONE
Cursor_verdict: PASS (PO-authorized claim+archive+push in this prompt)

verification:
  - acceptance criteria: PASS
  - typecheck: PASS (`cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit`)
  - tests: PASS (`pnpm test -- --testPathPattern="dashboard-stats|dashboard.page" --coverage=false` — 3 suites / 23; dashboard.page untouched PASS)
  - lint: N/A (focused tsc + jest)
  - checklist: UPDATED DONE
  - progress.md: UPDATED
  - status synchronization: PASS
  - deploy: NOT RUN (PO: Deploy NO)

HARD_CONFLICT_HONORED:
  - NOT edited: dashboard.page.ts(+spec), backend/src/modules/order/**, production/**, photos/**

COMMIT: 40d2153c8098496ed5bdbfbf305c9a479774d15a
CLOSEOUT_COMMIT: 40d2153c8098496ed5bdbfbf305c9a479774d15a

## Spec (body)

# TZ-DASHBOARD-401: Home stats — виджеты обзора

> После **TZ-NAV-303**. `/dashboard` (home) = статистика, не канбан.

РОЛЬ АГЕНТА: Frontend (+ BE только если упрётся)

ЗАВИСИМОСТИ: **TZ-NAV-303 DONE**

LAYER: 3

CONFLICT KEYS: `frontend/src/app/pages/dashboard/**` (stats page) ; specs ; `docs/pages/dashboard.page.md`

PAGES: `/dashboard`  
PAGE_DOCS: `docs/pages/dashboard.page.md`

CHECKLIST: `docs/agent-checklists/TZ-DASHBOARD-401.md`  
REVIEW: required

---

## ЧТО ДЕЛАТЬ

1. Заменить stub home на виджеты RU (одна композиция, не 12 карточек):
   - **Заказы:** counts по status (или 4–5 KPI) + link на `/orders` и `/design/combine`.
   - **Склад/материалы:** pulse движений или остатков (reuse list APIs / inventory summary если есть).
   - Опц. **КП** open count.
2. Без редактирования заказов на home (read-only).
3. Loading / empty / error RU.
4. Specs + docs. Если нужен aggregate API → STOP и завести TZ-DASHBOARD-402, не хачить N×list без лимита.

## НЕ

- Канбан на home  
- Deploy  
- PHOTO / catalog expand  

## AC

- [x] Home показывает сводку, не Комбайн  
- [x] Gates tsc + dashboard specs  

## Delivered

- `frontend/src/app/pages/dashboard/dashboard-stats.page.ts` — denser RU overview
- `frontend/src/app/pages/dashboard/dashboard-stats.page.spec.ts` — loading/empty/error/KPI/warehouse/no-kanban
- Orders KPI: GET `/orders` (reuse)
- Warehouse pulse: aggregate GET `/inventory` (no unbounded N×list)
- КП open count: deferred (no aggregate) → optional TZ-DASHBOARD-402
- Docs: `docs/pages/dashboard.page.md` + PAGE-TZ-INDEX
