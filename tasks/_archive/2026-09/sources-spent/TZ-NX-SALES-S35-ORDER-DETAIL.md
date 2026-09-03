# TZ-NX-SALES-S35-ORDER-DETAIL: карточка заказа + оплата

**РОЛЬ:** Executor (frontend-nx)  
**LAYER:** 3 · **PAGES:** `/orders/:id`  
**PAGE_DOCS:** `docs/pages/orders.page.md`  
**ЗАВИСИМОСТИ:** S31, S33, S34  
**CONFLICT KEYS:** `frontend-nx/apps/kppdf-web/src/app/pages/orders/`

## BUILD INTEGRITY

IMPLICIT CONFLICT: nx build kppdf-web (последний gate).

## Domain preflight

Оплата на заказе. КП опционален. Нет кнопки заглушки.

Сбои: (1) 404 — banner; (2) PATCH оплаты упал — тост, isPaid не врёт; (3) нет quotationId — текст «Без КП», не кнопка «создать заглушку».

## ЧТО ДЕЛАТЬ

1. Route `:id` → `order-detail.page.ts`.
2. Показать: номер, статус, клиент если есть в payload, список позиций (имя × qty), chip КП или «Без КП».
3. Переключатель **Оплачен** → `ordersApi.update(id, { isPaid })`.
4. Со списка S34 — ссылка на карточку.
5. **Запрет:** любой вызов `/stub-proposal`.
6. Если есть `quotationId` — кнопка «КП в студии» по паттерну proposals-list (`studioDocumentId` / query), без создания stub.
7. spec: нет `stub-proposal` в шаблоне; paid toggle шлёт PATCH.

## ИЗМЕНЯТЬ

- `pages/orders/*`
- `orders.routes.ts` / `app.routes.ts` если `:id` ещё нет

## НЕ ИЗМЕНЯТЬ

- convert-to-order (S37), create form (S36)
- склад / отгрузка / Гант

## КРИТЕРИИ ПРИЁМКИ

- [ ] Карточка читает GET /orders/:id
- [ ] Оплата PATCH; без КП — без stub CTA
- [ ] `nx build kppdf-web` PASS последним

## Archive

`tasks/_archive/2026-09/TZ-NX-SALES-S35-ORDER-DETAIL.done.md`
