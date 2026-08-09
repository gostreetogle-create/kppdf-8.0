# Страница «КП» (Коммерческие предложения) — TZ-SALES-301

## Назначение

Тонкий UI (thin end-to-end) для создания и просмотра КП (Proposal/Quote).
Первая волна цепочки `shop-customer-lifecycle` (см. `docs/compose/plans/2026-08-02-shop-customer-lifecycle.md`, §S1 «КП»).

**Ключевое решение (аудит перед стартом):** новый `proposal/`-модуль backend НЕ создавался —
используется **существующий `QuotationModule`** (`backend/src/modules/quotation/`, зарегистрирован в
`app.module.ts:204`). Один API, без дублей. Фронтенд-обёртка: `frontend/src/app/shared/services/pi-proposals.service.ts`.

## Маршрут и доступ

- Route: `/proposals` (`frontend/src/app/app.routes.ts`) — `canMatch: [authGuard, adminOnlyRouteGuard]`.
  Мутации КП на backend — `@Roles('admin','manager')`, чтение доступно `user`.
- Навигация: раздел **«Сделки» → «КП»** (`app-layout.component.ts`), между «Организации» и «Договоры».
- Workspace chrome: тёмный TOC **КП | Договоры | Заказы** и жёлтые подchips **Создать КП | Все КП**. `Все КП` активен на этом route; create ведёт на `/proposals/create`.


## Backend-контракт (QuotationModule, не изменялся в SALES-301)

| Endpoint | Метод | Назначение |
|---|---|---|
| `/quotations` | GET | Плоский массив `Quotation[]` (без envelope), `populate` по `counterpartyId`/`organizationId`/`items.productId`, сортировка `{date: -1}` |
| `/quotations/:id` | GET | Одна КП |
| `/quotations` | POST | Создание (`CreateQuotationDto`: `organizationId`, `counterpartyId`, `items[]`) |
| `/quotations/:id` | PATCH | Обновление |
| `/quotations/:id/duplicate` | POST | Копия в статусе `draft` |
| `/quotations/:id/convert-to-contract` | POST | КП → Договор |
| `/quotations/:id/convert-to-order` | POST | КП → Заказ (TZ-ORDERS-301: требует `status === 'accepted'`, strip-commerce) |
| `/quotations/:id` | DELETE | Мягкое удаление (`deletedAt`) |

## Иммутабельность (plan §S1)

КП сохраняет **snapshot** `productName`/`productSku` на момент создания. При изменении каталога
(переименование товара) КП НЕ меняется: display-слой читает inline-snapshot из
`items[].productName/productSku`, а не делает `$lookup` на актуальный Product.
`create()`/`update()` в `quotation.service.ts` записывают снапшот вербатим из DTO
(unit-тесты: `quotation.service.spec.ts` — «stores the productName/productSku SNAPSHOT verbatim»,
«NO-MUTATION-ON-CATALOG-CHANGE»).

## UI-структура

- **Список** (`proposals.page.ts`): `pi-table` с колонками Номер / Дата / Контрагент / Статус (бейдж) /
  Позиций / Сумма. Клиентская сортировка (status-cycle index), поиск (номер/название/контрагент),
  слайс-пагинация по 20 (плоский массив — страница владеет пайплайном, паттерн OrdersPage).
- **Диалог** (`proposal-form-dialog.component.ts`): `variant="form"` + `width="lg"`, sticky footer
  (PiDialog contract). Секции: стороны (организация/контрагент), реквизиты (номер/название/даты/статус/скидка),
  **позиции** (picker товара из `ProductsService` + кол-во + цена; `productName`-снапшот авто-заполняется
  при выборе товара), заметки. Требует ≥1 позиции (как Order/Contract dialogs).

## Тесты

- Backend: `backend/src/modules/quotation/quotation.service.spec.ts` (create snapshot, no-mutation,
  list/get, update-total, duplicate; convert-тесты ORDERS-301).
- Frontend: `pi-proposals.service.spec.ts` (HttpTestingController lifecycle, включая convertToOrder),
  `proposals.page.spec.ts` (loading/error/empty, dialog-открытия, статус-бейджи, сортировка/пагинация).

## Связанное

- TZ-SALES-301 — эта страница. Succcessor: **TZ-ORDERS-301** (quote → order conversion,
  кнопка «В заказ» на странице КП, enabled при `status === 'accepted'`).
- Паттерны: OrdersPage (`pages/orders/orders.page.ts`), ContractFormDialog, OrderFormDialog.
- Документация плана: `docs/compose/plans/2026-08-02-shop-customer-lifecycle.md`.
