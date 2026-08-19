# Architect gaps — рабочий стол (обязательно в волне)

> Дополнение к [`2026-08-18-manager-desk-design.md`](./2026-08-18-manager-desk-design.md).  
> То, что PO не спросил, но без этого стол снова станет «неделями ловить баги».

## A. До копирования UI — вынуть общий tray (412)

**Риск:** скопировать `#expandedTpl` из `orders.page` → два места расходятся через месяц.

**Решение:** TZ-DESK-412 **до 403** — extract `order-hub-tray` (или аналог), `/orders` и `/desk` host один компонент. Баг чинится один раз.

## B. Очередь ≠ «все заказы подряд» (410)

На `/orders` уже есть: debounced search, client filter, sort, pagination, readiness «X из Y».

Стол без этого = утром 200 строк и нет «моих срочных».

| Must | Откуда reuse |
|------|----------------|
| Поиск (номер, клиент) | `createSearchState` + toolbar |
| Фильтр во flyout «Фильтр» | status, клиент; default **«Активные»** (как цех: без draft/shipped/cancelled) |
| Сортировка | date desc default |
| Пагинация или «показать ещё» | pi-pagination / orders pipeline |
| «Сводка» flyout | KPI stub → позже: count by status |

## C. Capabilities — не вести в 403 (411)

`pageKey: orders`, но Гantt = `production`, Снабжение = `supply`.

Workflow strip и rail: **скрывать** ссылку без grant, не клик → forbidden.  
CTA по статусу: disabled + **RU-почему** (freeze состава, нет siteId — как production-cockpit).

## D. Lazy-load при expand (403, не забыть)

HUB-303: supply counters, production link, docs — **грузить только на expand**, ошибка изолирована в tray (не ронять очередь).

## E. URL и сессия (402)

| Case | Поведение |
|------|-----------|
| `?orderId=` битый / удалён | RU «Заказ не найден», сброс query, очередь видна |
| F5 с panel + orderId | restore expand + flyout |
| После create | expand нового, **scroll into view**, close flyout |
| Другая вкладка изменила заказ | кнопка «Обновить» в filter/summary; без websocket v1 |

## F. Действия, которые PO забыл явно назвать (403–409)

- **Создать документ** — как `pi-row-actions` на `/orders` (не только flyout «Документы»).
- **КП из заказа** — `/proposals/create?counterpartyId=` при выбранном заказе.
- **Отмена / отгрузка** — confirm RU; ship = целый заказ (COUPLING-MAP).
- **Freeze состава** — при первом shop: та же модалка, что Комбайн (reuse dialog).

## G. UX мелочи, которые ломают доверие

- Expand → **scroll row к верху** viewport очереди (не терять контекст).
- Loading skeleton очереди; empty queue → CTA «Создать» (не пустой экран).
- Ошибка API → toast + **колокольчик** (канон PO).
- Узкий экран: workflow strip wrap; flyout `min(100vw - 1rem)`.

## H. `/orders` не умирает

Дом = `/desk`. `/orders` — реестр для power-user и старых закладок.  
В nav «Заказы» остаётся; в page doc desk — не дублировать hub-фичи молча.

## I. Блокнот 408 — не только UI

- Видимость: **все сотрудники с orders** (цех видит контекст), не private DM.
- Текст может содержать ПДn клиента → не export, retention = как заказ; без email-push.
- Audit: authorId + updatedAt обязательны.

## J. Приёмка PO (smoke, не автотест)

После 402+403, до «кати»:

1. Login → `/desk` → активные заказы (не все 500).
2. Поиск номера → expand → состав виден.
3. Create заказ → остался на столе, новый expand.
4. Workflow → Комбайн с orderId → назад на стол.
5. Роль без production → нет «Гант» в strip (411).
6. F5 на expand+panel → restore.

## K. Волна TZ (дополнение)

| ID | Тема |
|----|------|
| 412 | Extract shared order-hub-tray (**до 403**) |
| 410 | Search/filter/summary pipeline reuse |
| 411 | Capabilities-aware strip + CTA why-disabled |
| 413 | Smoke checklist + page doc acceptance (docs) |

409 остаётся: быстрый add line/module/material.
