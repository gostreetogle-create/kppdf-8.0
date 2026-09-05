# TZ-NX-DEALS-D2-HUB-TRAY checklist

> Status: **READY FOR REVIEW**
> Marker: `tasks/_active/TZ-NX-DEALS-D2-HUB-TRAY.md`
> Commit/push: по `docs/GIT-POLICY.md`

## Claim slot

- agent_id: claude
- claimed_at: 2026-09-05T00:30:00Z
- workspace: D:\kppdf-8.0
- team_room_claim: unavailable (no CLI in this session)

## Preflight

- [x] Get-Location + git rev-parse --show-toplevel → оба `D:\kppdf-8.0`
- [x] Прочитал `_NOW.md` + `tasks/_active/` — нет чужого CLAIM на deals-ключи
- [x] TZ / канон / deps прочитаны: `tasks/_ready/nx-deals/TZ-NX-DEALS-D2-HUB-TRAY.md`, legacy `frontend/src/app/shared/orders/order-hub-tray.component.ts`, `docs/pages/orders.page.md` § HUB-30x + § Визуальная иерархия expand (PO visual lock 2026-08-15)
- [x] Claim slot заполнен; Status = CLAIMED / IN PROGRESS
- [x] `tasks/_active/TZ-NX-DEALS-D2-HUB-TRAY.md` на месте

## Acceptance

- [x] Клик строки `/orders` (или Enter/Space) раскрывает 4 группы с данными/ссылками (Заказ · Исполнение · Логистика · Документы)
- [x] Нет desk-write кнопок в DOM hub (confirm/ship/add-line/notebook/cancel-shipment/create-document — verified by dedicated spec assertion)
- [x] Inset: `p-4`/`gap-4` внутри групп, ничего не прилипает к hairline-рамке
- [x] Gates: focused tests + `nx build kppdf-web` PASS
- [x] Docs `orders.page.md` — NX hub DONE notes добавлены

## Integrity slot

- [x] Тип изменения: page + новый data-access client (read-only)
- [x] FIC: page.md обновлён (см. выше); остальные §FIC N/A (нет permission/RBAC/MCP изменений)
- [x] page.md / PAGE-TZ-INDEX: `docs/pages/orders.page.md` обновлён (новая секция NX order hub tray + список колонок)
- [x] SECTION-READINESS N/A
- [x] Чужой WIP не в коммите — Freebuff registries/work-types WIP не staged
- [x] Coupling map N/A — «Готовность»/`readyForWork` уже задокументировано в `COUPLING-MAP.md` из legacy HUB-30x работы, не менял смысл поля, только читаю
- [x] Канон: docs/DOCS-INTEGRITY.md соблюдён

## Build integrity

- [x] Baseline: `nx build kppdf-web` PASS (D1 baseline уже чистый)
- [x] Нет другого `tasks/_active/*` с пересекающимися путями (`pages/orders/**`, `libs/data-access/src/lib/sales/**`) — только G14 (production, не пересекается)
- [x] Закрытие: `nx build kppdf-web` — последняя команда, exit 0

## Gates (факт)

```
cd frontend-nx
pnpm exec nx test data-access --testPathPattern=pi-reservations → PASS (3/3, новый клиент)
pnpm exec nx test kppdf-web --testPathPattern="order-hub-tray" → PASS (10/10, новый компонент)
pnpm exec nx test kppdf-web --testPathPattern="orders-list.page.spec" → PASS (7/7, вкл. 3 новых hub-expand теста)
pnpm exec nx lint kppdf-web → 2 новые ошибки a11y найдены и исправлены (tabindex + keydown.enter/space на строке) → 0 ошибок в touched files после фикса
pnpm exec nx build kppdf-web → PASS, exit 0
```

## Executor report

- Новый data-access client: `PiReservationsService` + `Reservation`/`ReservationsListParams` типы (`libs/data-access/src/lib/sales/`), т.к. в NX не было клиента для backend `reservation.controller.ts` (эндпоинт уже существовал). `orderId` фильтр — строка = `Order.number` (не `_id`), как в legacy и в схеме backend (`Reservation.orderId: string`).
- Снабжение переиспользует уже существующий `PiSupplyRequestsService.list({orderId})` (NX-эволюция legacy `SupplyTaskService`, тот же орднеровый фильтр) — новый клиент не понадобился.
- Композиция переиспользует уже существующий `PiCompositionService.getProductTree` + `pi-composition-tree` component (`pages/composition/`) — тоже не пришлось строить с нуля; этот путь read-only (без editClick/pencil-edit — компонент в NX и не поддерживает запись, что естественно совпадает с требованием TZ «Write из expand запрещён»).
- Новый `order-hub-tray.component.ts` (`pages/orders/`) — hub-only, 4 группы (Заказ / Исполнение / Логистика / Документы) точно по PO visual lock из `orders.page.md`. Supply+reservations грузятся сразу на expand строки (row-lazy); композиция — лениво по первому клику на «Состав заказа», с кэшем (повторный toggle не рефетчит).
- `orders-list.page.ts`: добавлены колонки Дата + Готовность; клик строки (мышь/Enter/Space) переключает single-expand `app-order-hub-tray`; клик «Карточка» не триггерит expand (`stopPropagation`); `load()` сбрасывает `expandedId`.
- **Known limits (по TZ «НЕ»):** не портированы `/desk` mode, второй tray-шаблон, Gantt/studio scope, BE freeze/status graph — как и требовал TZ. «Комбайн-strip» тоже не включён.
- Conflict disclosure: чужой WIP Freebuff (`tasks/_active/TZ-NX-REGISTRIES-WORK-TYPES.md`, `pages/registries/**`) в дереве, не staged, не трогал.

## Review handoff

- [x] READY FOR REVIEW — WAVE-NX-DEALS
- Archive без отдельного Cursor Verdict (Executor-only wave, как D1)

## Closeout

- archive сразу вслед за отчётом — переходим к D3.
