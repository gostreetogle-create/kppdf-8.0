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

- [ ] Home показывает сводку, не Комбайн  
- [ ] Gates tsc + dashboard specs  
