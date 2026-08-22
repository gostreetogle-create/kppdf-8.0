═══════════════════════════════════════════════════════════════
TZ-DESK-401: каркас стола менеджера (fixture)
═══════════════════════════════════════════════════════════════

PAGES: /desk ; /
PAGE_DOCS: manager-desk.page.md ; dashboard.page.md ; page-chrome.md

РОЛЬ АГЕНТА: Frontend. Root TZ, GEMINI.md. Freebuff.

ЗАВИСИМОСТИ: Нет. Спек: docs/superpowers/specs/2026-08-18-manager-desk-design.md
(прочитай целиком до кода).

LAYER: 3

CONFLICT KEYS: frontend/src/app/app.routes.ts; frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts; frontend/src/app/layout/app-layout.component.ts; frontend/src/app/layout/app-layout.component.spec.ts

Проверено: `app.routes.ts` `''` → redirect `dashboard` (`DashboardStatsPage`). Бренд
`nav-brand-home` aria «Обзор — главная» (`app-layout.component.ts` ~344).
`isDenseWorkspaceUrl` (~784) **не** включает `/dashboard` (footer на Обзоре есть).
`/orders` create = `OrderFormDialogComponent` width lg; после save только refresh списка
(~1228). Production: `PiChromeToolsService.setTools` + page `leftTool` flyout overlay.
Десктоп UI заказов нет. Клиент = Counterparty. Unique заказа = `Order.number`.
Fixture 401 **не** пишет API — coupling map N/A (строка стола — в 402).

═══════════════════════════════════════════════════════════════
ЧТО ДЕЛАТЬ
═══════════════════════════════════════════════════════════════

ШАГ 1 — маршрут дома
- Новый standalone `ManagerDeskPage`: `frontend/src/app/pages/desk/manager-desk.page.ts`.
- `app.routes.ts`: `{ path: '', redirectTo: 'desk' }`; `path: 'desk'`, `pageKey: 'orders'`,
  title `KPPDF — Стол`, lazy ManagerDeskPage.
- `/dashboard` **оставить** `DashboardStatsPage` (Обзор). Не удалять комбайн `/design/combine`.
- `isDenseWorkspaceUrl`: добавить точное `/desk` (как `/production`).
- Бренд: aria/title **«Рабочий стол — главная»**; `routerLink="/"` без смены chip-стиля.
  Починить `app-layout.component.spec.ts` (строка «Обзор — главная»).

ШАГ 2 — chrome + центр
- `PiChromeToolsService` owner напр. `manager-desk`; `ngOnDestroy` clearTools.
- Левые tools (RU title/aria): `create` «Создать заказ», `filter` «Фильтр», `summary` «Сводка».
- Fixture **ровно 3** заказа в константе страницы (не HTTP):
  `draft` З-1001 / `in_production` З-1002 / `ready` З-1003; у каждого RU-лейбл клиента
  (строка, не Organization). `data-test="desk-order-row"` + `data-status`.
- Клик по ряду → `selectedId`; правые tools появляются только тогда
  (`data-test="desk-right-tools"` или active на chrome). Иконки: Клиент, Состав, Документы,
  Снабжение (показывать для in_production и ready; скрыть для draft), На Ганте, В комбайне.
- Центр выбранного: номер + статус RU + 2 строки-заглушки состава (текст, не composition-tree).
  `data-test="desk-center-innards"`. Без выбора — empty RU + кнопка «Создать заказ»
  (тот же handler, что left `create`).
- Главная CTA в центре или в шапке innards по статусу fixture: Черновик→«Подтвердить»;
  В производстве→«К отгрузке»; Готов→«Отгрузить». `disabled`. `data-test="desk-primary-cta"`.

ШАГ 3 — flyout
- Один overlay (как production-studio-flyout): backdrop, Esc закрывает.
  Ширина ~360–400px **справа**. Не `PiDialogService`.
- Левые: create / filter / summary. Правые: client / bom / docs / supply.
- Контент 401: H1 RU панели + «Здесь будет форма (после одобрения раскладки)» + «Закрыть».
  `data-test="desk-flyout"` + `data-panel`.
- «На Ганте» / «В комбайне»: `disabled`, title что подключится в DESK-404. Не routerLink.
- Query `orderId`/`panel` в 401 **желательно** (F5); если тяжело — selected только в memory,
  known_limitation в checklist.

ШАГ 4 — gates
```
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm test -- --testPathPattern=manager-desk.page
cd frontend && pnpm test -- --testPathPattern=app-layout.component.spec
```
Spec: 3 ряда; клик → innards + правые действия; create открывает flyout; HttpTestingController
не ждёт `/api/orders`.

═══════════════════════════════════════════════════════════════
ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

Только CONFLICT KEYS + этот page.md уже есть (не плодить второй). PAGE-TZ-INDEX строка /desk.

═══════════════════════════════════════════════════════════════
НЕ ИЗМЕНЯТЬ
═══════════════════════════════════════════════════════════════

- order-form-dialog, orders.page, production-cockpit, dashboard.page (комбайн),
  dashboard-stats.page (логика KPI), desktop/**
- GET/POST orders; встроенный Гант; enableImplicitConversion; pi-input CVA
- deploy

КРИТЕРИИ ПРИЁМКИ
- `/` → `/desk`; бренд aria «Рабочий стол — главная»; `/dashboard` всё ещё Обзор.
- Каркас кликабелен по спек §4–5 без живых данных.
- tsc + focused specs PASS.
- Archive + lock + push. **Стоп.** Не начинать 402 без слова PO «раскладка ок».

known_limitation: CTA/студии disabled; KPI Обзора не во flyout; состав не tree.
