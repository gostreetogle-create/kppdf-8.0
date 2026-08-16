# Audit: Канбан `/dashboard` vs бизнес-логика заказа (Post-DASHBOARD-400)

**Дата:** 2026-08-16  
**TZ:** `tasks/TZ-SWEEP-401-kanban-order-logic-tails.md`  
**Статус:** GO — хвосты реальные, чинить одним проходом

Проверено: `order.service.ts` (update/ship/cancel/reserveStock/setLineReady/setItemStatus);
`order.schema.ts`; `order.controller.ts`; `dashboard.page.ts`; `orders.service.ts`;
`app.routes.ts`; `app-layout.component.ts`; `deals-group-chips.ts`; `login.page.ts`;
`order-form-dialog.component.ts`; `order-detail.page.ts`; `silent-http.ts`;
`docs/audits/2026-08-15-order-lifecycle-hub.md`.

---

## Вердикт

Канбан повесили на **общий `PATCH /orders/:id {status}`**. Это второй write-path:
обходит `POST /ship` (нет `Shipment`), `POST /cancel` (резервы не снимаются) и
`POST /reserve-stock`. Одновременно freeze состава (ORDERS-336 / PRODUCTION-331)
**блокирует** как раз рабочие дропы `in_production → ready` и `ready → shipped`.
Менеджер либо врёт складу, либо карточка «отпрыгивает» без объяснения.

---

## 1. Стейт-машина vs Drag&Drop

| Переход Канбана | `PATCH {status}` сейчас | Правильный путь |
|---|---|---|
| draft → confirmed | проходит, **без** резерва | коммерческий confirm OK; склад — отдельно `POST /reserve-stock` |
| confirmed → in_production | проходит | OK (нет побочных документов) |
| in_production → ready | **400 freeze** («нельзя менять состав») | должен быть разрешён status-only |
| ready → shipped | **400 freeze** | только `POST /orders/:id/ship` |
| draft/confirmed → shipped | **проходит**, `shipmentIds` пустой | запретить PATCH; только `POST /ship` |
| любой → cancelled | PATCH проходит из draft/confirmed, резервы живы | только `POST /cancel` |

`OrdersService` **не экспортирует** ship/reserve/cancel (комментарий «v1 — only CRUD»).
Канбан физически не может вызвать правильные эндпоинты.

`OrderFormDialog` в draft/confirmed шлёт `status` в том же PATCH вместе с составом —
тот же обход `ship`/`cancel` через выпадающий «Отгружен / Отменён».

**Решение:** один переходный валидатор на бэке; Канбан зовёт PATCH только для
операционных статусов; колонка «Отгружены» — confirm + `POST /ship` (или отказ
с тостом). Freeze состава не трогает status-only PATCH.

## 2. `OrderItem.status` vs `readyForWork`

Это **две разные оси**, не дубль для слияния:

| Поле | Смысл | Где живёт |
|---|---|---|
| `readyForWork` + `readyAt`/`readyByUserId` | гейт «линию можно начинать» (ORDERS-304); только draft/confirmed | `/orders`, карточка заказа, `setLineReady` |
| `items[].status` | ход изделия: pending → in_production → ready → shipped (DASHBOARD-400) | Канбан-селект, `setItemStatus` |

Пересечения-баги:

- Канбан `readinessLabel` **OR**-ит `status∈{ready,shipped}` **и** `readyForWork` — разъезжается с каноном хаба `X из Y = count(readyForWork)` (`2026-08-15-order-lifecycle-hub.md`).
- `setItemStatus` не пишет `readyForWork`; `setLineReady` не пишет `status`.
- `setItemStatus` без стейт-машины: изделие можно поставить `shipped` у черновика.
- `POST /ship` **не** проставляет `items[].status = shipped`.
- `mapItems` при PATCH состава копирует прежний `status`, из DTO поля нет.

**Не сливать поля.** На Канбане считать `X из Y` по `item.status` (fallback ниже).
Список заказов оставить на `readyForWork`.

## 3. Навигация

| Факт | Следствие |
|---|---|
| `/` и login → `redirectTo: 'dashboard'` | домашняя **не** `/materials` |
| логотип `routerLink="/"` aria «На главную» | работает |
| пункта «Дашборд/Комбайн» в топ-меню **нет** | после ухода на Заказы пути назад нет, кроме логотипа |
| Склад уже имеет chip «Дашборд» → `/inventory` | слово «Дашборд» занято |
| `DEALS_TOC_CHIPS` = КП / Договоры / Заказы | Комбайна нет |
| `login.page.ts` L16 комментарий «resolves to /materials» | мёртвый текст |
| `/dashboard` нет в `isDenseWorkspaceUrl` | лишний chrome-зазор |
| Сделки `activeAliases` = только `/proposals` | на Комбайне категория «Сделки» не подсвечена |

## 4. Старые заказы без `items[].status`

Падений нет: FE селект `item.status \|\| 'pending'`; schema default только на **новых**
сабдоках. Чтение старых документов отдаёт `undefined`, не `'pending'`.
Миграция БД не обязательна: graceful fallback + запись поля при первом PATCH.
Не мапить `readyForWork:true` → `status:'ready'` (разный смысл).

## 5. Оптимистичный UI

`OrdersService.update` = `silentPatch` → Observable **никогда не error**.
Канбан:

```ts
subscribe({ next: () => reload(), error: () => reload() })
```

`error` мёртв. `next` не смотрит `res.ok`. Reload всегда, поэтому карточка
в конце концов возвращается, но:

- нет тоста/баннера (канон: ошибка не исчезает);
- `transferArrayItem` мутирует **временный** `filter()`-массив, не SoT;
- эталон отката — TZ-PRODUCTION-333 (snapshot + toast, без слепого reload).

---

## Action items → TZ-SWEEP-401

1. BE: запретить PATCH в `shipped|delivered|cancelled`; status-only вывести из freeze состава; `ship()` пишет `items[].status=shipped`.
2. FE Канбан: операционные колонки → PATCH; «Отгружены» → confirm + `POST /ship`; `res.ok===false` → snapshot revert + toast.
3. `OrdersService.ship` / `.cancel` (тонкие обёртки).
4. Форма заказа: убрать ship/cancel из редактируемого enum.
5. `setItemStatus`: fallback pending; `shipped` только если заказ уже shipped.
6. Канбан `X из Y` = item.status; не трогать HUB-304 `readyForWork`.
7. Chip «Комбайн» в Сделках; alias; RU-копия; починить login-комментарий.
8. Тесты BE+FE; `docs/pages/dashboard.page.md`.

**Не делать в этом проходе:** складской пикер в `reserve-stock`; авто-промоушен заказа из изделий; слияние `readyForWork`; переписывать `/shipping`.
