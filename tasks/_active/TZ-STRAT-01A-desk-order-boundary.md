# TZ-STRAT-01A — безопасно убрать cross-page imports между `/desk` и `/orders`

## ЦЕЛЬ:
Устранить только два нарушения architecture:check:

- frontend/src/app/pages/desk/manager-desk.page.ts → order-form-panel.component.ts
- frontend/src/app/pages/desk/manager-desk.page.ts → order-hub-tray.component.ts

Поведение `/desk` и `/orders` менять нельзя.

## ИСХОДНЫЕ ФАКТЫ:
- ManagerDeskPage большой файл, но его полную декомпозицию в этой задаче делать нельзя.
- OrderFormPanel и OrderHubTray уже используются и на `/orders`, и на `/desk`.
- Сейчас они находятся в pages/orders, поэтому `/desk` нарушает архитектурную границу.
- В проекте нет разрешения придумывать второй write-path.
- В проекте нет подтверждённого общего каталога `shared/features/orders`. Сначала проверь существующие conventions.
- Shared-компоненты не должны импортировать pages/*. Проверь все транзитивные импорты до перемещения.

## РАЗРЕШЁННЫЕ CONFLICT KEYS:
- frontend/src/app/pages/desk/manager-desk.page.ts
- frontend/src/app/pages/desk/manager-desk.page.spec.ts
- frontend/src/app/pages/orders/orders.page.ts
- frontend/src/app/pages/orders/orders.page.spec.ts
- frontend/src/app/pages/orders/order-form-dialog.component.ts
- frontend/src/app/pages/orders/order-form-panel.component.ts
- frontend/src/app/pages/orders/order-form-panel.component.spec.ts
- frontend/src/app/pages/orders/order-hub-tray.component.ts
- frontend/src/app/pages/orders/order-hub-tray.component.spec.ts
- frontend/src/app/pages/orders/order-composition-forest.ts
- frontend/src/app/pages/orders/open-catalog-composition-edit.ts
- только новые/перемещённые файлы общего order-слоя, если они необходимы
