# TZ-DESK-430: «Отгружено» без документа — метаданные + блок в tray

**PAGES:** `/desk`  
**PAGE_DOCS:** `manager-desk.page.md` ; `shipping.page.md`  
**РОЛЬ АГЕНТА:** executor  
**ЗАВИСИМОСТИ:** DESK-425 (tray no-nav); BE `POST /orders/:id/ship` уже есть  
**LAYER:** frontend (+ read-only BE verify, без новой сущности)  
**CONFLICT KEYS:** `frontend/src/app/shared/orders/order-hub-tray.component.ts`; `frontend/src/app/pages/desk/manager-desk.page.ts`; `docs/COUPLING-MAP.md` (комментарий если нужен)

**Решение PO (2026-08-23):** отгрузить **можно без документа** (накладной). При нажатии «Отгружено» сохраняются метаданные момента (какой заказ, когда, кто) — из них формируется осмысленный блок «Отгружен» в tray.

**Проверено:** `order.service.ship()` создаёт `Shipment` + `order.status=shipped`; `Shipment.docs` optional; lane=shipped только через POST ship (`COUPLING-MAP`).

---

## ИСХОДНОЕ СОСТОЯНИЕ

- В tray «Логистика» — link на `/shipping`, нет действия «Отгружено» на столе.
- `POST /orders/:id/ship` + `OrdersService.ship()` уже создают запись `Shipment` (number, date, recipient, address, items) **без** обязательного doc.
- Partial ship на `/shipping` уже есть; для desk достаточно **whole-order** ship (omit `items` в body).

## ЧТО ДЕЛАТЬ

### 1. Действие «Отметить отгруженным» (desk only, в tray)

- В disclosure «Логистика и документы», если заказ **не** `shipped|delivered|cancelled`:
  - Кнопка **«Отгружено»** (primary outline, не link).
  - Клик → **PiDialogService confirm** (не смена route): краткая форма с автозаполнением:
    - Заказ: номер (read-only)
    - Клиент / получатель: из `order.counterparty` / site address если есть
    - Адрес: из заказа если есть, иначе пустое поле
    - Дата/время: **now** (read-only display; сервер ставит `createdAt`/`date` shipment)
    - Примечание (optional, → `driverInfo` или `notes` shipment если API принимает; иначе только recipient/address из DTO)
  - Подтверждение → `OrdersService.ship(orderId, { recipient, address, driverInfo? })` — **whole order**, без `items`.
  - Ошибка → toast; успех → toast + reload order list + tray refresh.

### 2. Блок «Отгружен» после ship

- Lazy-load `GET /shipments?orderId=` при expand (как supply counters).
- Если есть shipment(s) или `order.status === 'shipped'`:
  - Компактный блок **«Отгружен»** в logistics disclosure:
    - номер отгрузки (`SHP-…`)
    - дата/время (из `shipment.date` или `createdAt`)
    - кто отметил — **текущий user display name** на момент UI (audit trail на BE если есть; иначе «Вы» + timestamp)
    - строка «Документ не оформлен» если `docs` пуст — **не ошибка**, нормальное состояние
  - **Не** routerLink на `/shipping`; chip «Отгрузка» — для полного реестра (426).

### 3. Контракты (не ломать)

- **Не** PATCH `order.status=shipped` — только `POST …/ship` (`COUPLING-MAP`).
- **Не** требовать doc перед ship.
- Hub mode `/orders` expand — optional parity later; минимум desk `mode="desk"`.

### 4. Destructive guard

- Confirm dialog обязателен: «Отметить заказ {number} отгруженным?» + «Отмена» / «Отгружено».
- Повторный ship для уже shipped → disabled button + статус в блоке.

## ИЗМЕНЯТЬ

- `order-hub-tray.component.ts` (+ spec) — logistics UI, lazy shipments
- `manager-desk.page.ts` — handler ship + dialog
- `docs/pages/manager-desk.page.md`
- `docs/COUPLING-MAP.md` — одна строка: desk manual ship без doc = POST ship, metadata in Shipment

## НЕ ИЗМЕНЯТЬ

- Shipment schema / ship transaction logic (unless DTO missing `notes` — тогда minimal BE field optional, отдельный commit с обоснованием)
- Document constructor flow

## КРИТЕРИИ ПРИЁМКИ

1. Expand заказ → «Отгружено» → dialog → confirm → **остаёмся на `/desk`**, статус заказа shipped.
2. В tray виден блок: номер отгрузки, дата, без документа — текст «Документ не оформлен», не warning.
3. `Shipment` создан в BE (можно проверить через list API или test mock).
4. Frontend tsc + test order-hub-tray manager-desk + lint PASS.

## Финализация

`tasks/_archive/2026-08/TZ-DESK-430.done.md`
