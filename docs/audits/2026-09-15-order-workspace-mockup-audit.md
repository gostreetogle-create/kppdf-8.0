# Audit — Order workspace mockup → NX `/orders/:id` (2026-09-15)

> Макет: `data/erp-заказ-kppdf-8.0-—-макет-_orders__id.zip` → `data/_tmp-maket-order-id/`  
> Скрины PO: вложение к чату 2026-09-15 (не SoT «1:1»).  
> Peer/канон связей: `docs/audits/2026-09-15-ui-related-display-peer-verdict.md`  
> Живой NX: thin `order-detail.page.ts` + hub tray groups.

## Вердикт (золотая середина)

**Берём из макета:** блочную IA (шапка → состав → исполнение → логистика → документы), плотность секций с hairline/`bg-paper-2`, dual CTA «строки заказа» vs «каталог SoT», freeze-баннер, workflow-chips с `orderId`, явные deep-link на живые разделы, editable состав на странице заказа (не только в hub).

**Не берём:** второй Header/L/R rail (у нас уже shell), scenario-switcher «Черновик/Empty/…», cream/stone Tailwind «AI Studio», подписи «БЛОК A/B/C» в UI, фейковый audit log, ячейки склада, прогресс-бары участков без API, unitPrice/суммы если strip-commerce на create, toast-only Save без PATCH, DeepLinkNoticeModal вместо `routerLink`, произвольный free-select всех lifecycle статусов (канон: draft→confirmed руками; дальше — процессы/ship).

**Стиль NX:** Paper & Ink (`bg-paper`, `hairline`, `pi-outline-btn`, `PiStatusBanner`, `font-display` на h1, eyebrow `Сделки`). Ритм как hub tray / registries — **не** dashboard-карточки 5 метрик.

## Сейчас vs цель

| | Сейчас `/orders/:id` | Цель workspace |
|--|---------------------|----------------|
| Шапка | eyebrow + номер + banner | + заказчик/объект/фирма/КП + оплата + CTA confirm/cancel + назад |
| Состав | flat name×qty | add/qty/delete/ready + composition-tree + freeze + dual CTA |
| Исполнение | нет | счётчики supply + kit-reserve + deficit **если API** + deep-link Гант/Снабжение |
| Логистика | нет | резервы + ship/cancel (reuse dialogs hub) |
| Документы | нет | deep-link шаблоны; список студии — если есть API, иначе empty honest |
| Shell | — | только `setTools` живые; без своего L/R |

## KEEP / CUT / MAP

### KEEP (IA + поведение)

1. Секции: **Шапка · Состав · Исполнение · Логистика · Документы** (те же 4 группы, что hub).
2. Крошки: `Сделки` → список Заказы → `Заказ №…` (eyebrow/h1 паттерн NX; не длинный «Главная/КП/…» path в breadcrumb — chips отдельно).
3. Workflow chips: Главная · КП · Гант · Снабжение · Отгрузка · (текущий Заказ active).
4. Dual CTA состава: правка **линий заказа** vs открыть изделие в **каталоге**.
5. Freeze UI когда статус/бизнес запрещает правку линий.
6. Kit-reserve / Отгружено / Отменить отгрузку — reuse существующих dialogs.
7. Stop-factor дефицита — **только** при честном short из kit-availability / supply; иначе не рисовать.

### CUT (макет-демо / шум)

1. HeaderRail + LeftHistoryRail + RightPageToolsRail макета.
2. Scenario tabs (Draft/Empty/Frozen/…) — это demo chrome.
3. Audit timeline без backend SoT.
4. «Ячейки склада» (канон: без ячеек).
5. Board-lane progress % / man-hours мини-канбан на карточке — deep-link Комбайн/Гант.
6. Цены/суммы в таблице состава как обязательный столбец (create strip-commerce; не возвращать магазин на карточку без PO).
7. Подписи «БЛОК B. …» — в UI только короткое «Состав», «Исполнение»…
8. Сводка «Итого ₽» в правом рейле макета.
9. Произвольный dropdown всех статусов → только разрешённые PATCH + ship/cancel.

### MAP → живые API / сущности

| UI | API / сущность |
|----|----------------|
| Order + status/paid/dates | `GET/PATCH /api/orders/:id` |
| Counterparty / Site / Org | populate на Order + link `/counterparties`, sites |
| КП | `quotationId` → `/studio?quotationId=` или «Без КП» |
| Линии add/qty/delete | `PATCH` items (UpdateOrderDto ← Create items) |
| readyForWork | `PATCH …/items/:lineIndex/ready` |
| Дерево состава | `GET /products/:id/tree` + `pi-composition-tree` |
| Supply counters / list | `PiSupplyRequestsService.list({orderId})` |
| Kit-reserve | existing confirm dialog + kit-availability |
| Reservations | `list({orderId: Order.number})` |
| Ship / cancel | `PiOrdersService.ship` / cancelShipment |
| Docs templates | `/doc-constructor/templates?source=order&sourceId=` |
| Cancel order | soft delete или status cancelled — **только** существующий BE path |

## Модульная архитектура (как decomp B1–B10)

**Не** раздувать god-`order-detail.page.ts`. Сразу:

```
apps/kppdf-web/.../orders/
  order-detail.page.ts          # thin: providers + layout slots + setTools
  order-detail.page.spec.ts

libs/features/src/lib/order-workspace/   # NEW secondary path
  index.ts
  order-workspace.facade.ts     # Signals; page-scoped providers NOT root
  ui/
    order-ws-header.component.ts
    order-ws-composition.component.ts
    order-ws-execution.component.ts
    order-ws-logistics.component.ts
    order-ws-documents.component.ts
    order-ws-workflow-chips.component.ts
```

- Reuse `@kppdf/features/order-hub` dialogs (kit-reserve, ship) — не копировать.
- Hub tray на `/home` и `/orders` list **не ломать**; workspace = углубление карточки.
- Import: `@kppdf/features/order-workspace`. No new Nx project.

## Editable on-page vs deep-link

| On-page (write) | Deep-link (работа в разделе) |
|-----------------|------------------------------|
| isPaid, plannedDate (если PATCH) | Полный Гант / estimate bars |
| draft→confirmed | Комбайн boardLane |
| cancel order (confirm) | Снабжение Excel/OPS bulk |
| items add/qty/delete/ready | Склад движения |
| kit-reserve, ship, cancel-ship | Студия редактор документа |
| выбор заказчика/объекта (если PATCH) | — |

## Риски

1. God-page если секции не вынести в features с первого TZ.
2. Dual write-path если копировать ship/kit из tray вместо reuse.
3. Fake deficit/audit = недоверие на демо (PO-CANON).
4. Параллель с B10 thin — один `nx build kppdf-web`; очередь после `_active` пуст.

## Next

Pack: `tasks/_ready/2026-09-15-order-workspace/` · tracker `docs/agent-checklists/WAVE-NX-ORDER-WORKSPACE.md`.
