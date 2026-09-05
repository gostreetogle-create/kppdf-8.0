# TZ-NX-DEALS-D2-HUB-TRAY: expand заказа = рабочее место сделки

**SIZE:** L
**РОЛЬ:** Executor (frontend-nx; BE APIs уже есть)
**LAYER:** 2–3
**PAGES:** orders
**PACK:** WAVE-NX-DEALS D2
**PAGE_DOCS:** `docs/pages/orders.page.md`
**ЗАВИСИМОСТИ:** D1 (chrome) — done; legacy `order-hub-tray.component.ts` **mode hub only**
**CONFLICT KEYS:** `frontend-nx/.../orders/order-hub-tray*.ts`; `orders-list.page.ts` (+ spec); `libs/data-access/src/lib/sales` (reservations client, new); IMPLICIT `nx build kppdf-web`

## ЧТО СДЕЛАНО

1. **Новый data-access client** `PiReservationsService` (`libs/data-access/src/lib/sales/pi-reservations.service.ts` + `reservation.types.ts`) — read-only `GET /reservations?orderId=` (backend endpoint уже существовал, `reservation.controller.ts`; NX-клиента не было). `orderId` — строка `Order.number` (не `_id`), как задокументировано в legacy.
2. **Снабжение** переиспользует существующий `PiSupplyRequestsService.list({orderId})` — NX-эволюция legacy supply-tasks, без нового клиента.
3. **Композиция** переиспользует существующие `PiCompositionService.getProductTree` + `pi-composition-tree` (`pages/composition/`) — read-only (компонент не поддерживает pencil-edit вообще, что естественно совпадает с ограничением TZ «Write из expand запрещён»).
4. **Новый `order-hub-tray.component.ts`** (hub-only — без confirm/ship/add-line/notebook/cancel-shipment). 4 группы точно по PO visual lock (`orders.page.md` § Визуальная иерархия expand): Заказ (disclosure «Состав заказа», per-line `pi-composition-tree`, lazy на первый toggle + кэш) → Исполнение (Снабжение + Производство deep-link + Готовность X/Y) → Логистика (Склад + Отгрузка) → Документы (deep-link). Supply+reservations грузятся сразу на expand строки (row-lazy budget: 2 http), не за отдельным под-тумблером.
5. **`orders-list.page.ts`**: колонки Дата + Готовность добавлены; клик строки (мышь/Enter/Space, a11y-корректно — `tabindex`, `keydown.enter/space`) переключает single-expand tray; клик «Карточка» не триггерит expand (`stopPropagation`); `load()` сбрасывает `expandedId`.
6. Docs: `docs/pages/orders.page.md` — новая секция «NX order hub tray (D2)» + обновлённый список колонок списка.

## НЕ (соблюдено)

`/desk` route, второй tray-шаблон, Gantt/studio scope, BE freeze/status graph, Комбайн-strip — не портированы, как требовал TZ.

## Сбои (проверено)

1. Expand A → Expand B: single-expand модель — тумблер снимает предыдущий id, новый компонент `OrderHubTrayComponent` монтируется заново под каждую строку (Angular `@if` пересоздаёт instance) — гонки старого HTTP-ответа с новым instance не бывает по конструкции (нет общего state между инстансами); внутри одного instance добавлен `takeUntilDestroyed`.
2. Нет supply-tasks → «Нет задач снабжения» (empty copy), не crash — покрыто тестом.
3. Заказ без items → «—» readiness, «Состав пуст», без http на `getProductTree` — покрыто тестом.

## AC — результат

1. ✅ Клик строки `/orders` (мышь/Enter/Space) раскрывает 4 группы с данными/ссылками.
2. ✅ Нет desk-write кнопок в DOM hub (dedicated spec assertion).
3. ✅ Inset: `p-4`/`gap-4` внутри групп.
4. ✅ Gates: focused tests + `nx build kppdf-web` PASS.
5. ✅ Docs orders.page.md — NX hub notes добавлены.

## Gates (факт)

```
pnpm exec nx test data-access --testPathPattern=pi-reservations → PASS (3/3)
pnpm exec nx test kppdf-web --testPathPattern="order-hub-tray" → PASS (10/10)
pnpm exec nx test kppdf-web --testPathPattern="orders-list.page.spec" → PASS (7/7, вкл. 3 новых hub-expand теста)
pnpm exec nx lint kppdf-web → 2 a11y ошибки найдены/исправлены в orders-list.page.ts (tabindex + keydown.enter/space) → 0 в touched files
pnpm exec nx build kppdf-web → PASS, exit 0
```

ARCHIVE_MARKER
outcome: DONE
closed_at: 2026-09-05
closed_by: claude
verification:
  - acceptance criteria: PASS
  - typecheck: PASS (nx build kppdf-web)
  - tests: PASS (data-access + kppdf-web focused specs, 20 new tests total)
  - lint: PASS (2 introduced a11y errors fixed same session; no other new errors in touched files)
  - checklist: ADDED (docs/agent-checklists/TZ-NX-DEALS-D2-HUB-TRAY.md)
  - progress.md: N/A (captured in checklist + page.md per token-budget policy)
  - status synchronization: PASS
