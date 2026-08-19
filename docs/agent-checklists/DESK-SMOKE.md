# DESK smoke — приёмка PO перед deploy

> После DESK-402 + 403 + 411. Copy checklist to agent-checklists on first run.

## Очередь
- [ ] Default = активные (не сотня архивных)
- [ ] Поиск по номеру находит заказ
- [ ] Expand под строкой; scroll не теряет строку

## Заказ
- [ ] Create → остался на /desk, новый expand, F5 сохраняет
- [ ] Битый `?orderId=` → RU ошибка, не white screen
- [ ] Состав lazy-load; supply error только в tray

## Права
- [ ] User без production: нет «Гант» в workflow strip
- [ ] Disabled CTA с понятной RU причиной

## Навигация
- [ ] Workflow strip: КП, Комбайн, Снабжение, Отгрузка
- [ ] Комбайн с orderId; возврат на стол (404 or 407)
- [ ] `/orders` hub всё ещё работает (regression)

## Dark / light
- [ ] Tray gold rail читаем в обеих темах

Pass all → PO «кати» desk wave.
