# TZ-DESK-418: Удалить заказ со стола

PAGES: /desk
PAGE_DOCS: manager-desk.page.md
РОЛЬ АГЕНТА: Frontend UI Engineer
ЗАВИСИМОСТИ: Нет
LAYER: 3
CONFLICT KEYS: frontend/src/app/pages/desk/manager-desk.page.ts; frontend/src/app/pages/desk/manager-desk.page.spec.ts; docs/pages/manager-desk.page.md

Проверено: `orders.page.ts` `onDelete` + `AlertDialogComponent` + `OrdersService.remove`; стол — очередь без delete (`manager-desk.page.ts` ~265–298); API `orders.service.ts:269`.

## ИСХОДНОЕ

PO: удалить заказ с `/desk` (напоминание 2026-08-19). На `/orders` delete есть, на столе — нет. Один write-path: тот же `OrdersService.remove`, не новый endpoint.

## ЧТО ДЕЛАТЬ

ШАГ 1: Рядом с `manager-desk__order-row` — кнопка «Удалить» (`data-test="desk-order-delete"`). `(click)="$event.stopPropagation()"` — не раскрывать ряд.

ШАГ 2: Тот же confirm, что `/orders`: `PiDialogService` + `AlertDialogComponent` (title «Удалить заказ?», destructive). Confirm → `OrdersService.remove` → toast + `listRes.reload()`; если `expandedId` = этот id — сбросить.

ШАГ 3: Jest: кнопка в ряду; клик по delete не зовёт `toggleOrder`. Spec focused.

ШАГ 4: Строка в `manager-desk.page.md` + PAGE-TZ-INDEX.

## ИЗМЕНЯТЬ

Файлы из CONFLICT KEYS + PAGE-TZ-INDEX (строка `/desk`).

## НЕ ИЗМЕНЯТЬ

- `order-hub-tray` / `order-form-panel` (не второй delete)
- Backend orders API
- Гант, Комбайн, notes-delete
- Deploy

## КРИТЕРИИ ПРИЁМКИ

```text
cd frontend && pnpm exec tsc -p tsconfig.app.json --noEmit
cd frontend && pnpm exec jest --config jest.config.js --runInBand --testPathPattern=manager-desk.page.spec
```

- Confirm обязателен; без confirm DELETE нет
- Coupling: N/A (тот же soft-delete заказа, что `/orders`)

known_limitation: browser live — не блокер, если FE :4200 чужой.
