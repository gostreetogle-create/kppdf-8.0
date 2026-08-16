# TZ-NAV-303: Комбайн → Проект; home = stats route

> Волна: `WAVE-HOME-STATS-COMBINE-TO-DESIGN`.  
> PO: Комбайн — зона проектирования; первая страница — статистика.

РОЛЬ АГЕНТА: Frontend (shell + routes)

ЗАВИСИМОСТИ: нет (перед DASHBOARD-401)

LAYER: 3

CONFLICT KEYS: `frontend/src/app/layout/app-layout.component.ts` ; `frontend/src/app/layout/app-layout.component.spec.ts` ; `frontend/src/app/layout/app-layout.nav-order.spec.ts` ; `frontend/src/app/app.routes.ts` ; deals TOC / group-chips если держат chip «Комбайн» ; `docs/pages/dashboard.page.md` ; `docs/pages/page-chrome.md` ; `docs/pages/PAGE-TZ-INDEX.md`

PAGES: `/` ; `/dashboard` ; `/design/combine` (или выбранный path) ; `/design`  
PAGE_DOCS: dashboard.page.md (stats stub note) ; design/combine page.md (новый или перенос) ; page-chrome.md

CHECKLIST: `docs/agent-checklists/TZ-NAV-303.md`  
REVIEW: required

---

## Domain preflight

| Говорят | Канон |
|---------|--------|
| Комбайн | Канбан заказов (текущий `DashboardPage` / DASHBOARD-400) |
| Проект | Nav category **Проектирование** `id: 'design'`, shortLabel «Проект» |
| Дашборд склада | `/inventory` — **не** трогать label |
| Home | `/` redirect → stats surface |

Проверено: `app-layout` deals `activeAliases: ['/proposals','/dashboard']`; design items только `/design`; brand aria «Комбайн заказов — главная»; routes `'' → dashboard`.

---

## ЧТО ДЕЛАТЬ

1. **Вынести канбан** на route под Проект, напр. `/design/combine` (lazy same component OK). `pageKey: 'orders'` сохранить.
2. **Nav design.items:** добавить «Комбайн» → combine path; entryPath design можно оставить очередь или combine — предпочтение entry = `/design` (очередь), Комбайн вторым пунктом.
3. **Убрать** `/dashboard` из deals `activeAliases` и chip «Комбайн» в Сделки TOC (если есть).
4. **`/dashboard` (и `/` redirect):** временно **stub stats shell** (заголовок «Обзор» / «Дашборд», RU empty/placeholder виджеты или «Скоро» **не** — лучше минимальные счётчики из уже доступных API **если дёшево**, иначе честный empty «Сводка появится» + ссылки). Полные виджеты = **TZ-DASHBOARD-401** — не расползаться.
5. Brand chip: aria/title → «Обзор — главная» (или «Дашборд — главная»); `routerLink="/"` без слова Комбайн.
6. Specs nav-order / layout: highlight Проект на combine; home не deals.
7. Docs + PAGE-TZ-INDEX.

## НЕ

- Переписывать kanban logic / SWEEP-401 write-path  
- Полный BI dashboard (→ 401)  
- inventory rename  
- Deploy  

## BLOCKER / FINDING (from TZ-OPS-SITE-SMOKE-401)

- **S1:** `dashboard-stats.page.ts` — `statCards as const` → TS2339 on `card.destructive` (only overdue has the field).
- **Fix before land (this TZ owns the file):** add `destructive?: boolean` or `destructive: false` on non-overdue cards.
- SITE-SMOKE does **not** implement this fix.

## AC

- [ ] Home ≠ Комбайн; Комбайн в Проект  
- [ ] Brand → home stats  
- [ ] Gates: tsc + app-layout (+ nav-order) specs  
- [ ] READY FOR REVIEW → Cursor PASS → archive  

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern="app-layout" --coverage=false
```
